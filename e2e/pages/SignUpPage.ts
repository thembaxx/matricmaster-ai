import { expect, type Locator, type Page } from '@playwright/test';

export class SignUpPage {
	readonly page: Page;
	readonly nameInput: Locator;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly confirmPasswordInput: Locator;
	readonly submitButton: Locator;
	readonly errorMessage: Locator;
	readonly successMessage: Locator;
	readonly signInLink: Locator;

	constructor(page: Page) {
		this.page = page;
		this.nameInput = page.locator('input[id="name"]');
		this.emailInput = page.locator('input[id="email"]');
		this.passwordInput = page.locator('input[id="password"]');
		this.confirmPasswordInput = page.locator('input[id="confirmPassword"]');
		this.submitButton = page.locator('button[type="submit"]');
		this.errorMessage = page.locator('.text-destructive, [class*="destructive"]');
		this.successMessage = page.locator('.bg-success, [class*="success"]');
		this.signInLink = page.locator('a[href="/login"]');
	}

	async goto() {
		await this.page.goto('/register');
	}

	async register(name: string, email: string, password: string) {
		await this.nameInput.fill(name);
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
		await this.submitButton.click();
	}

	async assertRegistrationSuccess() {
		await expect(this.successMessage).toBeVisible({ timeout: 15000 });
	}

	async assertErrorMessage(expectedText: string) {
		await expect(this.errorMessage).toContainText(expectedText, { timeout: 10000 });
	}

	async assertPageLoaded() {
		await expect(this.nameInput).toBeVisible();
		await expect(this.emailInput).toBeVisible();
		await expect(this.submitButton).toBeVisible();
	}
}
