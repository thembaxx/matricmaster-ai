import { expect, test } from '@playwright/test';

test.describe('Health Check API', () => {
	test('should return health status without authentication', async ({ request }) => {
		const response = await request.get('/api/health');

		// Health check should be publicly accessible for monitoring
		expect(response.status()).toBe(200);
		const healthData = await response.json();

		expect(healthData).toHaveProperty('status');
		expect(healthData).toHaveProperty('timestamp');
		expect(healthData).toHaveProperty('health');
		expect(healthData).toHaveProperty('monitoring');

		expect(healthData.status).toBe('ok');
		expect(healthData.health).toHaveProperty('gemini');
		expect(healthData.health).toHaveProperty('uploadThing');
		expect(healthData.health).toHaveProperty('overall');

		// Check monitoring data
		expect(healthData.monitoring).toHaveProperty('totalLogs');
		expect(healthData.monitoring).toHaveProperty('errorCount');
		expect(healthData.monitoring).toHaveProperty('warningCount');
		expect(healthData.monitoring).toHaveProperty('successRate');
	});

	test('should handle clear-logs action without authentication', async ({ request }) => {
		const response = await request.post('/api/health', {
			data: { action: 'clear-logs' },
		});

		// Clear logs should be publicly accessible
		expect(response.status()).toBe(200);
		const result = await response.json();

		expect(result).toHaveProperty('success', true);
		expect(result).toHaveProperty('message', 'Logs cleared');
	});

	test('should handle run-health-check action without authentication', async ({ request }) => {
		const response = await request.post('/api/health', {
			data: { action: 'run-health-check' },
		});

		// Run health check should be publicly accessible
		expect(response.status()).toBe(200);
		const healthData = await response.json();

		expect(healthData).toHaveProperty('gemini');
		expect(healthData).toHaveProperty('uploadThing');
		expect(healthData).toHaveProperty('health');

		// Check gemini health check
		expect(healthData.gemini).toHaveProperty('status');
		expect(['healthy', 'unhealthy', 'unknown']).toContain(healthData.gemini.status);

		// Check upload thing health check
		expect(healthData.uploadThing).toHaveProperty('status');
		expect(['healthy', 'unhealthy', 'unknown']).toContain(healthData.uploadThing.status);
	});

	test('should return 400 for invalid action', async ({ request }) => {
		const response = await request.post('/api/health', {
			data: { action: 'invalid-action' },
		});

		// Should return 400 for invalid action
		expect(response.status()).toBe(400);
		const result = await response.json();

		expect(result).toHaveProperty('error', 'Invalid action');
	});

	test('should return 400 for malformed request', async ({ request }) => {
		const response = await request.post('/api/health', {
			data: 'invalid-json',
		});

		// Should return 400 for malformed JSON
		expect(response.status()).toBe(400);
	});
});
