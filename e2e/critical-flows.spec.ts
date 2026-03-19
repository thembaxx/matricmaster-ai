import { expect, test } from '@playwright/test';

test.describe('Critical User Flows', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('1. Landing page loads and displays hero section', async ({ page }) => {
		await expect(page).toHaveTitle(/Lumi/i);

		await expect(page.locator('#main-content')).toBeVisible();

		const heroText = page.getByRole('heading', { level: 1 });
		await expect(heroText.first()).toBeVisible();
	});

	test('2. Past papers page loads and displays content', async ({ page }) => {
		await page.goto('/past-papers');

		await expect(page.locator('#main-content')).toBeVisible();
		await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });
	});

	test('3. Subjects page loads and displays subjects', async ({ page }) => {
		await page.goto('/subjects');

		await expect(page.locator('#main-content')).toBeVisible();
		await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });
	});
});
