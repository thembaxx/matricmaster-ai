import { expect, test } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from './utils/test-data';

const VIEWPORTS = {
	mobile: { width: 390, height: 844 },
	tablet: { width: 820, height: 1180 },
	desktop: { width: 1920, height: 1080 },
};

test.describe('Responsive & Visual Checks', () => {
	for (const [name, viewport] of Object.entries(VIEWPORTS)) {
		test(`Dashboard on ${name} viewport`, async ({ page }) => {
			await page.setViewportSize(viewport);

			const loginPage = new LoginPage(page);
			await loginPage.goto();
			await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
			await loginPage.assertLoginSuccess();

			const dashboardPage = new DashboardPage(page);
			await dashboardPage.goto();
			await dashboardPage.assertLoggedIn();
			await dashboardPage.assertPageLoaded();

			const filename = `dashboard-${name}-${viewport.width}x${viewport.height}`;
			await dashboardPage.takeScreenshot(filename);
		});
	}

	test('Login page responsive', async ({ page }) => {
		const loginPage = new LoginPage(page);

		for (const [name, viewport] of Object.entries(VIEWPORTS)) {
			await page.setViewportSize(viewport);
			await loginPage.goto();
			await loginPage.assertPageLoaded();
			await page.screenshot({
				path: `test-results/login-${name}-${viewport.width}x${viewport.height}.png`,
			});
		}
	});

	test('Sign up page responsive', async ({ page }) => {
		const loginPage = new LoginPage(page);

		for (const [name, viewport] of Object.entries(VIEWPORTS)) {
			await page.setViewportSize(viewport);
			await loginPage.page.goto('/sign-up');
			await expect(loginPage.page.locator('input[id="name"]')).toBeVisible();
			await loginPage.page.screenshot({
				path: `test-results/signup-${name}-${viewport.width}x${viewport.height}.png`,
			});
		}
	});
});
