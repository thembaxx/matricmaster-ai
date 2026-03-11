/**
 * Analytics Event Tracking Engine
 */

type AnalyticsEvent = {
	// Engagement
	lesson_started: { subject: string; topic: string; duration?: number };
	lesson_completed: { subject: string; topic: string; score: number; time_spent: number };
	quiz_submitted: { quiz_id: string; score: number; time_taken: number };

	// Gamification
	xp_earned: { amount: number; source: string; total: number };
	badge_unlocked: { badge_id: string; badge_name: string };
	streak_updated: { current: number; longest: number };
	level_up: { new_level: number; xp_required: number };

	// Navigation
	page_viewed: { page: string; referrer?: string };
	button_clicked: { button_id: string; location: string };

	// Retention
	session_started: { time: string; device: string };
	session_ended: { duration: number; actions: number };
};

export function trackEvent<T extends keyof AnalyticsEvent>(
	eventName: T,
	properties: AnalyticsEvent[T]
) {
	if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
		console.log(`[Analytics] ${eventName}:`, properties);
	}

	// Integrate with Vercel Analytics or other providers here
	try {
		if (typeof window !== 'undefined' && (window as any).va) {
			(window as any).va('event', { name: eventName, data: properties });
		}
	} catch (error) {
		console.error('Failed to track event:', error);
	}
}

export const useAnalytics = () => {
	return {
		trackEvent,
	};
};
