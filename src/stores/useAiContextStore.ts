import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AiContextType =
	| 'idle'
	| 'quiz'
	| 'pastPaper'
	| 'lesson'
	| 'flashcard'
	| 'snapAndSolve'
	| 'voiceTutor'
	| 'curriculumMap';

export type ActivityOutcome = 'failed' | 'passed' | 'viewed' | 'completed';

export interface AiContextMetadata {
	questionText?: string;
	extractedOcr?: string;
	solutionPreview?: string;
	subjectName?: string;
	topicName?: string;
	score?: number;
	totalQuestions?: number;
	correctAnswers?: number;
	extractedQuestions?: string[];
}

export interface Activity {
	id: string;
	type: AiContextType;
	subject?: string;
	topic?: string;
	questionId?: string;
	paperId?: string;
	lessonId?: string;
	outcome: ActivityOutcome;
	score?: number;
	description: string;
	timestamp: number;
}

export interface AiContext {
	type: AiContextType;
	subject?: string;
	topic?: string;
	paperId?: string;
	lessonId?: string;
	questionId?: string;
	relatedTopics?: string[];
	metadata?: AiContextMetadata;
	isProactive?: boolean;
	lastUpdated: number;
}

interface AiContextStore {
	context: AiContext;
	setContext: (context: Partial<AiContext>) => void;
	clearContext: () => void;
	pushToHistory: (context: AiContext) => void;
	history: AiContext[];
	activities: Activity[];
	addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
	getRecentStruggles: () => Activity[];
	getRecentActivities: (limit?: number) => Activity[];
	getWeakTopics: () => { topic: string; subject: string; failureRate: number }[];
}

const initialContext: AiContext = {
	type: 'idle',
	lastUpdated: Date.now(),
};

export const useAiContextStore = create<AiContextStore>()(
	persist(
		(set, get) => ({
			context: initialContext,
			history: [],
			activities: [],

			setContext: (newContext) => {
				set((state) => ({
					context: {
						...state.context,
						...newContext,
						lastUpdated: Date.now(),
					},
				}));
			},

			clearContext: () => {
				set({ context: initialContext });
			},

			pushToHistory: (context) => {
				set((state) => ({
					history: [context, ...state.history].slice(0, 10),
				}));
			},

			addActivity: (activity) => {
				const newActivity: Activity = {
					...activity,
					id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
					timestamp: Date.now(),
				};
				set((state) => ({
					activities: [newActivity, ...state.activities].slice(0, 5),
				}));
			},

			getRecentStruggles: () => {
				const { activities } = get();
				return activities.filter((a) => a.outcome === 'failed').slice(0, 3);
			},

			getRecentActivities: (limit = 5) => {
				const { activities } = get();
				return activities.slice(0, limit);
			},

			getWeakTopics: () => {
				const { activities } = get();
				const topicStats: Record<string, { failed: number; total: number }> = {};

				activities
					.filter((a) => a.topic && a.outcome !== 'viewed')
					.forEach((a) => {
						const key = `${a.subject}-${a.topic}`;
						if (!topicStats[key]) {
							topicStats[key] = { failed: 0, total: 0 };
						}
						topicStats[key].total++;
						if (a.outcome === 'failed') {
							topicStats[key].failed++;
						}
					});

				return Object.entries(topicStats)
					.map(([key, stats]) => {
						const [subject, topic] = key.split('-');
						return {
							topic,
							subject,
							failureRate: stats.total > 0 ? (stats.failed / stats.total) * 100 : 0,
						};
					})
					.filter((t) => t.failureRate > 0)
					.sort((a, b) => b.failureRate - a.failureRate);
			},
		}),
		{
			name: 'ai-context-storage',
		}
	)
);
