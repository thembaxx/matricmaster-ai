import { expect, type Locator, type Page } from '@playwright/test';

export class DashboardPage {
	readonly page: Page;
	readonly userGreeting: Locator;
	readonly subjectSelector: Locator;
	readonly aiChatInterface: Locator;
	readonly progressBar: Locator;
	readonly navigationMenu: Locator;

	constructor(page: Page) {
		this.page = page;
		this.userGreeting = page.locator('h1, h2, text=welcome');
		this.subjectSelector = page.locator('[class*="subject"], a[href*="subjects"]');
		this.aiChatInterface = page.locator(
			'[class*="chat"], [class*="ai"], input[placeholder*="ask"]'
		);
		this.progressBar = page.locator('[class*="progress"], [role="progressbar"]');
		this.navigationMenu = page.locator('nav, [class*="nav"], [class*="menu"]');
	}

	async goto() {
		await this.page.goto('/dashboard');
	}

	async assertLoggedIn() {
		await expect(this.page).toHaveURL(/\/dashboard/);
	}

	async assertUserVisible() {
		await expect(this.userGreeting).toBeVisible({ timeout: 15000 });
	}

	async assertSubjectSelector() {
		await expect(this.subjectSelector.first()).toBeVisible({ timeout: 10000 });
	}

	async assertAiChatInterface() {
		await expect(this.aiChatInterface.first()).toBeVisible({ timeout: 10000 });
	}

	async assertPageLoaded() {
		await expect(this.page.locator('body')).toBeVisible();
		await expect(this.navigationMenu).toBeVisible({ timeout: 10000 });
	}

	async takeScreenshot(name: string) {
		await this.page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
	}
}
