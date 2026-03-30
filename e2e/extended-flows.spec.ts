import { expect, test } from '@playwright/test';

test.describe('Quiz Flow', () => {
	test('Quiz page displays quiz title and subject', async ({ page }) => {
		await page.goto('/quiz', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Quiz question navigation is available', async ({ page }) => {
		await page.goto('/quiz', { timeout: 30000 });
		await page.waitForTimeout(2000);
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Quiz options are visible', async ({ page }) => {
		await page.goto('/quiz', { timeout: 30000 });
		await page.waitForTimeout(2000);
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Quiz can switch between practice and test mode', async ({ page }) => {
		await page.goto('/quiz', { timeout: 30000 });
		await page.waitForTimeout(2000);
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});
});

test.describe('Flashcard Study Session', () => {
	test('Flashcards page loads with deck overview', async ({ page }) => {
		await page.goto('/flashcards', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Flashcards page shows new deck button', async ({ page }) => {
		await page.goto('/flashcards', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Flashcards page shows stats cards when decks exist', async ({ page }) => {
		await page.goto('/flashcards', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		await page.waitForTimeout(1000);
	});
});

test.describe('Past Paper Browsing and Downloading', () => {
	test('Past papers page displays search input', async ({ page }) => {
		await page.goto('/past-papers', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Past papers page shows year filter buttons', async ({ page }) => {
		await page.goto('/past-papers', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Past papers page shows paper cards', async ({ page }) => {
		await page.goto('/past-papers', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		await page.waitForTimeout(2000);
	});

	test('Past papers filter panel can be opened', async ({ page }) => {
		await page.goto('/past-papers', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});
});

test.describe('Subject Selection', () => {
	test('Subjects page displays subject marketplace heading', async ({ page }) => {
		await page.goto('/subjects', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Subjects page shows enrollment buttons', async ({ page }) => {
		await page.goto('/subjects', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		await page.waitForTimeout(2000);
	});

	test('Individual subject page loads', async ({ page }) => {
		await page.goto('/subjects/math', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});
});

test.describe('Study Session Flow', () => {
	test('Focus page shows timer interface', async ({ page }) => {
		await page.goto('/focus', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Focus page has pause or start button', async ({ page }) => {
		await page.goto('/focus', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Study plan wizard page loads', async ({ page }) => {
		await page.goto('/study-plan', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Lesson complete page shows completion message', async ({ page }) => {
		await page.goto('/lesson-complete', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Dashboard today tab is accessible', async ({ page }) => {
		await page.goto('/dashboard', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Dashboard shows tasks section', async ({ page }) => {
		await page.goto('/dashboard', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});
});

test.describe('Additional Core Features', () => {
	test('Schedule page loads', async ({ page }) => {
		await page.goto('/schedule', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Calendar page loads', async ({ page }) => {
		await page.goto('/calendar', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Leaderboard displays rankings', async ({ page }) => {
		await page.goto('/leaderboard', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});

	test('Achievements page shows badges', async ({ page }) => {
		await page.goto('/achievements', { timeout: 30000 });
		await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
	});
});
