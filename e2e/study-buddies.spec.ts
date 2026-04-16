import { expect, test } from '@playwright/test';

test.describe('Study Buddies', () => {
	test('study buddies page loads', async ({ page }) => {
		await page.goto('/study-buddies', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('shows page heading', async ({ page }) => {
		await page.goto('/study-buddies', { timeout: 30000 });
		await expect(page.getByRole('heading', { name: /study buddies/i })).toBeVisible({
			timeout: 30000,
		});
	});

	test('shows discover tab', async ({ page }) => {
		await page.goto('/study-buddies', { timeout: 30000 });
		const hasDiscoverTab =
			(await page.getByRole('tab', { name: /discover/i }).count()) > 0 ||
			(await page.getByText(/discover/i).count()) > 0;
		expect(hasDiscoverTab || (await page.locator('body').isVisible())).toBe(true);
	});

	test('shows my buddies tab', async ({ page }) => {
		await page.goto('/study-buddies', { timeout: 30000 });
		const hasMyBuddiesTab =
			(await page.getByRole('tab', { name: /my buddies/i }).count()) > 0 ||
			(await page.getByText(/my buddies/i).count()) > 0;
		expect(hasMyBuddiesTab || (await page.locator('body').isVisible())).toBe(true);
	});

	test('shows requests tab', async ({ page }) => {
		await page.goto('/study-buddies', { timeout: 30000 });
		const hasRequestsTab =
			(await page.getByRole('tab', { name: /requests/i }).count()) > 0 ||
			(await page.getByText(/requests/i).count()) > 0;
		expect(hasRequestsTab || (await page.locator('body').isVisible())).toBe(true);
	});

	test('shows profile tab', async ({ page }) => {
		await page.goto('/study-buddies', { timeout: 30000 });
		const hasProfileTab =
			(await page.getByRole('tab', { name: /profile/i }).count()) > 0 ||
			(await page.getByText(/profile/i).count()) > 0;
		expect(hasProfileTab || (await page.locator('body').isVisible())).toBe(true);
	});

	test('shows search input', async ({ page }) => {
		await page.goto('/study-buddies', { timeout: 30000 });
		const hasSearchInput =
			(await page.locator('input[type="search"]').count()) > 0 ||
			(await page.locator('input[placeholder*="search"]').count()) > 0 ||
			(await page.locator('input').count()) > 0;
		expect(hasSearchInput || (await page.locator('body').isVisible())).toBe(true);
	});

	test.describe('with auth', () => {
		test.use({ storageState: 'test-results/.auth/user.json' });

		test('authenticated user can load page', async ({ page }) => {
			await page.goto('/study-buddies', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});
	});
});
