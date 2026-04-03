import { expect, test } from '@playwright/test';

test.describe('Social & Progress', () => {
	test('Leaderboard page loads', async ({ page }) => {
		await page.goto('/leaderboard', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Achievements page loads', async ({ page }) => {
		await page.goto('/achievements', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Focus Rooms page loads', async ({ page }) => {
		await page.goto('/focus-rooms', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Team Goals page loads', async ({ page }) => {
		await page.goto('/team-goals', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Profile page loads', async ({ page }) => {
		await page.goto('/profile', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});
});
