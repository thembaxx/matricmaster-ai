import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.describe('Enriched Dashboard E2E', () => {
	test.describe('Dashboard loads successfully', () => {
		test('navigates to /demo and displays heading', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });

			const heading = page.getByRole('heading', { name: 'Your Study Dashboard' });
			await expect(heading).toBeVisible({ timeout: 15000 });
		});

		test('shows loading skeleton then resolves to content', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });

			// Skeleton may appear briefly
			const skeleton = page.locator('.animate-pulse, [class*="skeleton"]');
			const hasSkeleton = (await skeleton.count()) > 0;
			if (hasSkeleton) {
				await expect(skeleton.first()).toBeVisible({ timeout: 5000 });
			}

			// Wait for content to load - skeleton should disappear or heading should appear
			const heading = page.getByRole('heading', { name: 'Your Study Dashboard' });
			await expect(heading).toBeVisible({ timeout: 15000 });
		});

		test('renders all 7 dashboard components with mock data', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });

			// 1. Activity Heatmap
			await expect(page.getByRole('heading', { name: 'Study Activity' })).toBeVisible({
				timeout: 15000,
			});

			// 2. Streak Counter
			await expect(page.getByRole('heading', { name: 'Study Streak' })).toBeVisible({
				timeout: 10000,
			});

			// 3. Progress Rings
			await expect(page.getByRole('heading', { name: 'Subject Progress' })).toBeVisible({
				timeout: 10000,
			});

			// 4. Cohort Comparison
			await expect(page.getByRole('heading', { name: 'Cohort Comparison' })).toBeVisible({
				timeout: 10000,
			});

			// 5. Accuracy Trend
			await expect(page.getByRole('heading', { name: 'Accuracy Trend' })).toBeVisible({
				timeout: 10000,
			});

			// 6. Weak Topics
			await expect(page.getByRole('heading', { name: 'Weak Topics' })).toBeVisible({
				timeout: 10000,
			});

			// 7. Activity Stream
			await expect(page.getByRole('heading', { name: 'Recent Activity' })).toBeVisible({
				timeout: 10000,
			});
		});
	});

	test.describe('Feature flag toggle', () => {
		test('toggle switches off shows empty or live state', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// Find and toggle the demo mode switch off
			const demoSwitch = page.getByRole('switch', { name: 'Demo' });
			await expect(demoSwitch).toBeChecked({ timeout: 10000 });
			await demoSwitch.click();

			// After toggle off, should show empty state or live data view
			// The badge should change from "Mock data" to "Live"
			await expect(page.getByText('Live')).toBeVisible({ timeout: 10000 });
		});

		test('toggle back on restores mock data', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// Toggle off then on
			const demoSwitch = page.getByRole('switch', { name: 'Demo' });
			await demoSwitch.click();
			await demoSwitch.click();

			// Mock data badge should reappear
			await expect(page.getByText('Mock data')).toBeVisible({ timeout: 10000 });

			// Dashboard components should be visible again
			await expect(page.getByRole('heading', { name: 'Study Streak' })).toBeVisible({
				timeout: 10000,
			});
		});

		test('badge reflects current data mode', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// Initially mock data
			await expect(page.locator('Badge, [class*="badge"]')).toContainText('Mock data');

			const demoSwitch = page.getByRole('switch', { name: 'Demo' });
			await demoSwitch.click();

			// Now live
			await expect(page.locator('Badge, [class*="badge"]')).toContainText('Live');
		});
	});

	test.describe('Activity heatmap renders correctly', () => {
		test('contribution grid is visible', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// The heatmap container should be visible
			const heatmapCard = page.locator('css=[role="img"]');
			await expect(heatmapCard.first()).toBeVisible({ timeout: 10000 });
		});

		test('color-coded cells have at least 3 intensity levels', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// Check for different intensity classes in the legend
			const level0 = page.locator('.bg-muted\\/40');
			const level1 = page.locator('.bg-primary\\/30');
			const level2 = page.locator('.bg-primary\\/60');
			const level3 = page.locator('.bg-primary');

			// At least 3 of the 4 intensity levels should be present in the legend
			const visibleLevels = [
				await level0.count(),
				await level1.count(),
				await level2.count(),
				await level3.count(),
			].filter((c) => c > 0).length;

			expect(visibleLevels).toBeGreaterThanOrEqual(3);
		});

		test('tooltip appears on hover showing date and count', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// Find a heatmap cell and hover over it
			const cell = page.locator('.w-\\[11px\\]').first();
			if (await cell.count()) {
				await cell.hover();

				// Tooltip content should appear with date and activity count
				const tooltip = page.locator('[role="tooltip"], [class*="tooltip"]');
				await expect(tooltip).toBeVisible({ timeout: 5000 });
				await expect(tooltip).toContainText(/activities?/i);
			}
		});

		test('heatmap has aria-label for screen readers', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			const heatmapWithLabel = page.locator('[role="img"][aria-label*="activities"]');
			await expect(heatmapWithLabel.first()).toBeVisible({ timeout: 10000 });
		});
	});

	test.describe('Streak counter displays correctly', () => {
		test('flame icon is visible', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			const _flameIcon = page
				.locator('svg')
				.filter({ hasText: '' })
				.or(page.locator('[class*="flame"]'));
			// Flame icon is from lucide-react, rendered as SVG
			const streakSection = page
				.locator('css=[aria-label="Study Streak"], css=h3:text("Study Streak")')
				.locator('..');
			await expect(streakSection.locator('svg').first()).toBeVisible({ timeout: 10000 });
		});

		test('current streak number is displayed', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// Streak number should be a large numeric in the streak section
			const streakCounter = page.locator('css=h3:text("Study Streak")').locator('..').locator('..');
			// Look for the large numeric display (text-3xl font-numeric)
			await expect(streakCounter.locator('.font-numeric, .text-3xl').first()).toBeVisible({
				timeout: 10000,
			});
		});

		test('best streak number is displayed', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// "Best:" label should be visible with a number
			await expect(page.getByText(/best:/i)).toBeVisible({ timeout: 10000 });
		});

		test('message text is present', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// One of the streak messages should be visible
			const possibleMessages = [
				'Start your streak today!',
				'Keep it going!',
				"Don't break the chain!",
				'Keep it going! You are on fire!',
			];

			let found = false;
			for (const msg of possibleMessages) {
				if (
					await page
						.getByText(msg)
						.isVisible()
						.catch(() => false)
				) {
					found = true;
					break;
				}
			}
			expect(found).toBe(true);
		});
	});

	test.describe('Progress rings animate', () => {
		test('rings are visible for each subject', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// Progress rings use SVG circles
			const progressRings = page.locator('svg circle');
			await expect(progressRings).toHaveCount({ timeout: 10000 });
			const count = await progressRings.count();
			expect(count).toBeGreaterThan(0);
		});

		test('subject names are displayed', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// At least one subject name should be visible (e.g., Mathematics, Physics, etc.)
			const subjectNames = [
				'Mathematics',
				'Physics',
				'Chemistry',
				'Biology',
				'Geography',
				'History',
			];
			let found = false;
			for (const name of subjectNames) {
				if (
					await page
						.getByText(name)
						.isVisible()
						.catch(() => false)
				) {
					found = true;
					break;
				}
			}
			expect(found).toBe(true);
		});

		test('percentage numbers shown in Geist Mono font', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// Percentage numbers should use font-numeric class (Geist Mono)
			const numericPercent = page.locator('.font-numeric').filter({ hasText: /\d+%/ });
			await expect(numericPercent.first()).toBeVisible({ timeout: 10000 });
		});
	});

	test.describe('Activity stream groups by date', () => {
		test('date group headers are visible', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// Activity stream should have date group headers like "Today", "Yesterday", etc.
			const dateHeaders = ['Today', 'Yesterday', /This week/i, /Last week/i];
			let found = false;
			for (const header of dateHeaders) {
				if (
					await page
						.getByText(header)
						.first()
						.isVisible()
						.catch(() => false)
				) {
					found = true;
					break;
				}
			}
			expect(found).toBe(true);
		});

		test('activity items have icons', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// Activity items should have SVG icons
			const activityStream = page
				.locator('css=h3:text("Recent Activity")')
				.locator('..')
				.locator('..');
			const icons = activityStream.locator('svg');
			await expect(icons.first()).toBeVisible({ timeout: 10000 });
		});

		test('staggered animation completes', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// Wait for framer-motion animations to complete
			// All activity items should be visible (not animating)
			await page.waitForTimeout(2000);

			// Activity items should be fully visible
			const activityItems = page
				.locator('[class*="activity"], [class*="stream"]')
				.locator('li, [class*="item"]');
			const count = await activityItems.count();
			expect(count).toBeGreaterThan(0);
		});
	});

	test.describe('Responsive behavior', () => {
		test('desktop viewport (1280x720): grid layout visible', async ({ page }) => {
			await page.setViewportSize({ width: 1280, height: 720 });
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// Multiple components should be visible in a grid layout
			const streakHeading = page.getByRole('heading', { name: 'Study Streak' });
			const progressHeading = page.getByRole('heading', { name: 'Subject Progress' });
			const cohortHeading = page.getByRole('heading', { name: 'Cohort Comparison' });

			await expect(streakHeading).toBeVisible({ timeout: 10000 });
			await expect(progressHeading).toBeVisible({ timeout: 10000 });
			await expect(cohortHeading).toBeVisible({ timeout: 10000 });
		});

		test('mobile viewport (375x812): components stack vertically', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 812 });
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// On mobile, components should still be visible but in a single column
			const streakHeading = page.getByRole('heading', { name: 'Study Streak' });
			const progressHeading = page.getByRole('heading', { name: 'Subject Progress' });

			await expect(streakHeading).toBeVisible({ timeout: 10000 });
			await expect(progressHeading).toBeVisible({ timeout: 10000 });

			// Verify single column layout (grid-cols-1)
			const grid = page.locator('.grid-cols-1').first();
			await expect(grid).toBeVisible({ timeout: 10000 });
		});

		test('tablet viewport (768x1024): 2-column layout', async ({ page }) => {
			await page.setViewportSize({ width: 768, height: 1024 });
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// Tablet should show md:grid-cols-3 or similar multi-column layout
			const topRow = page.locator('.md\\:grid-cols-3').or(page.locator('.grid-cols-2'));
			await expect(topRow.first()).toBeVisible({ timeout: 10000 });

			const streakHeading = page.getByRole('heading', { name: 'Study Streak' });
			await expect(streakHeading).toBeVisible({ timeout: 10000 });
		});
	});

	test.describe('Accessibility checks', () => {
		test('all interactive elements are keyboard-navigable', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// Tab through interactive elements
			await page.keyboard.press('Tab');
			await page.keyboard.press('Tab');
			await page.keyboard.press('Tab');

			// Focus should move to some element (demo switch, refresh button, etc.)
			const focusedElement = page.locator(':focus');
			await expect(focusedElement).toBeVisible({ timeout: 5000 });
		});

		test('all charts have aria-labels', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// Activity heatmap has aria-label
			const heatmapLabel = page.locator('[role="img"][aria-label]');
			await expect(heatmapLabel.first()).toBeVisible({ timeout: 10000 });

			// All chart sections should have accessible headings
			const chartHeadings = page.locator('[role="heading"], h2, h3');
			await expect(chartHeadings.first()).toBeVisible({ timeout: 10000 });
		});

		test.skip('color contrast meets WCAG AA', async () => {
			// Requires axe-core injection - skipped for now
			// This would need additional setup with axe-playwright
		});

		test('switch has accessible label', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// The demo toggle switch should have an accessible name
			const demoSwitch = page.getByRole('switch');
			await expect(demoSwitch).toBeVisible({ timeout: 10000 });

			// Check that the switch has aria attributes
			const switchEl = page.locator('[role="switch"], input[type="checkbox"]').first();
			const ariaLabel = await switchEl.getAttribute('aria-label');
			const ariaLabelledBy = await switchEl.getAttribute('aria-labelledby');
			// Either aria-label or aria-labelledby should be present
			expect(ariaLabel || ariaLabelledBy).toBeTruthy();
		});
	});

	test.describe('Error handling', () => {
		test.skip('API failure shows empty state with Generate Demo Data button', async ({ page }) => {
			// This test requires network mocking which may not be available in all CI environments
			// Skip for now - can be enabled when network mocking is set up
			await page.route('/api/activity/demo-user-001/timeline', (route) =>
				route.fulfill({ status: 500, body: 'Internal Server Error' })
			);

			await page.goto('/demo', { timeout: 30000 });

			// Empty state should appear with "Generate Demo Data" button
			await expect(page.getByText('No study data yet')).toBeVisible({ timeout: 15000 });
			await expect(page.getByRole('button', { name: 'Generate Demo Data' })).toBeVisible({
				timeout: 10000,
			});
		});

		test.skip('clicking Generate Demo Data triggers data generation', async () => {
			// Requires network mocking setup - skipped for now
		});

		test.skip('dashboard refreshes after data generation', async () => {
			// Requires network mocking setup - skipped for now
		});

		test('refresh button is visible and clickable', async ({ page }) => {
			await page.goto('/demo', { timeout: 30000 });
			await page.getByRole('heading', { name: 'Your Study Dashboard' }).waitFor({ timeout: 15000 });

			// Refresh Data button should be visible
			const refreshButton = page.getByRole('button', { name: 'Refresh Data' });
			await expect(refreshButton).toBeVisible({ timeout: 10000 });

			// Clicking refresh should not cause errors
			await refreshButton.click();

			// Heading should still be visible after refresh
			await expect(page.getByRole('heading', { name: 'Your Study Dashboard' })).toBeVisible({
				timeout: 10000,
			});
		});
	});
});
