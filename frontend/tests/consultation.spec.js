import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const path = '/consultation.html';
const notice = 'Demo—no records are shared';
const previewButton = (page) => page.getByRole('button', { name: /^(Preview selection|Update preview)$/ });
const film = (page) => page.locator('#consultation-film');

const scopes = [
  { label: 'Full history', titles: ['Annual checkup', 'Emergency overview', 'Medication list', 'Prenatal visit notes'] },
  { label: 'Emergency summary', titles: ['Emergency overview'] },
  { label: 'Medication history', titles: ['Medication list'] },
  { label: 'Pregnancy history', titles: ['Prenatal visit notes'] },
];

test('shared header links between the landing and consultation pages, including direct reload', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await expect(nav.getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('aria-current', 'page');
  await nav.getByRole('link', { name: /consultation/i }).click();
  await expect(page).toHaveURL(/\/consultation\.html$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Walk into your next appointment prepared.');
  await expect(page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: /consultation/i })).toHaveAttribute('aria-current', 'page');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Walk into your next appointment prepared.');
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your health history, beautifully connected.');
});

test('three repository media files occupy separate scroll sections and resolve to valid browser URLs', async ({ page, request }) => {
  await page.goto(path);
  const sections = page.locator('[data-consultation-media]');
  await expect(sections).toHaveCount(3);
  let bottom = 0;
  for (const [index, section] of (await sections.all()).entries()) {
    await section.scrollIntoViewIfNeeded();
    const bounds = await section.evaluate((node) => {
      const b = node.getBoundingClientRect(); return { top: b.top + scrollY, bottom: b.bottom + scrollY };
    });
    expect(bounds.top).toBeGreaterThanOrEqual(bottom);
    bottom = bounds.bottom;
    if (index < 2) {
      const image = section.locator('img');
      await expect.poll(() => image.evaluate((node) => node.naturalWidth)).toBe(3840);
      const url = await image.getAttribute('src');
      expect(url).toContain(`consultation_0${index + 1}_image`);
      const response = await request.get(url);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('image/jpeg');
    }
  }
  await page.locator('.ct-film__player').scrollIntoViewIfNeeded();
  await expect(film(page)).toHaveAttribute('src', /consultation_video.*\.mp4$/);
  await expect.poll(() => film(page).evaluate((node) => node.readyState)).toBeGreaterThanOrEqual(2);
  const poster = await request.get(await film(page).getAttribute('poster'));
  expect(poster.status()).toBe(200);
  expect(poster.headers()['content-type']).toContain('image/jpeg');
});

test('Explore sharing scrolls and transfers keyboard focus to the demo', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(path);
  const explore = page.getByRole('link', { name: 'Explore sharing', exact: true });
  await explore.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#sharing-preview')).toBeFocused();
  await expect(page).toHaveURL(/#sharing-preview$/);
  expect(await page.locator('#sharing-preview').evaluate((node) => node.getBoundingClientRect().top)).toBeLessThanOrEqual(25);
});

test('all four scopes and three durations preview the correct fictional selection', async ({ page }) => {
  await page.goto(path);
  await expect(page.getByText(notice, { exact: true })).toBeVisible();
  await expect(page.getByText('Doctor access requires doctor sign-in.', { exact: true })).toBeVisible();
  for (const scope of scopes) {
    for (const duration of ['15 minutes', '1 hour', '24 hours']) {
      await page.getByRole('radio', { name: new RegExp(`^${scope.label}`) }).check();
      await page.getByRole('radio', { name: duration, exact: true }).check();
      await previewButton(page).click();
      await expect(page.locator('#doctor-preview-title')).toHaveText(scope.label);
      await expect(page.locator('.ct-preview__details')).toContainText(duration);
      const records = page.getByRole('list', { name: 'Fictional records in the preview' }).getByRole('listitem');
      await expect(records).toHaveCount(scope.titles.length);
      await expect(records.locator('strong')).toHaveText(scope.titles);
      await expect(page.getByText('Simulated access · Active', { exact: true })).toBeVisible();
    }
  }
});

test('draft changes are explicit, revocation removes the preview, and reload clears local state', async ({ page }) => {
  await page.goto(path);
  await previewButton(page).click();
  await page.getByRole('radio', { name: '24 hours', exact: true }).check();
  await expect(page.getByText('Selection changed. Preview again to update the simulated access.')).toBeVisible();
  await expect(page.locator('.ct-preview__details')).toContainText('1 hour');
  await previewButton(page).click();
  await expect(page.locator('.ct-preview__details')).toContainText('24 hours');
  await page.getByRole('button', { name: 'Revoke simulated access' }).click();
  await expect(page.locator('#doctor-preview-title')).toHaveText('Simulated access revoked');
  await expect(page.getByRole('list', { name: 'Fictional records in the preview' })).toHaveCount(0);
  await expect(previewButton(page)).toBeFocused();
  await expect(page.locator('.ct-sharing [role="status"]')).toHaveText('Simulated access revoked. No records were shared.');
  await previewButton(page).click();
  await page.reload();
  await expect(page.getByText('Simulated access · Active', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('radio', { name: '1 hour', exact: true })).toBeChecked();
});

test('sharing is keyboard usable with no fetch/XHR, mutation requests, or API calls', async ({ page }) => {
  const calls = [];
  page.on('request', (req) => {
    if (['fetch', 'xhr'].includes(req.resourceType()) || req.method() !== 'GET' || /\/api\//.test(req.url())) calls.push(req.url());
  });
  await page.goto(path);
  const radio = page.getByRole('radio', { name: /^Full history/ });
  await radio.focus();
  await page.keyboard.press('Space');
  await expect(radio).toBeChecked();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('radio', { name: /^Emergency summary/ })).toBeChecked();
  await previewButton(page).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Simulated access · Active', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Revoke simulated access' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#doctor-preview-title')).toHaveText('Simulated access revoked');
  expect(calls).toEqual([]);
});

test('complete footer has valid local anchors, Home navigation, copyright, and noninteractive policies', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(path);
  const footer = page.getByRole('contentinfo');
  await expect(footer.getByText('Coming soon', { exact: true })).toHaveCount(2);
  await expect(footer.getByRole('link', { name: /Privacy Policy|Terms of Use/ })).toHaveCount(0);
  await expect(footer.getByText(`© ${new Date().getFullYear()} HealthTrac`, { exact: true })).toBeVisible();
  for (const link of await footer.getByRole('link').all()) {
    const href = await link.getAttribute('href');
    if (href.startsWith('#')) {
      await expect(page.locator(href)).toHaveCount(1);
      await link.click();
      await expect(page.locator(href)).toBeFocused();
    }
  }
  await footer.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your health history, beautifully connected.');
});

test('consultation video is deferred, muted inline, controllable, and stops offscreen', async ({ page }) => {
  const requests = [];
  page.on('request', (req) => { if (req.url().includes('consultation_video-') && req.url().includes('.mp4')) requests.push(req.url()); });
  await page.goto(path);
  await expect(film(page)).not.toHaveAttribute('src');
  expect(requests).toEqual([]);
  await page.locator('.ct-film__player').scrollIntoViewIfNeeded();
  await expect(film(page)).toHaveJSProperty('muted', true);
  await expect(film(page)).toHaveJSProperty('playsInline', true);
  await expect.poll(() => film(page).evaluate((node) => node.currentTime)).toBeGreaterThan(.1);
  await page.getByRole('button', { name: 'Pause video', exact: true }).click();
  await expect(film(page)).toHaveJSProperty('paused', true);
  await page.getByRole('button', { name: 'Play video', exact: true }).click();
  await expect(film(page)).toHaveJSProperty('paused', false);
  await page.locator('h1').scrollIntoViewIfNeeded();
  await expect(film(page)).toHaveJSProperty('paused', true);
});

test('reduced motion displays the poster without video loading until explicitly played', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(path);
  await page.locator('.ct-film__player').scrollIntoViewIfNeeded();
  await expect(film(page)).not.toHaveAttribute('src');
  await expect(film(page)).toHaveAttribute('poster', /consultation_video_poster/);
  await page.getByRole('button', { name: 'Play video', exact: true }).click();
  await expect.poll(() => film(page).evaluate((node) => node.currentTime)).toBeGreaterThan(.1);
  await page.getByRole('button', { name: 'Pause video', exact: true }).click();
  await expect(film(page)).toHaveJSProperty('paused', true);
});

for (const [name, width, height] of [
  ['desktop', 1440, 960], ['laptop', 1024, 768], ['tablet', 768, 1024], ['mobile', 390, 844], ['small-mobile', 320, 740],
]) {
  test(`${name}: readable preview, separate media, no overflow, and screenshots`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(path);
    for (const image of await page.locator('.ct-photo img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
    }
    await page.getByRole('radio', { name: /^Full history/ }).check();
    await previewButton(page).click();
    for (const selector of ['.ct-opening', '.ct-preparation', '.ct-sharing', '.ct-film', '.ht-footer']) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    }
    const preview = page.locator('.ct-demo__preview');
    expect(await preview.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    await page.mouse.move(0, 0);
    mkdirSync('artifacts', { recursive: true });
    await page.screenshot({ path: `artifacts/consultation-${name}.png`, fullPage: true });
    await page.locator('.ct-sharing').screenshot({ path: `artifacts/consultation-demo-${name}.png` });
    await page.locator('.ct-opening').screenshot({ path: `artifacts/consultation-opening-${name}.png` });
    expect(errors).toEqual([]);
  });
}
