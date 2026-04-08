import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TopicDecayState {
	lastReviewDate: number;
	stability: number;
	masteryLevel: number;
}

interface KnowledgeDecayState {
	topics: Record<string, TopicDecayState>;
	markReviewed: (topic: string, score: number) => void;
	getDecayedTopics: () => DecayAlert[];
	getTopicRetention: (topic: string) => number;
}

export interface DecayAlert {
	topic: string;
	retention: number;
	daysSinceReview: number;
	stability: number;
	masteryLevel: number;
}

function calculateRetention(daysSinceReview: number, stability: number): number {
	return Math.exp(-daysSinceReview / stability);
}

export const useKnowledgeDecayStore = create<KnowledgeDecayState>()(
	persist(
		(set, get) => ({
			topics: {},

			markReviewed: (topic: string, score: number) => {
				set((state) => {
					const existing = state.topics[topic];
					const now = Date.now();
					const normalizedScore = Math.max(0, Math.min(1, score));

					let newStability = 10;
					if (existing) {
						const delta = normalizedScore >= 0.7 ? 2 : -3;
						newStability = Math.max(3, Math.min(60, existing.stability + delta));
					}

					const newMastery = existing
						? existing.masteryLevel * 0.6 + normalizedScore * 0.4
						: normalizedScore;

					return {
						topics: {
							...state.topics,
							[topic]: {
								lastReviewDate: now,
								stability: newStability,
								masteryLevel: Math.max(0, Math.min(1, newMastery)),
							},
						},
					};
				});
			},

			getDecayedTopics: () => {
				const { topics } = get();
				const now = Date.now();
				const msPerDay = 86400000;
				const alerts: DecayAlert[] = [];

				for (const [topic, data] of Object.entries(topics)) {
					const daysSinceReview = (now - data.lastReviewDate) / msPerDay;
					const retention = calculateRetention(daysSinceReview, data.stability);
					if (retention < 0.7) {
						alerts.push({
							topic,
							retention,
							daysSinceReview: Math.round(daysSinceReview),
							stability: data.stability,
							masteryLevel: data.masteryLevel,
						});
					}
				}

				return alerts.sort((a, b) => a.retention - b.retention);
			},

			getTopicRetention: (topic: string) => {
				const { topics } = get();
				const data = topics[topic];
				if (!data) return 1;
				const daysSinceReview = (Date.now() - data.lastReviewDate) / 86400000;
				return calculateRetention(daysSinceReview, data.stability);
			},
		}),
		{
			name: 'knowledge-decay-store',
		}
	)
);
