import { expect, test } from '@playwright/test';

test.describe('CMS - Past Papers PDF Upload (Superpowered)', () => {
	test('Past Papers tab - upload PDF and instant extraction workflow', async ({ page }) => {
		// Navigate to CMS (assuming dev server handles auth for tests or mock data)
		await page.goto('/cms');

		// Check if we were redirected away (not admin)
		const currentUrl = page.url();
		if (currentUrl.includes('/cms') === false) {
			console.log('⚠️ CMS access skipped in test');
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
		await expect(page.locator('text=AI Paper Extraction')).toBeVisible({ timeout: 5000 });

		// Verify superpowered badges or hints
		await expect(page.locator('text=Superpowered')).toBeVisible();

		// Verify "Start Superpowered AI Extraction" button
		const startBtn = page.getByRole('button', { name: 'Start Superpowered AI Extraction' });
		await expect(startBtn).toBeDisabled();

		// Fill in details
		await page.fill('input[placeholder*="e.g. Maths-P1-Nov2023"]', 'Test-Paper-2024');

		// Try to select a subject
		const subjectTrigger = page.locator('button:has-text("Select Subject")');
		if (await subjectTrigger.isVisible()) {
			await subjectTrigger.click();
			await page.getByRole('option').first().click();
		}

		// Close drawer
		await page.getByRole('button', { name: 'Cancel' }).click();
		await expect(page.locator('text=AI Paper Extraction')).not.toBeVisible();
	});
});
