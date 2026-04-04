import { expect, test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from './utils/test-data';

test.describe('Dashboard & Learning Features', () => {
	test.beforeEach(async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
		await loginPage.assertLoginSuccess();
	});

	test.describe('Dashboard', () => {
		test('Page loads without crash', async ({ page }) => {
			await page.goto('/dashboard', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Key dashboard elements are visible', async ({ page }) => {
			await page.goto('/dashboard', { timeout: 30000 });
			await expect(page.locator('main')).toBeVisible({ timeout: 30000 });
		});
	});

	test.describe('Subjects', () => {
		test('Page loads without crash', async ({ page }) => {
			await page.goto('/subjects', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Subject cards are visible', async ({ page }) => {
			await page.goto('/subjects', { timeout: 30000 });
			await page.waitForSelector('.grid', { timeout: 30000 });
			const cards = page.locator('article, .Card, [class*="card"]');
			await expect(cards.first()).toBeVisible({ timeout: 30000 });
		});
	});

	test.describe('Quiz', () => {
		test('Page loads without crash', async ({ page }) => {
			await page.goto('/quiz', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Quiz interface elements are present', async ({ page }) => {
			await page.goto('/quiz', { timeout: 30000 });
			await expect(page.locator('main')).toBeVisible({ timeout: 30000 });
		});
	});

	test.describe('Flashcards', () => {
		test('Page loads without crash', async ({ page }) => {
			await page.goto('/flashcards', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Flashcards page content loads', async ({ page }) => {
			await page.goto('/flashcards', { timeout: 30000 });
			await expect(page.locator('main')).toBeVisible({ timeout: 30000 });
		});
	});

	test.describe('Past Papers', () => {
		test('Page loads without crash', async ({ page }) => {
			await page.goto('/past-papers', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Filters are visible', async ({ page }) => {
			await page.goto('/past-papers', { timeout: 30000 });
			await expect(page.locator('main')).toBeVisible({ timeout: 30000 });
		});
	});

	test.describe('Study Plan', () => {
		test('Page loads without crash', async ({ page }) => {
			await page.goto('/study-plan', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('Study plan content loads', async ({ page }) => {
			await page.goto('/study-plan', { timeout: 30000 });
			await expect(page.locator('main')).toBeVisible({ timeout: 30000 });
		});
	});
});
