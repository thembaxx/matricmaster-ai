import { expect, test } from '@playwright/test';

test.describe('CMS - Users Tab', () => {
	test('Users tab - complete user flow', async ({ page }) => {
		// First, sign in
		const timestamp = Date.now();
		const email = `testuser-${timestamp}@matricmaster.test`;
		const password = 'password123';
		const name = 'Test User';

		// Sign up
		await page.goto('/sign-up');
		await page.fill('input[name="name"]', name);
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', password);
		await page.click('button[type="submit"]');
		await page.waitForURL(/\/dashboard|\/cms/, { timeout: 60000 });

		// Navigate to CMS - will redirect if not admin
		await page.goto('/cms');

		// Check if we were redirected away (not admin)
		const currentUrl = page.url();
		if (currentUrl.includes('/cms') === false) {
			console.log('⚠️ User is not admin - CMS access skipped');
			return;
		}

		// Click Users tab
		await page.getByRole('tab', { name: 'Users' }).click();

		// Verify search is visible
		await expect(page.locator('input[placeholder*="Search users"]')).toBeVisible({ timeout: 5000 });

		// Test search
		await page.locator('input[placeholder*="Search users"]').fill('test');

		// Wait for content
		await page.waitForTimeout(1000);

		// Get current user card (the one we just signed up with)
		const userCard = page.locator('[class*="cursor-pointer"]').first();

		// Check if we have a user card visible
		const isUserCardVisible = await userCard.isVisible().catch(() => false);

		if (isUserCardVisible) {
			// Click on user card to open drawer
			await userCard.click();
			await page.waitForTimeout(500);

			// Verify drawer opens
			await expect(page.locator('text=User Details')).toBeVisible({ timeout: 5000 });

			// Check Details and Actions tabs
			await expect(page.getByRole('tab', { name: 'Details' })).toBeVisible();
			await expect(page.getByRole('tab', { name: 'Actions' })).toBeVisible();

			// Switch to Actions tab
			await page.getByRole('tab', { name: 'Actions' }).click();
			await page.waitForTimeout(300);

			// Verify action content is visible
			const hasActions = await Promise.all([
				page
					.locator('text=Account Status')
					.isVisible()
					.catch(() => false),
				page
					.locator('text=Danger Zone')
					.isVisible()
					.catch(() => false),
			]);
			expect(hasActions.some(Boolean)).toBe(true);

			// Close drawer
			await page.locator('button:has-text("Close")').click();
			await page.waitForTimeout(300);
		} else {
			// If no user cards, verify empty state
			await expect(page.locator('text=No users found')).toBeVisible();
		}

		// Test filter dropdown
		const filterTrigger = page.locator('[role="combobox"]').first();
		if (await filterTrigger.isVisible().catch(() => false)) {
			await filterTrigger.click();
			await page.waitForTimeout(300);

			// Verify filter options (use first() to avoid strict mode violation)
			await expect(page.locator('text=All Users').first()).toBeVisible();
			await expect(page.locator('text=Active').first()).toBeVisible();

			// Close dropdown
			await page.keyboard.press('Escape');
		}
	});
});
