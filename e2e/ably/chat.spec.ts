import { expect, type Page, test } from '@playwright/test';

// Helper function to sign up for tests
async function signUp(page: Page) {
	const uniqueId = crypto.randomUUID();
	const email = `testuser-${uniqueId}@matricmaster.test`;
	const password = 'TestPassword123!';

	await page.goto('/sign-up');
	await page.fill('input[name="name"]', 'Test User');
	await page.fill('input[name="email"]', email);
	await page.fill('input[name="password"]', password);
	await page.click('button[type="submit"]');

	// Wait for navigation to dashboard (after 1.5s delay)
	await page.waitForURL(/\/dashboard/, { timeout: 25000 });
	return { email, password };
}

test.describe('Chat Functionality', () => {
	test.describe('Chat UI Integration', () => {
		test('should display channels page with Ably connection', async ({ page }) => {
			await signUp(page);

			await page.goto('/channels');
			await expect(page.getByText('Channels')).toBeVisible();

			// Ably connection indicator should eventually show "Live" or "Connected"
			const liveIndicator = page.getByText(/Live|Connected/i);
			await expect(liveIndicator).toBeVisible({ timeout: 15000 });
		});

		test('should show channel cards', async ({ page }) => {
			await signUp(page);

			await page.goto('/channels');

			// These are standard subjects that should be visible
			await expect(
				page.getByText(/Mathematics|Physical Sciences|Life Sciences/i).first()
			).toBeVisible();
		});
	});
});
