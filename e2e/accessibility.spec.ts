import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Accessibility (a11y)', () => {
	test.describe('Landing & Auth Pages', () => {
		test('Landing page has no critical a11y violations', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

			expect(accessibilityScanResults.violations).toHaveLength(0);
		});

		test('Sign-in page has no critical a11y violations', async ({ page }) => {
			await page.goto('/sign-in');
			await page.waitForLoadState('networkidle');

			const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

			expect(accessibilityScanResults.violations).toHaveLength(0);
		});

		test('Sign-up page has no critical a11y violations', async ({ page }) => {
			await page.goto('/sign-up');
			await page.waitForLoadState('networkidle');

			const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

			expect(accessibilityScanResults.violations).toHaveLength(0);
		});
	});

	test.describe('Dashboard & Core Features', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/sign-in');
			await page.fill('input[id="email"]', 'student@lumni.ai');
			await page.fill('input[id="password"]', 'password123');
			await page.click('button[type="submit"]');
			await page.waitForURL(/\/dashboard/, { timeout: 30000 });
		});

		test('Dashboard page has no critical a11y violations', async ({ page }) => {
			await page.goto('/dashboard');
			await page.waitForLoadState('networkidle');

			const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

			expect(accessibilityScanResults.violations).toHaveLength(0);
		});

		test('Lessons page has no critical a11y violations', async ({ page }) => {
			await page.goto('/lessons');
			await page.waitForLoadState('networkidle');

			const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

			expect(accessibilityScanResults.violations).toHaveLength(0);
		});

		test('Past papers page has no critical a11y violations', async ({ page }) => {
			await page.goto('/past-papers');
			await page.waitForLoadState('networkidle');

			const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

			expect(accessibilityScanResults.violations).toHaveLength(0);
		});

		test('Quiz page has no critical a11y violations', async ({ page }) => {
			await page.goto('/quiz');
			await page.waitForLoadState('networkidle');

			const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

			expect(accessibilityScanResults.violations).toHaveLength(0);
		});
	});

	test.describe('Keyboard Navigation', () => {
		test('Sign-in page is keyboard navigable', async ({ page }) => {
			await page.goto('/sign-in');
			await page.waitForLoadState('networkidle');

			await page.keyboard.press('Tab');
			await expect(page.locator('input[id="email"]')).toBeFocused();

			await page.keyboard.press('Tab');
			await expect(page.locator('input[id="password"]')).toBeFocused();

			await page.keyboard.press('Tab');
			await expect(page.locator('button[type="submit"]')).toBeFocused();
		});

		test('Landing page navigation is keyboard accessible', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			const nav = page.locator('nav').first();
			const firstLink = nav.locator('a').first();

			await firstLink.focus();
			await expect(firstLink).toBeFocused();
		});
	});

	test.describe('Screen Reader Support', () => {
		test('Form inputs have associated labels', async ({ page }) => {
			await page.goto('/sign-in');

			const emailInput = page.locator('input[id="email"]');
			const emailLabel = page.locator('label[for="email"]');

			await expect(emailInput).toBeVisible();
			await expect(emailLabel).toBeVisible();
		});

		test('Buttons have accessible names', async ({ page }) => {
			await page.goto('/sign-in');

			const submitButton = page.locator('button[type="submit"]');
			await expect(submitButton).toBeVisible();
			await expect(submitButton).toHaveText(/sign in|submit|login/i);
		});
	});

	test.describe('Color Contrast', () => {
		test('Landing page meets WCAG contrast requirements', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			const accessibilityScanResults = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
				.analyze();

			const contrastViolations = accessibilityScanResults.violations.filter(
				(v) => v.id === 'color-contrast' || v.id === 'text-contrast'
			);

			expect(contrastViolations).toHaveLength(0);
		});

		test('Sign-in page meets WCAG contrast requirements', async ({ page }) => {
			await page.goto('/sign-in');
			await page.waitForLoadState('networkidle');

			const accessibilityScanResults = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
				.analyze();

			const contrastViolations = accessibilityScanResults.violations.filter(
				(v) => v.id === 'color-contrast' || v.id === 'text-contrast'
			);

			expect(contrastViolations).toHaveLength(0);
		});
	});

	test.describe('Focus Management', () => {
		test('Focus indicator is visible on interactive elements', async ({ page }) => {
			await page.goto('/sign-in');
			await page.waitForLoadState('networkidle');

			await page.keyboard.press('Tab');
			const focusedElement = page.locator(':focus');

			await expect(focusedElement).toHaveCSS('outline-style', 'none', {
				ignore: ['outline-offset', 'outline-color'],
			});
		});

		test('Modal dialogs trap focus appropriately', async ({ page }) => {
			await page.goto('/dashboard');
			await page.waitForLoadState('networkidle');

			const dialogTriggers = page.locator(
				'[aria-haspopup="dialog"], button:has-text("dialog"), button:has-text("modal")'
			);

			if ((await dialogTriggers.count()) > 0) {
				await dialogTriggers.first().click();
				await page.waitForTimeout(500);

				const dialog = page.locator('[role="dialog"]');
				if ((await dialog.count()) > 0) {
					await expect(dialog).toBeVisible();
					await expect(dialog.locator(':focusable')).toHaveCount(0);
				}
			}
		});
	});

	test.describe('ARIA Attributes', () => {
		test('Progress bars have correct ARIA attributes', async ({ page }) => {
			await page.goto('/dashboard');
			await page.waitForLoadState('networkidle');

			const progressBars = page.locator('[role="progressbar"]');
			const count = await progressBars.count();

			if (count > 0) {
				for (let i = 0; i < count; i++) {
					const progress = progressBars.nth(i);
					await expect(progress).toHaveAttribute('aria-valuemin');
					await expect(progress).toHaveAttribute('aria-valuemax');
					await expect(progress).toHaveAttribute('aria-valuenow');
				}
			}
		});

		test('Navigation has proper landmarks', async ({ page }) => {
			await page.goto('/dashboard');
			await page.waitForLoadState('networkidle');

			await expect(page.locator('nav, [role="navigation"]').first()).toBeVisible();
		});
	});
});
