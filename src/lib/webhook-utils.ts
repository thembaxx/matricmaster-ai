import crypto from 'node:crypto';

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
export function isValidWebhookUrl(urlString: string): { valid: boolean; error?: string } {
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
export function isValidSecret(secret: string): boolean {
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

// Get all webhook configurations (for admin)
export function getWebhookConfigs() {
	return Array.from(webhookConfigs.entries()).map(([id, config]) => ({
		id,
		url: config.url,
		events: config.events,
		isActive: config.isActive,
	}));
}

// Set webhook configuration
export function setWebhookConfig(
	webhookId: string,
	config: { url: string; events: string[]; secret: string; isActive: boolean }
) {
	webhookConfigs.set(webhookId, config);
}

// Delete webhook configuration
export function deleteWebhookConfig(webhookId: string) {
	webhookConfigs.delete(webhookId);
}

// Check if webhook exists
export function hasWebhookConfig(webhookId: string) {
	return webhookConfigs.has(webhookId);
}
