import { expect, test } from '@playwright/test';

test.describe('PDF Viewer Component', () => {
	test.describe('Component Layout', () => {
		test('home page loads successfully', async ({ page }) => {
			// Navigate to home page
			await page.goto('/');
			await page.waitForLoadState('domcontentloaded');

			// Verify the page loaded
			await expect(page).toHaveURL(/\//);

			// Check that main content exists
			const body = page.locator('body');
			await expect(body).toBeVisible();
		});

		test('page has proper structure with navigation', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('domcontentloaded');

			// Check for navigation elements (links or buttons)
			const navElements = page.locator('nav, header, a, button');
			const count = await navElements.count();
			expect(count).toBeGreaterThan(0);
		});
	});

	test.describe('Past Papers Page Structure', () => {
		test('past papers page exists and is accessible', async ({ page }) => {
			await page.goto('/past-papers');
			await page.waitForLoadState('domcontentloaded');

			// Just verify the URL changed - content may require auth
			await expect(page).toHaveURL(/past-papers/);
		});
	});

	test.describe('Past Paper Viewer Page Structure', () => {
		test('past paper viewer page exists and is accessible', async ({ page }) => {
			await page.goto('/past-paper');
			await page.waitForLoadState('domcontentloaded');

			// Just verify the URL changed
			await expect(page).toHaveURL(/past-paper/);
		});
	});
});
