import { type NextRequest, NextResponse } from 'next/server';

import {
	deleteWebhookConfig,
	getWebhookConfigs,
	hasWebhookConfig,
	isValidSecret,
	isValidWebhookUrl,
	setWebhookConfig,
	type WebhookEvent,
} from '@/lib/webhook-utils';

// GET - List webhook configurations
export async function GET() {
	// In production, add admin authentication check
	// For now, return empty array to avoid exposing config
	const webhooks = getWebhookConfigs();

	// Don't expose sensitive config in production without auth
	if (process.env.NODE_ENV === 'production') {
		return NextResponse.json({ webhooks: [] });
	}

	return NextResponse.json({ webhooks });
}

// POST - Create or update webhook configuration
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { webhookId, url, events, secret } = body;

		if (!webhookId || !url || !events || !secret) {
			return NextResponse.json(
				{ error: 'Missing required fields: webhookId, url, events, secret' },
				{ status: 400 }
			);
		}

		// Validate URL with SSRF protection
		const urlValidation = isValidWebhookUrl(url);
		if (!urlValidation.valid) {
			return NextResponse.json({ error: urlValidation.error }, { status: 400 });
		}

		// Validate secret strength
		if (!isValidSecret(secret)) {
			return NextResponse.json(
				{ error: 'Secret must be at least 16 characters with letters and digits' },
				{ status: 400 }
			);
		}

		// Validate events
		const validEvents: WebhookEvent[] = [
			'user.registered',
			'user.login',
			'user.logout',
			'quiz.completed',
			'achievement.unlocked',
			'study_session.started',
			'study_session.completed',
			'subscription.created',
			'subscription.expired',
		];

		const invalidEvents = events.filter(
			(e: string) => !validEvents.includes(e as WebhookEvent) && e !== '*'
		);
		if (invalidEvents.length > 0) {
			return NextResponse.json(
				{ error: `Invalid events: ${invalidEvents.join(', ')}` },
				{ status: 400 }
			);
		}

		setWebhookConfig(webhookId, {
			url,
			events,
			secret,
			isActive: true,
		});

		return NextResponse.json({
			success: true,
			message: `Webhook '${webhookId}' created/updated`,
		});
	} catch (error) {
		console.error('Webhook configuration error:', error);
		return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
	}
}

// DELETE - Remove webhook configuration
export async function DELETE(request: NextRequest) {
	const webhookId = request.nextUrl.searchParams.get('webhookId');

	if (!webhookId) {
		return NextResponse.json({ error: 'webhookId is required' }, { status: 400 });
	}

	if (!hasWebhookConfig(webhookId)) {
		return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
	}

	deleteWebhookConfig(webhookId);

	return NextResponse.json({
		success: true,
		message: `Webhook '${webhookId}' deleted`,
	});
}
