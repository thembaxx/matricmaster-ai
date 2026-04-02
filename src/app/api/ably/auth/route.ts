import Ably from 'ably';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { getEnv } from '@/lib/env';

// Handle GET requests - return method not allowed
export async function GET() {
	return NextResponse.json(
		{ error: 'Method not allowed. Use POST for Ably authentication.' },
		{ status: 405 }
	);
}

export async function POST(request: NextRequest) {
	try {
		// Authenticate the caller
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		// Parse body - Ably sends clientId in body for POST requests with JSON
		// Also check query params as fallback
		const contentType = request.headers.get('content-type') || '';
		let clientId: string | null = null;
		let userId: string | null = null;

		if (contentType.includes('application/json')) {
			try {
				const body = await request.json();
				clientId = body.clientId || body.client_id || null;
				userId = body.userId || body.user_id || null;
			} catch {
				// Failed to parse JSON, fall back to query params
			}
		}

		// Fallback to query params if not found in body
		const { searchParams } = new URL(request.url);
		if (!clientId) {
			clientId = searchParams.get('clientId') || request.nextUrl.searchParams.get('clientId');
		}
		if (!userId) {
			userId = searchParams.get('userId') || request.nextUrl.searchParams.get('userId');
		}

		// If no clientId provided, this is likely an anonymous connection attempt
		if (!clientId) {
			return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
		}

		// If user is not authenticated, reject the request
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const apiKey = getEnv('ABLY_API_KEY');
		if (!apiKey) {
			console.debug('[Ably Auth] ABLY_API_KEY is not configured');
			return NextResponse.json({ error: 'Ably not configured' }, { status: 500 });
		}

		// Use the session user ID as the clientId if none provided,
		// or verify the requested clientId belongs to this user
		const requestedUserId = userId || clientId;
		const isOwnToken = requestedUserId === session.user.id || clientId === session.user.id;

		// Allow token generation if:
		// 1. The clientId/userId matches the session user
		// 2. The clientId starts with 'anonymous-' (for anonymous users who just registered)
		// 3. The clientId is the session user ID
		if (!isOwnToken && !clientId.startsWith('anonymous-')) {
			console.debug('[Ably Auth] Token request rejected:', {
				requestedUserId,
				sessionUserId: session.user.id,
				clientId,
			});
			return NextResponse.json(
				{ error: 'Forbidden: Can only request tokens for your own user' },
				{ status: 403 }
			);
		}

		const client = new Ably.Realtime({ key: apiKey });
		const tokenRequestData = await client.auth.createTokenRequest({
			clientId: session.user.id, // Always use session user ID for the token
			capability: {
				[`user:${session.user.id}:*`]: ['subscribe', 'publish'],
				'chat:*': ['subscribe', 'publish'],
				'presence:*': ['subscribe', 'publish'],
				'video-presence:*': ['subscribe', 'publish'],
				'global:announcements': ['subscribe'],
			},
			ttl: 3600000,
		});

		return NextResponse.json(tokenRequestData);
	} catch (error) {
		console.debug('[Ably Auth] Error creating token:', error);
		// Provide more detailed error message for debugging
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json(
			{ error: 'Failed to create token', details: errorMessage },
			{ status: 500 }
		);
	}
}
