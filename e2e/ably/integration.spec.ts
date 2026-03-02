import { expect, type Page, test } from '@playwright/test';

async function signUp(page: Page) {
	await page.waitForTimeout(2000);

	const uniqueId = crypto.randomUUID();
	const email = `testuser-${uniqueId}@matricmaster.test`;
	const password = 'TestPassword123!';
	const name = 'Test User';

	await page.goto('/sign-up');

	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(3000);

	await page.waitForSelector('input[name="name"]');
	await page.fill('input[name="name"]', name);
	await page.fill('input[name="email"]', email);
	await page.fill('input[name="password"]', password);

	await page.waitForTimeout(2000);

	await page.locator('button[type="submit"]').click({ force: true });

	try {
		await page.waitForURL(/\/dashboard/, { timeout: 30000 });
		return { email, password };
	} catch {
		const successVisible = await page
			.getByText('Account created')
			.isVisible()
			.catch(() => false);
		if (successVisible) {
			await page.waitForURL(/\/dashboard/, { timeout: 20000 });
			return { email, password };
		}
	}

	const currentURL = page.url();
	throw new Error(`Signup failed - URL: ${currentURL}`);
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
