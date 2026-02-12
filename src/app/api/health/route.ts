import { apiError, apiSuccess } from '@/lib/api-utils';
import { dbManager } from '@/lib/db';

export async function GET() {
	try {
		const isConnected = await dbManager.waitForConnection(3, 1000);

		if (isConnected) {
			return apiSuccess({
				status: 'healthy',
				database: 'connected',
				timestamp: new Date().toISOString(),
			});
		}

		return apiError('Database connection failed', 503, {
			status: 'degraded',
			database: 'disconnected',
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		return apiError('Health check failed', 500, {
			status: 'unhealthy',
			database: 'error',
			error: error instanceof Error ? error.message : 'Unknown error',
			timestamp: new Date().toISOString(),
		});
	}
}
