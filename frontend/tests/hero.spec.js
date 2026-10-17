import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const chapters = (page) => page.locator('[data-chapter]');
const video = (page) => page.locator('video');

test('four chapters serve the photographs in order with no carousel or account actions', async ({ page, request }) => {
  await page.goto('/');
  await expect(chapters(page)).toHaveCount(4);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your health history, beautifully connected.');
  const images = page.locator('[data-chapter] img');
  await expect(images).toHaveCount(3);
  for (let i = 0; i < 3; i += 1) {
    const image = images.nth(i);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
    const url = await image.getAttribute('src');
    expect(url).toContain(`hero_0${i + 1}_image`);
    const response = await request.get(url);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/jpeg');
  }
  await expect(images.first()).toHaveAttribute('loading', 'eager');
  await expect(images.first()).toHaveAttribute('fetchpriority', 'high');
  await expect(page.locator('[aria-roledescription="carousel"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /previous|next|slideshow|photograph/i })).toHaveCount(0);
  await expect(page.getByText('Create your account')).toHaveCount(0);
  await expect(page.getByText('Log in', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Illustrative preview. All names and values are fictional.')).toBeVisible();
});

test('Explore supports keyboard activation and scrolls/focuses the records section', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Explore HealthTrac' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#records')).toBeFocused();
  await expect(page).toHaveURL(/#records$/);
  expect(await page.locator('#records').evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThan(30);
});

test('poster is served and video is deferred until near its closing chapter', async ({ page, request }) => {
  const requests = [];
  page.on('request', (req) => { if (req.url().includes('.mp4')) requests.push(req.url()); });
  await page.goto('/');
  await expect(video(page)).not.toHaveAttribute('src');
  expect(requests).toHaveLength(0);
  const poster = await video(page).getAttribute('poster');
  expect(poster).toContain('hero_video_poster');
  const response = await request.get(poster);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/jpeg');
  await page.locator('[data-chapter="video"]').evaluate((node) => {
    window.scrollTo(0, node.getBoundingClientRect().top + scrollY - innerHeight - 200);
  });
  await expect(video(page)).toHaveAttribute('src', /hero_video.*\.mp4$/);
  await expect(video(page)).toHaveJSProperty('paused', true);
});

test('muted inline video has pause/resume and pauses offscreen without forgetting manual pause', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-chapter="video"]').scrollIntoViewIfNeeded();
  await expect(video(page)).toHaveJSProperty('muted', true);
  await expect(video(page)).toHaveJSProperty('playsInline', true);
  await expect(video(page)).toHaveJSProperty('loop', false);
  await expect.poll(() => video(page).evaluate((node) => node.currentTime)).toBeGreaterThan(.2);
  await page.getByRole('button', { name: 'Pause video' }).click();
  await expect(video(page)).toHaveJSProperty('paused', true);
  const stoppedAt = await video(page).evaluate((node) => node.currentTime);
  await page.waitForTimeout(350);
  expect(await video(page).evaluate((node) => node.currentTime)).toBeCloseTo(stoppedAt, 1);
  await page.locator('h1').scrollIntoViewIfNeeded();
  await page.locator('[data-chapter="video"]').scrollIntoViewIfNeeded();
  await expect(video(page)).toHaveJSProperty('paused', true);
  await page.getByRole('button', { name: 'Play video' }).click();
  await expect(video(page)).toHaveJSProperty('paused', false);
  await page.locator('h1').scrollIntoViewIfNeeded();
  await expect(video(page)).toHaveJSProperty('paused', true);
});

test('reduced motion shows poster with no video request until explicit play', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests = [];
  page.on('request', (req) => { if (req.url().includes('.mp4')) requests.push(req.url()); });
  await page.goto('/');
  await page.locator('[data-chapter="video"]').scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Play video' })).toBeVisible();
  await expect(video(page)).not.toHaveAttribute('src');
  expect(requests).toHaveLength(0);
  await page.getByRole('button', { name: 'Play video' }).click();
  await expect(video(page)).toHaveAttribute('src', /hero_video.*\.mp4$/);
  await expect.poll(() => video(page).evaluate((node) => node.currentTime)).toBeGreaterThan(.1);
  await page.getByRole('button', { name: 'Pause video' }).click();
  await expect(video(page)).toHaveJSProperty('paused', true);
});

test('failed video keeps the chapter, poster and manual retry control', async ({ page }) => {
  await page.route('**/hero_video-*.mp4', (route) => route.abort());
  await page.goto('/');
  await page.locator('[data-chapter="video"]').scrollIntoViewIfNeeded();
  await expect(page.getByRole('status')).toContainText(/video|playback/i);
  await expect(page.getByRole('button', { name: 'Play video' })).toBeVisible();
  await expect(video(page)).toHaveAttribute('poster', /hero_video_poster/);
  await expect(page.getByRole('heading', { name: /More room/ })).toBeVisible();
});

for (const [name, width, height] of [
  ['desktop', 1440, 960], ['laptop', 1024, 768], ['tablet', 768, 1024],
  ['mobile', 390, 844], ['small-mobile', 320, 740],
]) {
  test(`${name}: distinct scroll positions, no overflow and screenshots`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    mkdirSync('artifacts', { recursive: true });
    let previousBottom = 0;
    for (const [index, section] of (await chapters(page).all()).entries()) {
      await section.scrollIntoViewIfNeeded();
      const image = section.locator('img');
      if (await image.count()) await expect.poll(() => image.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
      const bounds = await section.evaluate((node) => {
        const r = node.getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY };
      });
      expect(bounds.top).toBeGreaterThanOrEqual(previousBottom - 1);
      previousBottom = bounds.bottom;
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      await section.screenshot({ path: `artifacts/introduction-${name}-${index + 1}.png` });
    }
    expect(await page.locator('.ht-record').evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    const control = await page.getByRole('button', { name: 'Play video' }).boundingBox();
    expect(control.height).toBeGreaterThanOrEqual(44);
    expect(control.x).toBeGreaterThanOrEqual(0);
    expect(control.x + control.width).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `artifacts/introduction-${name}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
}
