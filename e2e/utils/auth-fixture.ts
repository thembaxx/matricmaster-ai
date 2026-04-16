import { test as base, type Page } from '@playwright/test';
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from './test-data';

export interface AuthFixtures {
	authenticatedPage: Page;
}

export const authenticated = base.extend<AuthFixtures>({
	authenticatedPage: async ({ page }, use) => {
		await page.goto('/login');

		await page.fill('input[id="email"]', TEST_USER_EMAIL);
		await page.fill('input[id="password"]', TEST_USER_PASSWORD);
		await page.click('button[type="submit"]');

		await page.waitForURL(/\/dashboard/, { timeout: 30000 });

		await use(page);
	},
});

export async function loginUser(page: Page, email: string, password: string) {
	await page.goto('/login');
	await page.fill('input[id="email"]', email);
	await page.fill('input[id="password"]', password);
	await page.click('button[type="submit"]');
	await page.waitForURL(/\/dashboard/, { timeout: 30000 });
}

export async function logoutUser(page: Page) {
	await page.goto('/sign-out');
	await page.waitForURL('/', { timeout: 10000 });
}

export async function clearAuthSession(page: Page) {
	await page.context().clearCookies();
	await page.context().clearPermissions();
	await page.goto('/');
}

export async function isAuthenticated(page: Page): Promise<boolean> {
	await page.goto('/dashboard');
	const url = page.url();
	return url.includes('/dashboard');
}
