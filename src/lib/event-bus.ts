type AppEvent =
	| { type: 'QUIZ_COMPLETED'; payload: { quizId: string; subject: string; score: number; totalQuestions: number; weakAreas: string[] } }
	| { type: 'STUDY_PLAN_UPDATED'; payload: { planId: string; completedItems: number } }
	| { type: 'PROGRESS_MILESTONE'; payload: { subject: string; milestone: string } }
	| { type: 'XP_EARNED'; payload: { amount: number; source: string } }
	| { type: 'STREAK_UPDATED'; payload: { currentStreak: number } };

type Handler<T extends AppEvent['type']> = (
	payload: Extract<AppEvent, { type: T }>['payload']
) => void;

class EventBus {
	private handlers: Map<string, Set<Handler<any>>> = new Map();

	subscribe<T extends AppEvent['type']>(event: T, handler: Handler<T>): () => void {
		if (!this.handlers.has(event)) {
			this.handlers.set(event, new Set());
		}
		this.handlers.get(event)!.add(handler);

		return () => {
			const handlers = this.handlers.get(event);
			if (handlers) {
				handlers.delete(handler);
			}
		};
	}

	publish<T extends AppEvent['type']>(
		event: T,
		payload: Extract<AppEvent, { type: T }>['payload']
	): void {
		const handlers = this.handlers.get(event);
		if (handlers) {
			for (const handler of handlers) {
				try {
					handler(payload);
				} catch (error) {
					console.error(`Error in EventBus handler for ${event}:`, error);
				}
			}
		}
	}
}

export const eventBus = new EventBus();
