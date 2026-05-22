import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Dark Angels');
  });

  test('shows featured sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Featured Tours')).toBeVisible();
    await expect(page.getByText('Featured Services')).toBeVisible();
    await expect(page.getByText('Featured Blog')).toBeVisible();
  });

  test('bottom navigation has 5 tabs', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav a')).toHaveCount(5);
  });
});
