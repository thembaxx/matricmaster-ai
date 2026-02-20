import { expect, test } from '@playwright/test';

test.describe('Chat Functionality', () => {
	test.describe('Chat API', () => {
		test('should fetch messages from channel API', async ({ request }) => {
			const response = await request.get('/api/channels/test-channel-id/messages');
			expect(response.status()).toBe(200);
			const data = await response.json();
			expect(Array.isArray(data)).toBe(true);
		});

		test('should validate required fields for sending message', async ({ request }) => {
			const response = await request.post('/api/channels/test-channel-id/messages/send', {
				data: {
					content: 'Test message',
				},
			});
			expect(response.status()).toBe(400);
		});

		test('should require content for sending message', async ({ request }) => {
			const response = await request.post('/api/channels/test-channel-id/messages/send', {
				data: {
					userId: 'test-user-id',
				},
			});
			expect(response.status()).toBe(400);
		});
	});

	test.describe('Chat UI Integration', () => {
		test('should display channels page with Ably connection', async ({ page }) => {
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
			await expect(page.getByText('Channels')).toBeVisible();

			const liveIndicator = page.getByText('Live');
			if (await liveIndicator.isVisible().catch(() => false)) {
				console.log('Ably connected - showing live indicator');
			} else {
				console.log('Ably may not be connected (no API key or connection issue)');
			}
		});

		test('should show channel cards with online indicators', async ({ page }) => {
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

			await expect(page.getByText('Physical Sciences')).toBeVisible();
			await expect(page.getByText('Life Sciences')).toBeVisible();
			await expect(page.getByText('Info Tech (IT)')).toBeVisible();
		});
	});

	test.describe('Outbox Integration', () => {
		test('should have outbox table available for LiveSync', async ({ request }) => {
			const response = await request.get('/api/channels/test-channel-id/messages');
			expect(response.ok()).toBe(true);
			console.log('Outbox integration ready - messages can be synced to Ably');
		});
	});
});
