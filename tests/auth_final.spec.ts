import { expect, test } from '@playwright/test';

test('auth pages', async ({ page }) => {
	await page.goto('http://localhost:3000/sign-in');
	await expect(page.locator('h1')).toContainText('Welcome Back');

	await page.goto('http://localhost:3000/sign-up');
	await expect(page.locator('h1')).toContainText('Join the Mission!');
});
