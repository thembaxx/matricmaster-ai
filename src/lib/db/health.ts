import { dbManager } from './index';

export async function checkDatabaseHealth() {
	try {
		const isConnected = await dbManager.waitForConnection(3, 1000);
		return {
			connected: isConnected,
			timestamp: new Date().toISOString(),
		};
	} catch (error) {
		return {
			connected: false,
			error: (error as Error).message,
			timestamp: new Date().toISOString(),
		};
	}
}

export async function waitForDatabase(timeoutMs = 30000): Promise<boolean> {
	const startTime = Date.now();

	while (Date.now() - startTime < timeoutMs) {
		const isConnected = await dbManager.waitForConnection(1, 1000);
		if (isConnected) {
			return true;
		}
		// Wait 2 seconds before next attempt
		await new Promise((resolve) => setTimeout(resolve, 2000));
	}

	return false;
}

export function getDatabaseStatus() {
	return {
		isConnected: dbManager.isConnectedToDatabase(),
		hasClient: !!dbManager.getClient(),
		hasDb: !!dbManager.getDb(),
	};
}
