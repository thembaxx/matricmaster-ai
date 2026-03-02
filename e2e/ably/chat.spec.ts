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

	// Wait for success message which appears after signup
	try {
		await page
			.getByText('Account created successfully!', { timeout: 20000 })
			.waitFor({ state: 'visible' });
	} catch {
		// If success message not found, check if already on dashboard
		const currentURL = page.url();
		if (currentURL.includes('/dashboard')) {
			return { email, password };
		}
		throw new Error('Signup failed - no success message and not redirected');
	}

	// Wait for redirect to dashboard
	await page.waitForURL(/\/dashboard/, { timeout: 20000 });
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
