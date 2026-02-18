import crypto from 'crypto';
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

// SSRF protection: validate URL before making request
function isValidWebhookUrl(urlString: string): { valid: boolean; error?: string } {
	try {
		const url = new URL(urlString);

		// Only allow HTTP and HTTPS
		if (url.protocol !== 'http:' && url.protocol !== 'https:') {
			return { valid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
		}

		const hostname = url.hostname.toLowerCase();

		// Block localhost variants
		const localhostPatterns = ['localhost', '127.0.0.1', '::1', '0.0.0.0', '::'];
		if (localhostPatterns.includes(hostname)) {
			return { valid: false, error: 'Localhost addresses are not allowed' };
		}

		// Block private IP ranges (RFC 1918)
		const privateRanges = [
			/^10\./,
			/^172\.(1[6-9]|2\d|3[01])\./,
			/^192\.168\./,
			/^127\./,
			/^169\.254\./, // Link-local
		];
		if (privateRanges.some((pattern) => pattern.test(hostname))) {
			return { valid: false, error: 'Private IP addresses are not allowed' };
		}

		// Block cloud metadata endpoints
		if (hostname === '169.254.169.254') {
			return { valid: false, error: 'Cloud metadata endpoints are not allowed' };
		}

		return { valid: true };
	} catch {
		return { valid: false, error: 'Invalid URL format' };
	}
}

// Validate webhook secret strength
function isValidSecret(secret: string): boolean {
	// Require minimum length
	if (secret.length < 16) return false;
	// Check for complexity (letters and digits)
	const hasLetter = /[a-zA-Z]/.test(secret);
	const hasDigit = /\d/.test(secret);
	return hasLetter && hasDigit;
}

// Send webhook to configured URL with timeout
async function sendWebhook(
	configUrl: string,
	payload: WebhookPayload,
	secret: string,
	timeoutMs = 5000
): Promise<boolean> {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

		const response = await fetch(configUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Webhook-Signature': crypto
					.createHmac('sha256', secret)
					.update(JSON.stringify(payload))
					.digest('hex'),
				'X-Webhook-Event': payload.event,
			},
			body: JSON.stringify(payload),
			signal: controller.signal,
		});

		clearTimeout(timeoutId);
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
	// For now, return empty array to avoid exposing config
	const webhooks = Array.from(webhookConfigs.entries()).map(([id, config]) => ({
		id,
		url: config.url,
		events: config.events,
		isActive: config.isActive,
	}));

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
