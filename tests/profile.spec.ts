import { expect, test } from '@playwright/test';

test('should display profile page with radar chart', async ({ page }) => {
	await page.goto('http://localhost:3000/profile');

	// Wait for the profile name to be visible
	await expect(page.locator('h2')).toContainText('Thabo Mbeki');

	// Check for the 95% highlight
	await expect(page.getByText('95%')).toBeVisible();

	// Verify the radar chart container exists
	const chart = page.locator('.recharts-responsive-container');
	await expect(chart).toBeVisible();
});
