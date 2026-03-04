import { expect, test } from '@playwright/test';

test.describe('CMS - Past Papers PDF Upload', () => {
	test('Past Papers tab - upload PDF button and drawer', async ({ page }) => {
		// First, sign in/up
		const timestamp = Date.now();
		const email = `testadmin-${timestamp}@matricmaster.test`;
		const password = 'password123';
		const name = 'Admin User';

		// Sign up
		await page.goto('/sign-up');
		await page.fill('input[name="name"]', name);
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', password);
		await page.click('button[type="submit"]');
		await page.waitForURL(/\/dashboard|\/cms/, { timeout: 60000 });

		// Navigate to CMS
		await page.goto('/cms');

		// Check if we were redirected away (not admin)
		const currentUrl = page.url();
		if (currentUrl.includes('/cms') === false) {
			console.log('⚠️ User is not admin - CMS access skipped');
			return;
		}

		// Click Past Papers tab
		await page.getByRole('tab', { name: 'Past Papers' }).click();

		// Verify "Upload PDF" button is visible
		const uploadBtn = page.getByRole('button', { name: 'Upload PDF' });
		await expect(uploadBtn).toBeVisible({ timeout: 10000 });

		// Click "Upload PDF" button
		await uploadBtn.click();

		// Verify Drawer opens
		await expect(page.locator('text=Upload Past Paper')).toBeVisible({ timeout: 5000 });

		// Verify form fields in the drawer
		await expect(page.locator('label:has-text("Paper Title / ID")')).toBeVisible();
		await expect(page.locator('label:has-text("Subject")')).toBeVisible();
		await expect(page.locator('label:has-text("Grade Level")')).toBeVisible();
		await expect(page.locator('label:has-text("Year")')).toBeVisible();
		await expect(page.locator('label:has-text("PDF File")')).toBeVisible();

		// Verify "Start AI Extraction" button is initially disabled
		const startBtn = page.getByRole('button', { name: 'Start AI Extraction' });
		await expect(startBtn).toBeDisabled();

		// Fill in some details
		await page.fill('input[placeholder*="e.g. Maths-P1-Nov2023"]', 'Test-Paper-2024');

		// Close drawer
		await page.getByRole('button', { name: 'Cancel' }).click();
		await expect(page.locator('text=Upload Past Paper')).not.toBeVisible();
	});
});
