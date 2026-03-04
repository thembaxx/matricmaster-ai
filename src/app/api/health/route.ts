import { NextResponse } from 'next/server';
import { healthCheck, monitoring, performance } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
	try {
		// Run health checks
		const [geminiCheck, uploadThingCheck] = await Promise.all([
			healthCheck.checkGemini(),
			healthCheck.checkUploadThing(),
		]);

		// Get monitoring stats
		const stats = monitoring.getStats();
		const perfStats = performance.getStats();

		const healthStatus = healthCheck.getHealthStatus();

		const response = {
			status: 'ok',
			timestamp: new Date().toISOString(),
			health: {
				...healthStatus,
				services: {
					gemini: geminiCheck,
					uploadThing: uploadThingCheck,
				},
			},
			monitoring: {
				...stats,
				performance: perfStats,
			},
		};

		return NextResponse.json(response);
	} catch (error) {
		const response = {
			status: 'error',
			timestamp: new Date().toISOString(),
			error: error instanceof Error ? error.message : 'Unknown error',
			health: healthCheck.getHealthStatus(),
		};

		return NextResponse.json(response, { status: 500 });
	}
}

export async function POST(request: Request) {
	const body = await request.json();

	if (body.action === 'clear-logs') {
		monitoring.clearLogs();
		return NextResponse.json({ success: true, message: 'Logs cleared' });
	}

	if (body.action === 'run-health-check') {
		const geminiCheck = await healthCheck.checkGemini();
		const uploadThingCheck = await healthCheck.checkUploadThing();

		return NextResponse.json({
			gemini: geminiCheck,
			uploadThing: uploadThingCheck,
			health: healthCheck.getHealthStatus(),
		});
	}

	return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
