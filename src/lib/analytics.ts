import { PostHog } from 'posthog-node';
import { getEnv } from './env';

let posthogClient: PostHog | null = null;

export function getPostHog(): PostHog | null {
	if (posthogClient) return posthogClient;

	const apiKey = getEnv('POSTHOG_API_KEY');
	const projectId = getEnv('POSTHOG_PROJECT_ID');

	if (!apiKey || !projectId) {
		console.warn('⚠️ PostHog not configured - analytics disabled');
		return null;
	}

	posthogClient = new PostHog(apiKey, {
		host: 'https://app.posthog.com',
	});

	return posthogClient;
}

export interface AnalyticsEvent {
	event: string;
	properties?: Record<string, unknown>;
	userId?: string;
	distinctId?: string;
}

export async function trackEvent(event: AnalyticsEvent): Promise<void> {
	const client = getPostHog();
	if (!client) return;

	try {
		await client.capture({
			distinctId: event.distinctId || event.userId || 'anonymous',
			event: event.event,
			properties: event.properties,
			sendFeatureFlags: true,
		});
	} catch (error) {
		console.error('❌ Failed to track event:', error);
	}
}

export async function identifyUser(
	userId: string,
	properties?: Record<string, unknown>
): Promise<void> {
	const client = getPostHog();
	if (!client) return;

	try {
		await client.identify({
			distinctId: userId,
			properties: properties,
		});
	} catch (error) {
		console.error('❌ Failed to identify user:', error);
	}
}

export async function flushAnalytics(): Promise<void> {
	const client = getPostHog();
	if (!client) return;

	try {
		await client.flush();
	} catch (error) {
		console.error('❌ Failed to flush analytics:', error);
	}
}

export const AnalyticsEvents = {
	USER_SIGNED_UP: 'user_signed_up',
	USER_LOGGED_IN: 'user_logged_in',
	PAST_PAPER_STARTED: 'past_paper_started',
	PAST_PAPER_COMPLETED: 'past_paper_completed',
	QUIZ_COMPLETED: 'quiz_completed',
	FLASHCARD_CREATED: 'flashcard_created',
	FLASHCARD_REVIEWED: 'flashcard_reviewed',
	STUDY_PLAN_CREATED: 'study_plan_created',
	SUBSCRIPTION_STARTED: 'subscription_started',
	SUBSCRIPTION_UPGRADED: 'subscription_upgraded',
	PAYMENT_COMPLETED: 'payment_completed',
	AI_TUTOR_USED: 'ai_tutor_used',
	FEATURE_USED: 'feature_used',
	ERROR_OCCURRED: 'error_occurred',
} as const;
