import { expect, test } from '@playwright/test';

test.describe('Content & Tools', () => {
	test('Lessons page loads', async ({ page }) => {
		await page.goto('/lessons', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Snap & Solve page loads', async ({ page }) => {
		await page.goto('/snap-and-solve', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Periodic Table page loads', async ({ page }) => {
		await page.goto('/periodic-table', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Physical Sciences page loads', async ({ page }) => {
		await page.goto('/physical-sciences', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Exam Simulation page loads', async ({ page }) => {
		await page.goto('/exam-simulation', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Schedule page loads', async ({ page }) => {
		await page.goto('/schedule', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Calendar page loads', async ({ page }) => {
		await page.goto('/calendar', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});
});
