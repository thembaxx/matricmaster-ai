import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 2 : undefined,
	outputDir: 'test-results/artifacts',
	reporter: [
		['html', { outputFolder: 'test-results/html', open: 'never' }],
		['list'],
		[
			'json',
			{
				outputFile: 'test-results/results.json',
			},
		],
	],
	expect: {
		timeout: 10000,
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.05,
		},
	},
	timeout: 60000,

	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 1280, height: 720 },
			},
			retries: 2,
		},
		{
			name: 'firefox',
			use: {
				...devices['Desktop Firefox'],
				viewport: { width: 1280, height: 720 },
			},
			retries: 2,
		},
		{
			name: 'webkit',
			use: {
				...devices['Desktop Safari'],
				viewport: { width: 1280, height: 720 },
			},
			retries: 2,
		},
		{
			name: 'Mobile Chrome',
			use: {
				...devices['Pixel 7'],
			},
			retries: 2,
		},
		{
			name: 'Mobile Safari',
			use: {
				...devices['iPhone 14 Pro'],
			},
			retries: 2,
		},
	],

	use: {
		baseURL: process.env.BASE_URL || 'http://localhost:3000',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		actionTimeout: 15000,
		launchOptions: {
			args: ['--disable-dev-shm-usage', '--disable-gpu', '--no-sandbox'],
		},
		locale: 'en-ZA',
		timezoneId: 'Africa/Johannesburg',
	},

	webServer: {
		command: 'bun run dev',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
		stdout: 'pipe',
		stderr: 'pipe',
		timeout: 180000,
	},
});
