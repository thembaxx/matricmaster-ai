import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
	test('renders without crashing and displays main content', async ({ page }) => {
		// Navigate to the home page
		await page.goto('/');

		// Wait for the page to load
		await expect(page).toHaveTitle(/MatricMaster|matricmaster/i);

		// Check that main content is visible
		// The page should contain some text or elements
		const mainContent = page.locator('main, body, div');
		await expect(mainContent).toBeVisible();
	});

	test('displays navigation elements', async ({ page }) => {
		await page.goto('/');

		// Check for common navigation elements or buttons
		// This depends on your actual page structure
		const links = page.locator('a, button');
		await expect(links.first()).toBeVisible();
	});
});
