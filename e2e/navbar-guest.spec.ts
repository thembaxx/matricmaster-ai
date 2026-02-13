import { expect, test } from '@playwright/test';

test.describe('Navbar - Guest User', () => {
	test('hamburger menu is hidden and sign in button is visible when not logged in', async ({
		page,
	}) => {
		// Navigate to home page (not logged in)
		await page.goto('/');

		// Check hamburger menu is NOT visible
		const hamburgerMenu = page.locator('button:has(.lucide-menu)');
		await expect(hamburgerMenu).not.toBeVisible();

		// Check sign in button is visible in the navbar
		const signInButton = page.locator('button:has-text("Sign in")');
		await expect(signInButton).toBeVisible();

		// Click sign in button and verify navigation
		await signInButton.click();
		await page.waitForURL(/\/sign-in/);
		await expect(page).toHaveURL(/\/sign-in/);
	});

	test('hamburger menu is visible when logged in', async ({ page }) => {
		// Sign up first
		const timestamp = Date.now();
		const email = `testnav-${timestamp}@matricmaster.test`;
		const password = 'password123';

		await page.goto('/sign-up');
		await page.fill('input[name="name"]', 'Test User');
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', password);
		await page.click('button[type="submit"]');
		await page.waitForURL(/\/dashboard/, { timeout: 60000 });

		// Navigate to home
		await page.goto('/');

		// Check hamburger menu IS visible
		const hamburgerMenu = page.locator('button:has(.lucide-menu)');
		await expect(hamburgerMenu).toBeVisible();

		// Check sign in button is NOT visible
		const signInButton = page.locator('button:has-text("Sign in")');
		await expect(signInButton).not.toBeVisible();
	});
});
