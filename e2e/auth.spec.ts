import { test, expect } from '@playwright/test';

test.describe('Admin Auth', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: /submit/i })).toBeVisible();
  });

  test('shows error on invalid login', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpassword123');
    await page.getByRole('button', { name: /submit/i }).click();
    await expect(page.locator('.border-danger')).toBeVisible({ timeout: 5000 });
  });
});
