import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 2,
	workers: process.env.CI ? 1 : undefined,
	outputDir: 'test-results/artifacts',
	reporter: [['html', { outputFolder: 'test-results/html' }], ['list']],
	timeout: 60000,
	expect: {
		timeout: 10000,
	},

	use: {
		baseURL: process.env.BASE_URL || 'http://localhost:3000',
		trace: 'on',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		actionTimeout: 30000,
		launchOptions: {
			args: ['--disable-dev-shm-usage'],
		},
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],

	webServer: {
		command: 'bun run dev',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
		stdout: 'pipe',
		stderr: 'pipe',
		timeout: 120000,
	},
});
