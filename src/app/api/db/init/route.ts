import { type NextRequest, NextResponse } from 'next/server';
import { reconfigureAuthAfterDbConnection } from '@/lib/auth';
import { dbManager } from '@/lib/db';

export async function POST(_request: NextRequest) {
	try {
		console.log('🔄 API: Initializing database connection...');

		// Initialize the database connection
		await dbManager.initialize();

		if (dbManager.isConnectedToDatabase()) {
			console.log('✅ API: Database initialized successfully');

			// Reconfigure Better Auth with the database connection
			await reconfigureAuthAfterDbConnection();

			return NextResponse.json({
				success: true,
				message: 'Database connected successfully',
				connected: true,
			});
		}
		console.log('❌ API: Database initialization failed');
		return NextResponse.json(
			{
				success: false,
				message: 'Failed to connect to database',
				connected: false,
			},
			{ status: 503 }
		);
	} catch (error) {
		console.error('❌ API: Error initializing database:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Internal server error',
				error: error instanceof Error ? error.message : 'Unknown error',
				connected: false,
			},
			{ status: 500 }
		);
	}
}

// GET endpoint to check database status
export async function GET() {
	return NextResponse.json({
		connected: dbManager.isConnectedToDatabase(),
		available: dbManager.isPostgreSQLAvailable(),
	});
}
