import { type NextRequest, NextResponse } from 'next/server';
import { initAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';

// Simple authorization check - verify request is from localhost or has valid header
function isAuthorized(request: NextRequest): boolean {
	// Allow requests from localhost
	const forwarded = request.headers.get('x-forwarded-for');
	const remoteAddress = forwarded?.split(',')[0]?.trim();

	// Check if request is from localhost
	if (
		remoteAddress === '127.0.0.1' ||
		remoteAddress === '::1' ||
		remoteAddress === '::ffff:127.0.0.1' ||
		!remoteAddress
	) {
		return true;
	}

	// Check for a shared secret header (for programmatic access)
	const apiKey = request.headers.get('x-api-key');
	if (apiKey && apiKey === process.env.INTERNAL_API_KEY) {
		return true;
	}

	return false;
}

export async function POST(request: NextRequest) {
	// Add authorization guard
	if (!isAuthorized(request)) {
		console.warn('⚠️ API: Unauthorized attempt to initialize database');
		return NextResponse.json(
			{
				success: false,
				message: 'Unauthorized',
			},
			{ status: 401 }
		);
	}

	try {
		console.log('🔄 API: Initializing database connection...');

		await dbManager.initialize();

		if (dbManager.isConnectedToDatabase()) {
			console.log('✅ API: Database initialized successfully');

			// Isolate initAuth() in its own try-catch
			try {
				await initAuth();
			} catch (authError) {
				console.error('❌ API: Error initializing auth after DB init:', authError);
				// DB is initialized but auth failed - still return success but log clearly
				return NextResponse.json({
					success: true,
					message: 'Database connected, but auth initialization failed',
					connected: true,
					authInitialized: false,
				});
			}

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
		// Log full error server-side
		console.error('❌ API: Error initializing database:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Internal server error',
				connected: false,
			},
			{ status: 500 }
		);
	}
}

export async function GET() {
	return NextResponse.json({
		connected: dbManager.isConnectedToDatabase(),
		available: dbManager.isPostgreSQLAvailable(),
	});
}
