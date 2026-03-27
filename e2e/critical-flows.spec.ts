import { expect, test } from '@playwright/test';

test.describe('Critical User Flows', () => {
	test('1. Landing page loads without crash', async ({ page }) => {
		await page.goto('/', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('2. Past papers page loads without crash', async ({ page }) => {
		await page.goto('/past-papers', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('3. Subjects page loads without crash', async ({ page }) => {
		await page.goto('/subjects', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});
});
