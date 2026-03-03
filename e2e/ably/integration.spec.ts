import { expect, type Page, test } from '@playwright/test';

async function signUp(page: Page) {
	const uniqueId = crypto.randomUUID();
	const email = `testuser-${uniqueId}@matricmaster.test`;
	const password = 'TestPassword123!';
	const name = 'Test User';

	await page.goto('/sign-up');
	await page.fill('input[name="name"]', name);
	await page.fill('input[name="email"]', email);
	await page.fill('input[name="password"]', password);

	// Click submit and wait for navigation - use Promise.all pattern
	await Promise.all([page.waitForURL(/\/dashboard/), page.click('button[type="submit"]')]);

	return { email, password };
}

test.describe('Ably Integration', () => {
	test.describe('Channels Page', () => {
		test('should show realtime connection status when logged in', async ({ page }) => {
			await signUp(page);
			await page.goto('/channels');
			await page.waitForLoadState('networkidle');

			await expect(page.getByRole('heading', { name: 'Channels' })).toBeVisible();
		});

		test('should display channel categories', async ({ page }) => {
			await signUp(page);
			await page.goto('/channels');
			await page.waitForLoadState('networkidle');

			await expect(page.getByRole('button', { name: 'STEM Skills' }).first()).toBeVisible();
		});

		test.skip('should navigate between categories', async ({ page }) => {
			await signUp(page);
			await page.goto('/channels');
			await page.waitForLoadState('networkidle');

			await page.getByRole('button', { name: 'Languages' }).click();
			await expect(page.getByRole('button', { name: 'Languages' })).toBeVisible();
		});
	});

	test.describe('Notifications', () => {
		test.skip('should display notification bell and open notifications panel', async ({ page }) => {
			await signUp(page);
			await page.goto('/dashboard');

			const notificationBell = page.getByRole('button', { name: 'Notifications' }).first();
			await expect(notificationBell).toBeVisible();

			await notificationBell.click();

			await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
		});
	});

	test.skip('should toggle between all and unread tabs', async ({ page }) => {
		await signUp(page);
		await page.goto('/dashboard');

		const notificationBell = page.getByRole('button', { name: 'Notifications' }).first();
		await notificationBell.click();

		await page.waitForTimeout(1000);
		await page.getByRole('tab', { name: 'Unread' }).click({ force: true });
	});
});
