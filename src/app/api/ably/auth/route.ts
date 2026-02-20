import Ably from 'ably';
import { type NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';

export async function POST(request: NextRequest) {
	try {
		const apiKey = getEnv('ABLY_API_KEY');
		if (!apiKey) {
			return NextResponse.json({ error: 'Ably not configured' }, { status: 500 });
		}

		const body = await request.json();
		const { clientId, userId } = body;

		if (!clientId) {
			return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
		}

		const client = new Ably.Realtime({ key: apiKey });
		const tokenRequestData = await client.auth.createTokenRequest({
			clientId: clientId,
			capability: {
				[`user:${userId || clientId}:*`]: ['subscribe', 'publish'],
				'chat:*': ['subscribe', 'publish'],
				'presence:*': ['subscribe', 'publish'],
				'global:announcements': ['subscribe'],
			},
			ttl: 3600000,
		});

		return NextResponse.json(tokenRequestData);
	} catch (error) {
		console.error('[Ably Auth] Error creating token:', error);
		return NextResponse.json({ error: 'Failed to create token' }, { status: 500 });
	}
}
