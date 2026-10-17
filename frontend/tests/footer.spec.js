import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const destinations = [
  ['Your health history', 'top'],
  ['Records & insights', 'records'],
  ['Health, in everyday life', 'everyday'],
  ['The story continues', 'closing'],
  ['Back to top', 'top'],
];

test('footer is a page landmark after main/video, with real section links and noninteractive policy entries', async ({ page }) => {
  await page.goto('/');
  const footer = page.getByRole('contentinfo', { name: 'HealthTrac footer' });
  await expect(footer).toHaveCount(1);
  expect(await footer.evaluate((node) => node.previousElementSibling.tagName)).toBe('MAIN');
  const footerTop = await footer.evaluate((node) => node.getBoundingClientRect().top + scrollY);
  const videoBottom = await page.locator('[data-chapter="video"]').evaluate((node) => node.getBoundingClientRect().bottom + scrollY);
  expect(footerTop).toBeGreaterThan(videoBottom);
  await expect(footer.getByRole('navigation', { name: 'Explore' })).toHaveCount(1);
  await expect(footer.getByRole('link')).toHaveCount(5);
  for (const [label, id] of destinations) {
    await expect(footer.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', `#${id}`);
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  await expect(footer.getByText('Privacy Policy', { exact: true })).toBeVisible();
  await expect(footer.getByText('Terms of Use', { exact: true })).toBeVisible();
  await expect(footer.getByText('Coming soon', { exact: true })).toHaveCount(2);
  await expect(footer.getByRole('link', { name: /privacy|terms/i })).toHaveCount(0);
  await expect(footer.getByRole('button')).toHaveCount(0);
  await expect(footer.getByText(`© ${new Date().getFullYear()} HealthTrac`, { exact: true })).toBeVisible();
});

test('each footer link focuses and scrolls to its existing section with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const footer = page.getByRole('contentinfo');
  for (const [label, id] of destinations) {
    await footer.getByRole('link', { name: label, exact: true }).click();
    await expect(page.locator(`#${id}`)).toBeFocused();
    expect(new URL(page.url()).hash).toBe(`#${id}`);
    const top = await page.locator(`#${id}`).evaluate((node) => node.getBoundingClientRect().top);
    expect(top).toBeGreaterThanOrEqual(-1);
    expect(top).toBeLessThanOrEqual(25);
  }
});

test('footer keyboard focus is visible and Back to top activates by keyboard', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const footer = page.getByRole('contentinfo');
  await footer.scrollIntoViewIfNeeded();
  const firstLink = footer.getByRole('link', { name: 'Your health history', exact: true });
  await firstLink.focus();
  await page.keyboard.press('Tab');
  const nextLink = footer.getByRole('link', { name: 'Records & insights', exact: true });
  await expect(nextLink).toBeFocused();
  expect(await nextLink.evaluate((node) => getComputedStyle(node).outlineStyle)).toBe('solid');
  expect(await nextLink.evaluate((node) => parseFloat(getComputedStyle(node).outlineWidth))).toBeGreaterThanOrEqual(2);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(footer.getByRole('link', { name: 'Back to top' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#top')).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBeLessThanOrEqual(25);
});

for (const [name, width, height] of [
  ['desktop', 1440, 960], ['tablet', 768, 1024], ['mobile', 390, 844], ['small-mobile', 320, 740],
]) {
  test(`${name}: footer fits the viewport, readable contrast and layout, screenshot`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    await footer.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    expect(await footer.evaluate((node) => Math.round(node.getBoundingClientRect().width))).toBe(width);
    for (const link of await footer.getByRole('link').all()) {
      const box = await link.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    const columns = await page.locator('.ht-footer__columns').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(width <= 700 ? 1 : 3);
    const contrast = await footer.evaluate((node) => {
      function luminance(color) {
        const rgb = color.match(/[\d.]+/g).slice(0, 3).map(Number).map((value) => {
          const channel = value / 255;
          return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
        });
        return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
      }
      const background = luminance(getComputedStyle(node).backgroundColor);
      return [...node.querySelectorAll('a, h2, p, .ht-footer__policy, .ht-footer__soon')].map((element) => {
        const foreground = luminance(getComputedStyle(element).color);
        return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
      });
    });
    expect(Math.min(...contrast)).toBeGreaterThanOrEqual(4.5);
    mkdirSync('artifacts', { recursive: true });
    await footer.screenshot({ path: `artifacts/footer-${name}.png` });
    if (name === 'desktop' || name === 'mobile') {
      await page.locator('.ht-introduction').screenshot({ path: `artifacts/footer-after-${name}-introduction.png` });
    }
  });
}
