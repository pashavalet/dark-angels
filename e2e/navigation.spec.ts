import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('navigates to all main pages', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Tours' }).click();
    await expect(page).toHaveURL('/tours');

    await page.getByRole('link', { name: 'Blog' }).click();
    await expect(page).toHaveURL('/blog');

    await page.getByRole('link', { name: 'Services' }).click();
    await expect(page).toHaveURL('/services');

    await page.getByRole('link', { name: 'Contacts' }).click();
    await expect(page).toHaveURL('/contacts');

    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL('/');
  });
});
