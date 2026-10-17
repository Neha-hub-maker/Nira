import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const headline = 'Your health history, beautifully connected.';
const slide = (page) => page.locator('.ht-hero__indicator[aria-current="true"]');
const video = (page) => page.locator('video');

test('production media URLs serve the originals; first photo is eager and video is deferred', async ({ page, request }) => {
  const videoRequests = [];
  page.on('request', (req) => {
    if (/\.mp4(?:\?|$)/.test(req.url())) videoRequests.push(req.url());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(headline);
  await expect(page.locator('img').first()).toHaveAttribute('loading', 'eager');
  await expect(page.locator('img').first()).toHaveAttribute('fetchpriority', 'high');
  await expect(video(page)).not.toHaveAttribute('src');
  expect(videoRequests).toHaveLength(0);
  for (const image of await page.locator('img').all()) {
    const url = await image.getAttribute('src');
    const response = await request.get(url);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/jpeg');
    await expect(image).toHaveJSProperty('naturalWidth', Number(await image.getAttribute('width')));
  }
  // Until the real application destinations are supplied, there are no fake links.
  await expect(page.getByRole('button', { name: 'Create your account' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Log in', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Show video, 4 of 4' }).click();
  await expect(video(page)).toHaveAttribute('src', /hero_video.*\.mp4$/);
  const response = await request.get(await video(page).getAttribute('src'));
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('video/mp4');
});

test('six-second image order, stationary copy and remaining pause time', async ({ page }) => {
  // Freeze before navigation so network/decode time cannot consume the first slide.
  await page.clock.install({ time: new Date('2026-10-17T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-17T00:00:01Z'));
  await page.goto('/');
  const headingBox = await page.locator('h1').boundingBox();
  const actionsBox = await page.locator('.ht-hero__actions').boundingBox();
  await page.clock.runFor(5900);
  await expect(slide(page)).toHaveAccessibleName('Show photograph 1, 1 of 4');
  await page.clock.runFor(200);
  await expect(slide(page)).toHaveAccessibleName('Show photograph 2, 2 of 4');
  await page.clock.runFor(400);
  await page.getByRole('button', { name: 'Pause background slideshow' }).click();
  await page.clock.runFor(20_000);
  await expect(slide(page)).toHaveAccessibleName('Show photograph 2, 2 of 4');
  await page.getByRole('button', { name: 'Play background slideshow' }).click();
  await page.clock.runFor(5600);
  await expect(slide(page)).toHaveAccessibleName('Show photograph 3, 3 of 4');
  expect(await page.locator('h1').boundingBox()).toEqual(headingBox);
  expect(await page.locator('.ht-hero__actions').boundingBox()).toEqual(actionsBox);
  await page.clock.runFor(6000);
  await expect(slide(page)).toHaveAccessibleName('Show video, 4 of 4');
});

test('photographs crossfade together while the foreground stays fixed', async ({ page }) => {
  // CSS transitions use the compositor clock; verify with a real browser clock.
  await page.goto('/');
  await page.getByRole('button', { name: 'Pause background slideshow' }).click();
  const headingBox = await page.locator('h1').boundingBox();
  await page.getByRole('button', { name: 'Next background' }).click();
  const opacity = (index) => page.locator(`.ht-hero__slide--${index}`)
    .evaluate((node) => Number(getComputedStyle(node).opacity));
  await expect.poll(() => opacity(2)).toBeGreaterThan(0);
  expect(await opacity(2)).toBeLessThan(1);
  expect(await opacity(1)).toBeGreaterThan(0);
  await expect.poll(() => opacity(2)).toBe(1);
  await expect.poll(() => opacity(1)).toBe(0);
  expect(await page.locator('h1').boundingBox()).toEqual(headingBox);
});

test('video plays muted and inline once, pauses/resumes, then wraps to image 1', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Show video, 4 of 4' }).click();
  await expect(video(page)).toHaveJSProperty('muted', true);
  await expect(video(page)).toHaveJSProperty('playsInline', true);
  await expect(video(page)).toHaveJSProperty('loop', false);
  await expect.poll(() => video(page).evaluate((node) => node.currentTime)).toBeGreaterThan(.2);
  await page.getByRole('button', { name: 'Pause background slideshow' }).click();
  const stoppedAt = await video(page).evaluate((node) => node.currentTime);
  await page.waitForTimeout(500);
  expect(await video(page).evaluate((node) => node.currentTime)).toBeCloseTo(stoppedAt, 1);
  await page.getByRole('button', { name: 'Play background slideshow' }).click();
  // Let the actual 23.57-second file complete, rather than synthesizing ended.
  await expect(slide(page)).toHaveAccessibleName('Show photograph 1, 1 of 4', { timeout: 35_000 });
  await expect(video(page)).toHaveJSProperty('paused', true);
});

test('all navigation controls work; keyboard interaction stops rotation until explicit play', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Play background slideshow' })).toBeVisible();
  await page.clock.runFor(8000);
  await expect(slide(page)).toHaveAccessibleName('Show photograph 1, 1 of 4');
  await page.getByRole('button', { name: 'Next background' }).click();
  await expect(slide(page)).toHaveAccessibleName('Show photograph 2, 2 of 4');
  await page.getByRole('button', { name: 'Previous background' }).click();
  await expect(slide(page)).toHaveAccessibleName('Show photograph 1, 1 of 4');
  await page.getByRole('button', { name: 'Previous background' }).click();
  await expect(slide(page)).toHaveAccessibleName('Show video, 4 of 4');
  for (let index = 0; index < 3; index += 1) {
    const indicator = page.getByRole('button', { name: `Show photograph ${index + 1}, ${index + 1} of 4` });
    await indicator.click();
    await expect(indicator).toHaveAttribute('aria-current', 'true');
  }
  await page.getByRole('button', { name: 'Next background' }).focus();
  await page.keyboard.press('Home');
  await expect(slide(page)).toHaveAccessibleName('Show photograph 1, 1 of 4');
  await page.keyboard.press('ArrowRight');
  await expect(slide(page)).toHaveAccessibleName('Show photograph 2, 2 of 4');
  await page.clock.runFor(10_000);
  await expect(slide(page)).toHaveAccessibleName('Show photograph 2, 2 of 4');
  await page.getByRole('button', { name: 'Play background slideshow' }).focus();
  await page.keyboard.press('Enter');
  await page.clock.runFor(6100);
  await expect(slide(page)).toHaveAccessibleName('Show photograph 3, 3 of 4');
});

test('reduced motion has no autoplay or crossfade and retains manual image/video control', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/');
  await page.clock.runFor(25_000);
  await expect(slide(page)).toHaveAccessibleName('Show photograph 1, 1 of 4');
  await expect(page.getByRole('button', { name: 'Automatic rotation disabled for reduced motion' })).toBeDisabled();
  expect(await page.locator('.ht-hero__slide').first().evaluate((node) => getComputedStyle(node).transitionDuration)).toBe('0s');
  await page.getByRole('button', { name: 'Next background' }).click();
  await expect(slide(page)).toHaveAccessibleName('Show photograph 2, 2 of 4');
  await page.getByRole('button', { name: 'Show video, 4 of 4' }).click();
  await expect(video(page)).toHaveJSProperty('paused', true);
  await page.getByRole('button', { name: 'Play background video' }).click();
  await expect(video(page)).toHaveJSProperty('paused', false);
  await page.getByRole('button', { name: 'Pause background video' }).click();
  await expect(video(page)).toHaveJSProperty('paused', true);
  await page.getByRole('button', { name: 'Next background' }).click();
  await expect(slide(page)).toHaveAccessibleName('Show photograph 1, 1 of 4');
});

for (const [name, width, height] of [
  ['desktop', 1440, 960], ['tablet', 768, 1024], ['mobile', 390, 844], ['small-mobile', 320, 740],
]) {
  test(`${name}: no horizontal overflow, stable copy, decoded media and usable controls on every slide`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.getByRole('button', { name: 'Pause background slideshow' }).click();
    const headingBox = await page.locator('h1').boundingBox();
    const actionsBox = await page.locator('.ht-hero__actions').boundingBox();
    mkdirSync('artifacts', { recursive: true });
    for (let index = 0; index < 4; index += 1) {
      const label = index === 3 ? 'Show video, 4 of 4' : `Show photograph ${index + 1}, ${index + 1} of 4`;
      await page.getByRole('button', { name: label }).click();
      const media = page.locator(`.ht-hero__slide--${index + 1} ${index === 3 ? 'video' : 'img'}`);
      if (index === 3) {
        await expect.poll(() => media.evaluate((node) => node.readyState)).toBeGreaterThanOrEqual(2);
      } else {
        await expect.poll(() => media.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
      }
      await page.waitForTimeout(1100);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      expect(await page.locator('h1').boundingBox()).toEqual(headingBox);
      expect(await page.locator('.ht-hero__actions').boundingBox()).toEqual(actionsBox);
      for (const control of await page.locator('.ht-hero__controls button').all()) {
        const bounds = await control.boundingBox();
        expect(bounds.width).toBeGreaterThanOrEqual(24);
        expect(bounds.height).toBeGreaterThanOrEqual(44);
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
      }
      await page.screenshot({ path: `artifacts/hero-${name}-${index + 1}.png`, fullPage: true });
    }
  });
}

test('background failures keep readable content and working manual recovery', async ({ page }) => {
  await page.route('**/hero_video*.mp4', (route) => route.abort());
  await page.goto('/');
  await page.getByRole('button', { name: 'Show video, 4 of 4' }).click();
  await expect(page.getByRole('status')).toContainText(/background|video/i);
  await expect(page.getByRole('button', { name: 'Play background slideshow' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(headline);
  await page.getByRole('button', { name: 'Next background' }).click();
  await expect(slide(page)).toHaveAccessibleName('Show photograph 1, 1 of 4');
});
