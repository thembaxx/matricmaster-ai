import { expect, test } from '@playwright/test';

test.describe('Authentication Flow', () => {
	test('sign-in page loads correctly', async ({ page }) => {
		await page.goto('/sign-in');

		// Check for sign-in form elements
		await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
		await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
	});

	test('sign-up page loads correctly', async ({ page }) => {
		await page.goto('/sign-up');

		// Check for sign-up form elements
		await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
		await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
	});
});
