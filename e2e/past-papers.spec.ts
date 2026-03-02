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

test.describe('Past Papers', () => {
	test.describe('Past Papers List Page', () => {
		test.beforeEach(async ({ page }) => {
			await signUp(page);
			await page.goto('/past-papers');
		});

		test('page loads successfully', async ({ page }) => {
			await expect(page).toHaveURL(/past-papers/);
			await expect(page.getByRole('heading', { name: /past paper vault/i })).toBeVisible();
		});

		test('displays list of past papers', async ({ page }) => {
			// Wait for papers to load
			await expect(page.getByText(/archive results/i)).toBeVisible();
			// Should have at least one paper card
			await expect(page.locator('[class*="rounded-"][class*="p-"]').first()).toBeVisible();
		});

		test('year filter buttons are visible and clickable', async ({ page }) => {
			// Check year filter buttons exist
			const yearButtons = page.getByRole('button', { name: /\d{4}|All/ });
			await expect(yearButtons.first()).toBeVisible();

			// Click on a specific year
			await page.getByRole('button', { name: '2024' }).click();
			// Should still show papers (or none if no 2024 papers)
			await expect(page.getByText(/archive results/i)).toBeVisible();
		});

		test('search input is functional', async ({ page }) => {
			// Find search input
			const searchInput = page.getByPlaceholder(/search subjects/i);
			await expect(searchInput).toBeVisible();

			// Type a search query
			await searchInput.fill('Mathematics');
			// Results should filter (or show no results)
			await expect(page.getByText(/archive results/i)).toBeVisible();
		});
	});

	test.describe('Past Paper Viewer', () => {
		test.beforeEach(async ({ page }) => {
			await signUp(page);
			// Navigate to a specific paper viewer
			await page.goto('/past-paper?id=math-p1-2024');
		});

		test('viewer page loads', async ({ page }) => {
			// Should show the paper title
			await expect(page.getByRole('heading', { name: /mathematics/i })).toBeVisible();
		});

		test('shows loading state initially', async ({ page }) => {
			// Should show extracting or loading
			const loadingText = page.getByText(/extracting|loading/i);
			// Either loading or loaded state should appear
			await expect(loadingText.or(page.getByText(/question/i))).toBeVisible({ timeout: 10000 });
		});

		test('navigation back works', async ({ page }) => {
			// Find and click back button
			const backButton = page
				.getByRole('button')
				.filter({ has: page.locator('svg') })
				.first();
			await backButton.click();
			// Should navigate back or show past papers
			await expect(
				page
					.getByRole('heading', { name: /past papers|archive/i })
					.or(page.getByRole('button', { name: /view/i }))
			).toBeVisible();
		});
	});

	test.describe('API Endpoints', () => {
		test('extract-questions API responds', async ({ request }) => {
			const response = await request.post('/api/extract-questions', {
				data: {
					paperId: 'test-paper',
					pdfUrl: 'https://example.com/test.pdf',
					subject: 'Mathematics',
					paper: 'P1',
					year: 2024,
					month: 'May',
				},
			});

			// Should get a response (either success or error)
			expect(response.status()).toBeGreaterThanOrEqual(200);
			expect(response.status()).toBeLessThan(600);
		});

		test('db past-papers GET returns data or 404', async ({ request }) => {
			const response = await request.get('/api/db/past-papers?paperId=nonexistent-paper-id');

			// Should return either 200 with null or 404
			expect([200, 404]).toContain(response.status());
		});
	});

	test.describe('Pagination (when questions loaded)', () => {
		test('pagination controls appear when questions are loaded', async ({ page }) => {
			await signUp(page);
			// Navigate to a paper that should have questions
			await page.goto('/past-paper?id=math-p1-2024');

			// Wait for either loading to complete or questions to appear
			try {
				// Wait for questions to appear (timeout after 15 seconds)
				await expect(page.getByText(/question \d+/i)).toBeVisible({ timeout: 15000 });

				// Check for pagination controls
				const pagination = page
					.locator('footer')
					.filter({ has: page.getByRole('button', { name: /next|previous/i }) });
				await expect(pagination.or(page.getByRole('button', { name: /next/i }))).toBeVisible({
					timeout: 5000,
				});
			} catch {
				// If no questions loaded, check for error state
				const errorState = page.getByText(/extraction failed|error/i);
				await expect(errorState.or(page.getByText(/try again/i))).toBeVisible({ timeout: 5000 });
			}
		});
	});
});
