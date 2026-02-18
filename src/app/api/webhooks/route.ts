import { type NextRequest, NextResponse } from 'next/server';

// Webhook configuration storage (in production, store in database)
const webhookConfigs: Map<
	string,
	{ url: string; events: string[]; secret: string; isActive: boolean }
> = new Map();

// Event types for webhooks
export type WebhookEvent =
	| 'user.registered'
	| 'user.login'
	| 'user.logout'
	| 'quiz.completed'
	| 'achievement.unlocked'
	| 'study_session.started'
	| 'study_session.completed'
	| 'subscription.created'
	| 'subscription.expired';

interface WebhookPayload {
	event: WebhookEvent;
	timestamp: string;
	data: Record<string, unknown>;
}

// Send webhook to configured URL
async function sendWebhook(
	configUrl: string,
	payload: WebhookPayload,
	secret: string
): Promise<boolean> {
	try {
		const response = await fetch(configUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Webhook-Signature': require('node:crypto')
					.createHmac('sha256', secret)
					.update(JSON.stringify(payload))
					.digest('hex'),
				'X-Webhook-Event': payload.event,
			},
			body: JSON.stringify(payload),
		});

		return response.ok;
	} catch (error) {
		console.error('Webhook delivery failed:', error);
		return false;
	}
}

// Trigger webhook for an event
export async function triggerWebhook(
	event: WebhookEvent,
	data: Record<string, unknown>
): Promise<void> {
	const payload: WebhookPayload = {
		event,
		timestamp: new Date().toISOString(),
		data,
	};

	// Send to all active webhooks configured for this event
	for (const [id, config] of webhookConfigs.entries()) {
		if (!config.isActive) continue;
		if (!config.events.includes(event) && !config.events.includes('*')) continue;

		const success = await sendWebhook(config.url, payload, config.secret);
		if (!success) {
			console.error(`Webhook delivery failed for ${id}, event: ${event}`);
			// In production, implement retry logic here
		}
	}
}

// GET - List webhook configurations
export async function GET() {
	// In production, add admin authentication check
	const webhooks = Array.from(webhookConfigs.entries()).map(([id, config]) => ({
		id,
		url: config.url,
		events: config.events,
		isActive: config.isActive,
	}));

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

		// Validate URL
		try {
			new URL(url);
		} catch {
			return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
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

		webhookConfigs.set(webhookId, {
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

	if (!webhookConfigs.has(webhookId)) {
		return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
	}

	webhookConfigs.delete(webhookId);

	return NextResponse.json({
		success: true,
		message: `Webhook '${webhookId}' deleted`,
	});
}
