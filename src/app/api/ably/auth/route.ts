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
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const apiKey = getEnv('ABLY_API_KEY');
		if (!apiKey) {
			console.error('[Ably Auth] ABLY_API_KEY is not configured');
			return NextResponse.json({ error: 'Ably not configured' }, { status: 500 });
		}

		const body = await request.json();
		const { clientId, userId } = body;

		if (!clientId) {
			return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
		}

		// Verify the authenticated user is requesting a token for themselves
		const requestedUserId = userId || clientId;
		if (requestedUserId !== session.user.id) {
			return NextResponse.json(
				{ error: 'Forbidden: Can only request tokens for your own user' },
				{ status: 403 }
			);
		}

		const client = new Ably.Realtime({ key: apiKey });
		const tokenRequestData = await client.auth.createTokenRequest({
			clientId: clientId,
			capability: {
				[`user:${session.user.id}:*`]: ['subscribe', 'publish'],
				'chat:*': ['subscribe', 'publish'],
				'presence:*': ['subscribe', 'publish'],
				'global:announcements': ['subscribe'],
			},
			ttl: 3600000,
		});

		return NextResponse.json(tokenRequestData);
	} catch (error) {
		console.error('[Ably Auth] Error creating token:', error);
		// Provide more detailed error message for debugging
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json(
			{ error: 'Failed to create token', details: errorMessage },
			{ status: 500 }
		);
	}
}
