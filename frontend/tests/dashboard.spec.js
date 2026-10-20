import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

test('fictional dashboard labels clinical and upload dates, ranges and unavailable history', async ({ page }) => {
  const dataRequests = [];
  page.on('request', (request) => { if (['fetch', 'xhr'].includes(request.resourceType())) dataRequests.push(request.url()); });
  await page.goto('/dashboard.html');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your health, at a glance.');
  await expect(page.getByText('Fictional demo', { exact: true })).toBeVisible();
  const record = page.locator('.pt-records li').first();
  await expect(record).toContainText('Record date · 12 Jun 2026');
  await expect(record).toContainText('Uploaded 13 Jun 2026');
  await expect(page.getByText('Clinical date not provided')).toBeVisible();
  await expect(page.getByText('Active', { exact: true })).toHaveCount(2);
  await expect(page.getByText('Within supplied range', { exact: true })).toBeVisible();
  await expect(page.getByText('Below supplied range', { exact: true })).toBeVisible();
  await expect(page.getByText('No comparable history is available to show a trend.')).toBeVisible();
  expect(dataRequests).toEqual([]);
});

test('actions explain integration dependencies and record examples restore focus', async ({ page }) => {
  await page.goto('/dashboard.html');
  const upload = page.getByRole('main').getByRole('button', { name: 'Upload a record', exact: true });
  await upload.click();
  await expect(page.getByRole('dialog')).toContainText('No files can be selected or uploaded here.');
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(upload).toBeFocused();
  await page.getByRole('main').getByRole('button', { name: 'Share with a doctor', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('No records, links or access tokens are shared here.');
  await expect(page.getByRole('dialog').getByRole('link')).toHaveAttribute('href', './consultation.html#sharing-preview');
  await page.getByRole('button', { name: 'Got it' }).click();
  const recordButton = page.getByRole('button', { name: 'View example: Routine blood test' });
  await recordButton.click();
  await expect(page.getByRole('dialog')).toContainText('No original document or patient file is available.');
  await expect(page.getByRole('dialog')).toContainText('13 Jun 2026');
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await expect(recordButton).toBeFocused();
  await page.getByRole('button', { name: 'Profile & Plan' }).click();
  await expect(page.getByRole('dialog')).toContainText('authenticated profile and billing routes');
});

test('empty, loading and locked states do not leave fictional medical details in the DOM', async ({ page }) => {
  await page.goto('/dashboard.html');
  const state = page.getByLabel('Preview state');
  await state.selectOption('empty');
  await expect(page.getByText('Your records can start here.')).toBeVisible();
  await expect(page.getByText('No ongoing care journeys.')).toBeVisible();
  await expect(page.getByText('No readings to show yet.')).toBeVisible();
  await expect(page.getByText('Routine blood test', { exact: true })).toHaveCount(0);
  await state.selectOption('loading');
  await expect(page.getByRole('status')).toHaveCount(3);
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(1);
  await state.selectOption('locked');
  await expect(page.getByText('Details are locked.', { exact: true })).toHaveCount(3);
  await expect(page.getByText('Hemoglobin', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Blood pressure follow-up', { exact: true })).toHaveCount(0);
  await expect(page.locator('.pt-records li, .pt-readings li, .pt-journeys li')).toHaveCount(0);
  await page.getByRole('button', { name: 'About unlocking' }).click();
  await expect(page.getByRole('dialog')).toContainText('cannot unlock or retrieve patient information');
});

test('mobile menu supports keyboard dismissal and focuses verified section destinations', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/dashboard.html');
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  await expect(page.getByRole('navigation', { name: 'Patient navigation' })).toBeHidden();
  await menu.click();
  await expect(page.getByRole('button', { name: 'Close', exact: true })).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await menu.click();
  await page.getByRole('link', { name: 'Medical Records' }).click();
  await expect(page.locator('#recent-records')).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await page.getByRole('link', { name: 'Health History' }).click();
  await expect(page.locator('#care-journeys')).toBeFocused();
  await menu.click();
  await page.getByRole('link', { name: 'Results & Trends' }).click();
  await expect(page.locator('#latest-readings')).toBeFocused();
  await menu.click();
  const share = page.getByRole('navigation').getByRole('button', { name: 'Share with a Doctor' });
  await share.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(share).toBeFocused();
});

for (const [name, width, height] of [['desktop', 1440, 1100], ['tablet', 834, 1112], ['mobile', 390, 844], ['small-mobile', 320, 740]]) {
  test(`${name}: dashboard fits without horizontal overflow and captures review screenshot`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/dashboard.html');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const colors = await page.locator('h1').evaluate((node) => ({ font: getComputedStyle(node).fontFamily, color: getComputedStyle(node).color }));
    expect(colors.font).toContain('Georgia');
    expect(colors.color).toBe('rgb(52, 38, 56)');
    mkdirSync('artifacts', { recursive: true });
    await page.screenshot({ path: `artifacts/dashboard-${name}.png`, fullPage: true });
    for (const state of ['empty', 'loading', 'locked']) {
      await page.getByLabel('Preview state').selectOption(state);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  });
}
