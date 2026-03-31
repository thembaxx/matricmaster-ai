import { expect, test } from '@playwright/test';

test.describe('Critical User Flows', () => {
	test.describe('Landing & Navigation', () => {
		test('Landing page loads without crash', async ({ page }) => {
			await page.goto('/', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Navigation to subjects works', async ({ page }) => {
			await page.goto('/');
			await page.click('text=Subjects');
			await expect(page).toHaveURL(/subjects/);
		});

		test('Navigation to past papers works', async ({ page }) => {
			await page.goto('/');
			await page.click('text=Past Papers');
			await expect(page).toHaveURL(/past-papers/);
		});
	});

	test.describe('Core Learning Features', () => {
		test('Past papers page loads', async ({ page }) => {
			await page.goto('/past-papers', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Subjects page loads', async ({ page }) => {
			await page.goto('/subjects', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Dashboard page loads', async ({ page }) => {
			await page.goto('/dashboard', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Quiz page loads', async ({ page }) => {
			await page.goto('/quiz', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Study plan page loads', async ({ page }) => {
			await page.goto('/study-plan', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Focus sessions page loads', async ({ page }) => {
			await page.goto('/focus', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});
	});

	test.describe('Content & Tools', () => {
		test('Lessons page loads', async ({ page }) => {
			await page.goto('/lessons', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Snap & Solve page loads', async ({ page }) => {
			await page.goto('/snap-and-solve', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Periodic table page loads', async ({ page }) => {
			await page.goto('/periodic-table', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Physical sciences page loads', async ({ page }) => {
			await page.goto('/physical-sciences', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Exam simulation page loads', async ({ page }) => {
			await page.goto('/exam-simulation', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});
	});

	test.describe('Social & Progress', () => {
		test('Leaderboard page loads', async ({ page }) => {
			await page.goto('/leaderboard', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Profile page loads', async ({ page }) => {
			await page.goto('/profile', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Achievements page loads', async ({ page }) => {
			await page.goto('/achievements', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Focus rooms page loads', async ({ page }) => {
			await page.goto('/focus-rooms', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Team goals page loads', async ({ page }) => {
			await page.goto('/team-goals', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});
	});

	test.describe('Settings & Onboarding', () => {
		test('Settings page loads', async ({ page }) => {
			await page.goto('/settings', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Language selection page loads', async ({ page }) => {
			await page.goto('/language-select', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Search functionality works', async ({ page }) => {
			await page.goto('/search', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Bookmarks page loads', async ({ page }) => {
			await page.goto('/bookmarks', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});
	});
});
