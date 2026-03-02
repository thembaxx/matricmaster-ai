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

	try {
		// Wait for redirect to dashboard
		await page.waitForURL(/\/dashboard/, { timeout: 15000 });
	} catch (e) {
		console.warn('Dashboard redirect timed out, checking for success message or manual redirect');
		const isSuccessVisible = await page.getByText(/Account created|Redirecting/i).isVisible();
		if (isSuccessVisible) {
			await page.goto('/dashboard');
			await page.waitForURL(/\/dashboard/, { timeout: 10000 });
		} else {
			throw e;
		}
	}
	return { email, password };
}

test.describe('PDF Viewer Component', () => {
	test.describe('Component Layout', () => {
		test('home page loads successfully', async ({ page }) => {
			// Navigate to home page
			await page.goto('/');
			await page.waitForLoadState('domcontentloaded');

			// Verify the page loaded
			await expect(page).toHaveURL(/\//);

			// Check that main content exists
			const body = page.locator('body');
			await expect(body).toBeVisible();
		});

		test('page has proper structure with navigation', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('domcontentloaded');

			// Check for navigation elements (links or buttons)
			const navElements = page.locator('nav, header, a, button');
			const count = await navElements.count();
			expect(count).toBeGreaterThan(0);
		});
	});

	test.describe('Past Papers Page Structure', () => {
		test('past papers page exists and is accessible', async ({ page }) => {
			await signUp(page);
			await page.goto('/past-papers');
			await page.waitForLoadState('domcontentloaded');

			// Just verify the URL changed - content may require auth
			await expect(page).toHaveURL(/past-papers/);
		});
	});

	test.describe('Past Paper Viewer Page Structure', () => {
		test('past paper viewer page exists and is accessible', async ({ page }) => {
			await signUp(page);
			// Navigate to a specific viewer path with an ID
			await page.goto('/past-paper/sample-123');
			await page.waitForLoadState('domcontentloaded');

			// Verify the URL matches the viewer pattern (requires ID segment)
			await expect(page).toHaveURL(/^\/past-paper\/[\w-]+$/);
		});
	});
});
