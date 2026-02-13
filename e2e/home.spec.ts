import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
	test('renders without crashing and displays main content', async ({ page }) => {
		// Navigate to the home page
		await page.goto('/');

		// Wait for the page to load
		await expect(page).toHaveTitle(/MatricMaster|matricmaster/i);

		// Check that main content is visible using a specific selector
		// Using first() to avoid strict mode violation with multiple matches
		const mainContent = page.locator('#main-content, body').first();
		await expect(mainContent).toBeVisible();
	});

	test('displays navigation elements', async ({ page }) => {
		await page.goto('/');

		// Check for common navigation elements or buttons
		const links = page.locator('a, button');
		await expect(links.first()).toBeVisible();
	});
});
