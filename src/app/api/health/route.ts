import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/db';

export async function GET() {
	try {
		const isConnected = await dbManager.waitForConnection(3, 1000);

		if (isConnected) {
			return NextResponse.json({
				status: 'healthy',
				database: 'connected',
				timestamp: new Date().toISOString(),
			});
		} else {
			return NextResponse.json(
				{
					status: 'degraded',
					database: 'disconnected',
					timestamp: new Date().toISOString(),
				},
				{ status: 503 }
			);
		}
	} catch (error) {
		return NextResponse.json(
			{
				status: 'unhealthy',
				database: 'error',
				error: (error as Error).message,
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}
