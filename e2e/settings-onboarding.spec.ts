import { expect, test } from '@playwright/test';

test.describe('Settings & Onboarding', () => {
	test('Settings page loads', async ({ page }) => {
		await page.goto('/settings', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Language page loads', async ({ page }) => {
		await page.goto('/language', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Search page loads', async ({ page }) => {
		await page.goto('/search', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Bookmarks page loads', async ({ page }) => {
		await page.goto('/bookmarks', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Focus page loads (timer interface)', async ({ page }) => {
		await page.goto('/focus', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Onboarding page loads', async ({ page }) => {
		await page.goto('/onboarding', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Landing page loads', async ({ page }) => {
		await page.goto('/', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});
});
