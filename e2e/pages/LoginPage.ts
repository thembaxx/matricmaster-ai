import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
	readonly page: Page;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly submitButton: Locator;
	readonly errorMessage: Locator;
	readonly signUpLink: Locator;
	readonly forgotPasswordLink: Locator;

	constructor(page: Page) {
		this.page = page;
		this.emailInput = page.locator('input[id="email"]');
		this.passwordInput = page.locator('input[id="password"]');
		this.submitButton = page.locator('button[type="submit"]');
		this.errorMessage = page.locator('.text-destructive, [class*="destructive"]');
		this.signUpLink = page.locator('a[href="/sign-up"]');
		this.forgotPasswordLink = page.locator('a[href="/forgot-password"]');
	}

	async goto() {
		await this.page.goto('/sign-in');
	}

	async login(email: string, password: string) {
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
		await this.submitButton.click();
	}

	async assertLoginSuccess() {
		await expect(this.page).toHaveURL(/\/dashboard/);
	}

	async assertErrorMessage(expectedText: string) {
		await expect(this.errorMessage).toContainText(expectedText, { timeout: 10000 });
	}

	async assertPageLoaded() {
		await expect(this.emailInput).toBeVisible();
		await expect(this.passwordInput).toBeVisible();
		await expect(this.submitButton).toBeVisible();
	}
}
