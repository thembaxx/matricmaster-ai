import { expect, test } from '@playwright/test';

test.describe('Navigation', () => {
	test('can navigate to main pages', async ({ page }) => {
		// Start from home
		await page.goto('/');

		// Test navigation to dashboard (if accessible without auth)
		// Note: Some pages might require authentication
		await page.goto('/dashboard');
		await expect(page).toHaveURL(/dashboard|sign-in/);
	});

	test('responsive design works on mobile', async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');

		// Check that the page is usable on mobile
		await expect(page.locator('body')).toBeVisible();
	});
});
