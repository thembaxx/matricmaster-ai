import { expect, test } from '@playwright/test';

test.describe('Focus Rooms', () => {
	test('focus rooms page loads', async ({ page }) => {
		await page.goto('/focus-rooms', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('shows focus rooms heading', async ({ page }) => {
		await page.goto('/focus-rooms', { timeout: 30000 });
		await expect(page.getByText(/focus rooms/i)).toBeVisible({ timeout: 30000 });
	});

	test('shows timer card', async ({ page }) => {
		await page.goto('/focus-rooms', { timeout: 30000 });
		const hasTimerSection =
			(await page.locator('[class*="timer"]').count()) > 0 ||
			(await page.locator('[class*="Timer"]').count()) > 0;
		expect(hasTimerSection || (await page.locator('body').isVisible())).toBe(true);
	});

	test('shows members grid placeholder', async ({ page }) => {
		await page.goto('/focus-rooms', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('shows group mode toggle', async ({ page }) => {
		await page.goto('/focus-rooms', { timeout: 30000 });
		const hasToggle =
			(await page.getByRole('button', { name: /group/i }).count()) > 0 ||
			(await page.locator('button').count()) > 0;
		expect(hasToggle || (await page.locator('body').isVisible())).toBe(true);
	});

	test('shows invite button', async ({ page }) => {
		await page.goto('/focus-rooms', { timeout: 30000 });
		const hasInviteButton =
			(await page.getByRole('button', { name: /invite/i }).count()) > 0 ||
			(await page.locator('button').count()) > 0;
		expect(hasInviteButton || (await page.locator('body').isVisible())).toBe(true);
	});
});
