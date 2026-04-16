import { expect, test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';

test.describe('Sign-In Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.context().clearCookies();
		await page.context().clearPermissions();
	});

	test('should load sign-in page', async ({ page }) => {
		await page.goto('/login', { timeout: 30000 });
		await expect(page).toHaveURL(/\/login\//);
	});

	test('should display all form elements', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.assertPageLoaded();
		await expect(page.locator('input[id="email"]')).toBeVisible();
		await expect(page.locator('input[id="password"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toBeVisible();
	});

	test('should display validation error for empty fields', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.submitButton.click();
		await loginPage.assertErrorMessage('');
	});

	test('should display validation error for invalid email format', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.emailInput.fill('notanemail');
		await loginPage.passwordInput.fill('somepassword');
		await loginPage.submitButton.click();
		await loginPage.assertErrorMessage('');
	});

	test('should navigate to forgot password page', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.forgotPasswordLink.click();
		await expect(page).toHaveURL(/\/forgot-password\//);
	});

	test('should navigate to sign-up page', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.signUpLink.click();
		await expect(page).toHaveURL(/\/register\//);
	});
});

test.describe('Sign-Up Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.context().clearCookies();
		await page.context().clearPermissions();
	});

	test('should load sign-up page', async ({ page }) => {
		await page.goto('/register', { timeout: 30000 });
		await expect(page).toHaveURL(/\/register\//);
	});

	test('should display all form elements', async ({ page }) => {
		const signUpPage = new SignUpPage(page);
		await signUpPage.goto();
		await signUpPage.assertPageLoaded();
		await expect(page.locator('input[id="name"]')).toBeVisible();
		await expect(page.locator('input[id="email"]')).toBeVisible();
		await expect(page.locator('input[id="password"]')).toBeVisible();
		await expect(page.locator('input[id="confirmPassword"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toBeVisible();
	});

	test('should display validation error for empty fields', async ({ page }) => {
		const signUpPage = new SignUpPage(page);
		await signUpPage.goto();
		await signUpPage.submitButton.click();
		await signUpPage.assertErrorMessage('');
	});

	test('should display validation error for invalid email format', async ({ page }) => {
		const signUpPage = new SignUpPage(page);
		await signUpPage.goto();
		await signUpPage.nameInput.fill('Test User');
		await signUpPage.emailInput.fill('invalid-email');
		await signUpPage.passwordInput.fill('Password123!');
		await signUpPage.confirmPasswordInput.fill('Password123!');
		await signUpPage.submitButton.click();
		await signUpPage.assertErrorMessage('');
	});

	test('should navigate to sign-in page', async ({ page }) => {
		const signUpPage = new SignUpPage(page);
		await signUpPage.goto();
		await signUpPage.signInLink.click();
		await expect(page).toHaveURL(/\/login\//);
	});
});

test.describe('Forgot Password Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.context().clearCookies();
		await page.context().clearPermissions();
	});

	test('should load forgot password page', async ({ page }) => {
		await page.goto('/forgot-password', { timeout: 30000 });
		await expect(page).toHaveURL(/\/forgot-password\//);
	});

	test('should display email input and submit button', async ({ page }) => {
		await page.goto('/forgot-password', { timeout: 30000 });
		await expect(page.locator('input[id="email"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toBeVisible();
	});

	test('should display validation error for empty email', async ({ page }) => {
		await page.goto('/forgot-password', { timeout: 30000 });
		await page.locator('button[type="submit"]').click();
		await expect(page.locator('.text-destructive, [class*="destructive"]')).toBeVisible();
	});

	test('should display validation error for invalid email format', async ({ page }) => {
		await page.goto('/forgot-password', { timeout: 30000 });
		await page.locator('input[id="email"]').fill('notanemail');
		await page.locator('button[type="submit"]').click();
		await expect(page.locator('.text-destructive, [class*="destructive"]')).toBeVisible();
	});

	test('should navigate back to sign-in page', async ({ page }) => {
		await page.goto('/forgot-password', { timeout: 30000 });
		const signInLink = page.locator('a[href="/login"]');
		await expect(signInLink).toBeVisible();
		await signInLink.click();
		await expect(page).toHaveURL(/\/login\//);
	});
});

test.describe('Auth Page Navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.context().clearCookies();
		await page.context().clearPermissions();
	});

	test('should navigate from sign-in to sign-up', async ({ page }) => {
		await page.goto('/login', { timeout: 30000 });
		await page.locator('a[href="/register"]').click();
		await expect(page).toHaveURL(/\/register\//);
	});

	test('should navigate from sign-up to sign-in', async ({ page }) => {
		await page.goto('/register', { timeout: 30000 });
		await page.locator('a[href="/login"]').click();
		await expect(page).toHaveURL(/\/login\//);
	});

	test('should navigate from sign-in to forgot-password', async ({ page }) => {
		await page.goto('/login', { timeout: 30000 });
		await page.locator('a[href="/forgot-password"]').click();
		await expect(page).toHaveURL(/\/forgot-password\//);
	});

	test('should navigate from forgot-password to sign-in', async ({ page }) => {
		await page.goto('/forgot-password', { timeout: 30000 });
		await page.locator('a[href="/login"]').click();
		await expect(page).toHaveURL(/\/login\//);
	});

	test('should navigate from sign-up to sign-in and back to sign-up', async ({ page }) => {
		await page.goto('/register', { timeout: 30000 });
		await page.locator('a[href="/login"]').click();
		await expect(page).toHaveURL(/\/login\//);
		await page.locator('a[href="/register"]').click();
		await expect(page).toHaveURL(/\/register\//);
	});
});
