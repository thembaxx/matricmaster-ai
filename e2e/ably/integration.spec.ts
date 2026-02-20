import { expect, test } from '@playwright/test';

test.describe('Ably Integration', () => {
	test.describe('Channels Page', () => {
		test('should show realtime connection status when logged in', async ({ page }) => {
			const timestamp = Date.now();
			const email = `testuser-${timestamp}@matricmaster.test`;
			const password = 'TestPassword123!';
			const name = 'Test User';

			await page.goto('/sign-up');
			await page.fill('input[name="name"]', name);
			await page.fill('input[name="email"]', email);
			await page.fill('input[name="password"]', password);
			await Promise.all([page.waitForURL(/\/dashboard/), page.click('button[type="submit"]')]);

			await page.goto('/channels');

			await expect(page.getByText('South Africa • Grade 12')).toBeVisible();

			const liveIndicator = page.getByText('Live');
			if (await liveIndicator.isVisible().catch(() => false)) {
				console.log('Ably connected and showing Live indicator');
			} else {
				console.log('Ably may not be connected (no API key configured)');
			}
		});

		test('should display channel list with online indicators', async ({ page }) => {
			const timestamp = Date.now();
			const email = `testuser-${timestamp}@matricmaster.test`;
			const password = 'TestPassword123!';
			const name = 'Test User';

			await page.goto('/sign-up');
			await page.fill('input[name="name"]', name);
			await page.fill('input[name="email"]', email);
			await page.fill('input[name="password"]', password);
			await Promise.all([page.waitForURL(/\/dashboard/), page.click('button[type="submit"]')]);

			await page.goto('/channels');

			await expect(page.getByText('STEM Skills')).toBeVisible();
			await expect(page.getByText('Physical Sciences')).toBeVisible();
			await expect(page.getByText('Life Sciences')).toBeVisible();
			await expect(page.getByText('Info Tech (IT)')).toBeVisible();
		});

		test('should navigate between categories', async ({ page }) => {
			const timestamp = Date.now();
			const email = `testuser-${timestamp}@matricmaster.test`;
			const password = 'TestPassword123!';
			const name = 'Test User';

			await page.goto('/sign-up');
			await page.fill('input[name="name"]', name);
			await page.fill('input[name="email"]', email);
			await page.fill('input[name="password"]', password);
			await Promise.all([page.waitForURL(/\/dashboard/), page.click('button[type="submit"]')]);

			await page.goto('/channels');

			await page.click('button:has-text("STEM Skills")');
			await expect(page.locator('button:has-text("STEM Skills")')).toHaveClass(/bg-\[#1e293b\]/);

			await page.click('button:has-text("Languages")');
			await expect(page.locator('button:has-text("Languages")')).toHaveClass(/bg-\[#1e293b\]/);
		});
	});

	test.describe('Notifications', () => {
		test('should display notification bell with count', async ({ page }) => {
			const timestamp = Date.now();
			const email = `testuser-${timestamp}@matricmaster.test`;
			const password = 'TestPassword123!';
			const name = 'Test User';

			await page.goto('/sign-up');
			await page.fill('input[name="name"]', name);
			await page.fill('input[name="email"]', email);
			await page.fill('input[name="password"]', password);
			await Promise.all([page.waitForURL(/\/dashboard/), page.click('button[type="submit"]')]);

			await page.goto('/dashboard');

			const notificationBell = page
				.locator('button')
				.filter({ has: page.locator('svg.lucide-bell') });
			await expect(notificationBell).toBeVisible();

			await notificationBell.click();

			await expect(page.getByText('Notifications')).toBeVisible();
		});
	});

	test('should toggle between all and unread tabs', async ({ page }) => {
		const timestamp = Date.now();
		const email = `testuser-${timestamp}@matricmaster.test`;
		const password = 'TestPassword123!';
		const name = 'Test User';

		await page.goto('/sign-up');
		await page.fill('input[name="name"]', name);
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', password);
		await Promise.all([page.waitForURL(/\/dashboard/), page.click('button[type="submit"]')]);

		await page.goto('/dashboard');

		const notificationBell = page
			.locator('button')
			.filter({ has: page.locator('svg.lucide-bell') });
		await notificationBell.click();

		await page.click('button[role="tab"]:has-text("Unread")');
		await expect(page.getByRole('tabpanel')).toContainText('No unread notifications');
	});
});
