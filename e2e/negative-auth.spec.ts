import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { createTestUser, TEST_USER_EMAIL } from './utils/test-data';

test.describe('Negative Auth Tests', () => {
	test('Invalid login credentials', async ({ page }) => {
		const loginPage = new LoginPage(page);

		await loginPage.goto();
		await loginPage.assertPageLoaded();

		await loginPage.login(TEST_USER_EMAIL, 'WrongPassword123!');

		await loginPage.assertErrorMessage('invalid');
	});

	test('Non-existent user login', async ({ page }) => {
		const loginPage = new LoginPage(page);
		const testUser = createTestUser();

		await loginPage.goto();
		await loginPage.assertPageLoaded();

		await loginPage.login(testUser.email, testUser.password);

		await loginPage.assertErrorMessage('invalid');
	});

	test('Empty login fields', async ({ page }) => {
		const loginPage = new LoginPage(page);

		await loginPage.goto();
		await loginPage.assertPageLoaded();

		await loginPage.submitButton.click();

		await loginPage.assertErrorMessage('');
	});

	test('Duplicate registration', async ({ page }) => {
		const signUpPage = new SignUpPage(page);

		await signUpPage.goto();
		await signUpPage.assertPageLoaded();

		await signUpPage.register('Admin Test', TEST_USER_EMAIL, 'NewPassword123!');

		await signUpPage.assertErrorMessage('exist');
	});
});
