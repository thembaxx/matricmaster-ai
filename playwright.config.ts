import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for end-to-end testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: './e2e',
	/* Run tests in files in parallel */
	fullyParallel: false,
	/* Fail the build on CI if you accidentally left test.only in the source code */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI - run tests sequentially */
	workers: 1,
	/* Reporter to use */
	reporter: process.env.CI ? 'line' : 'html',
	/* Timeout settings */
	timeout: 60000,
	expect: {
		timeout: 10000,
	},
	/* Shared settings for all the projects below */
	use: {
		/* Base URL to use in actions like `await page.goto('/')` */
		baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
		/* Collect trace when retrying the failed test */
		trace: 'on-first-retry',
		/* Screenshot on failure */
		screenshot: 'only-on-failure',
		/* Action timeout */
		actionTimeout: 15000,
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],

	/* Run your local dev server before starting the tests - disabled for local testing */
	webServer: undefined,
});
