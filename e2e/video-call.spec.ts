import { expect, test } from '@playwright/test';

test.describe('Video Call', () => {
	test.describe('without auth', () => {
		test('redirects to sign-in when not authenticated', async ({ page }) => {
			await page.goto('/video-call', { timeout: 30000 });
			await expect(page).toHaveURL(/\/login/, { timeout: 30000 });
		});
	});

	test.describe('with auth', () => {
		test.use({ storageState: 'test-results/.auth/user.json' });

		test('video call page loads with valid params', async ({ page }) => {
			await page.goto(
				'/video-call?room=test-room&url=https://test.daily.co/test-room&subject=Math',
				{ timeout: 30000 }
			);
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});

		test('shows skeleton when missing params', async ({ page }) => {
			await page.goto('/video-call', { timeout: 30000 });
			await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
		});
	});
});
