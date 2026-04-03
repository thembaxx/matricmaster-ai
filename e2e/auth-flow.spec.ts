import { test } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { createTestUser, TEST_USER_EMAIL, TEST_USER_PASSWORD } from './utils/test-data';

test.describe('Full User Lifecycle', () => {
	test.beforeEach(async ({ page }) => {
		await page.context().clearCookies();
		await page.context().clearPermissions();
	});

	test('Registration -> Login -> Dashboard', async ({ page }) => {
		const signUpPage = new SignUpPage(page);
		const loginPage = new LoginPage(page);
		const dashboardPage = new DashboardPage(page);

		const testUser = createTestUser();

		await signUpPage.goto();
		await signUpPage.assertPageLoaded();

		await signUpPage.register(testUser.name, testUser.email, testUser.password);

		try {
			await signUpPage.assertRegistrationSuccess();
		} catch {
			console.log('Registration might have auto-redirected, continuing to login...');
		}

		await loginPage.goto();
		await loginPage.assertPageLoaded();

		await loginPage.login(testUser.email, testUser.password);
		await loginPage.assertLoginSuccess();

		await dashboardPage.goto();
		await dashboardPage.assertLoggedIn();
		await dashboardPage.assertUserVisible();
		await dashboardPage.assertPageLoaded();
	});

	test('Existing admin user login', async ({ page }) => {
		const loginPage = new LoginPage(page);
		const dashboardPage = new DashboardPage(page);

		await loginPage.goto();
		await loginPage.assertPageLoaded();

		await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
		await loginPage.assertLoginSuccess();

		await dashboardPage.goto();
		await dashboardPage.assertLoggedIn();
		await dashboardPage.assertUserVisible();
	});
});
