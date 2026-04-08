import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Duel {
	id: string;
	opponentName: string;
	subject: string;
	playerScore: number;
	opponentScore: number;
	status: 'waiting' | 'active' | 'completed';
	startedAt: Date;
	questions: Array<{ id: string; question: string; correctAnswer: string; options: string[] }>;
}

interface DuelStore {
	activeDuel: Duel | null;
	duelHistory: Duel[];
	isSearching: boolean;
	startDuel: (subject: string) => Promise<void>;
	submitAnswer: (questionId: string, answer: string) => void;
	endDuel: () => void;
	getDuelHistory: () => Duel[];
}

const BOT_NAMES = ['Alex', 'Maya', 'Jordan', 'Sam', 'Taylor', 'Morgan'];

export const useDuelStore = create<DuelStore>()(
	persist(
		(set, get) => ({
			activeDuel: null,
			duelHistory: [],
			isSearching: false,

			startDuel: async (subject: string) => {
				set({ isSearching: true });

				// Simulate finding opponent
				setTimeout(() => {
					const duel: Duel = {
						id: Date.now().toString(),
						opponentName: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
						subject,
						playerScore: 0,
						opponentScore: 0,
						status: 'active',
						startedAt: new Date(),
						questions: [
							{
								id: '1',
								question: 'Sample question 1',
								correctAnswer: 'a',
								options: ['a', 'b', 'c', 'd'],
							},
							{
								id: '2',
								question: 'Sample question 2',
								correctAnswer: 'b',
								options: ['a', 'b', 'c', 'd'],
							},
							{
								id: '3',
								question: 'Sample question 3',
								correctAnswer: 'c',
								options: ['a', 'b', 'c', 'd'],
							},
						],
					};

					set({ activeDuel: duel, isSearching: false });
				}, 2000);
			},

			submitAnswer: (questionId: string, answer: string) => {
				const duel = get().activeDuel;
				if (!duel) return;

				const question = duel.questions.find((q) => q.id === questionId);
				const isCorrect = question?.correctAnswer === answer;

				set({
					activeDuel: {
						...duel,
						playerScore: duel.playerScore + (isCorrect ? 1 : 0),
					},
				});
			},

			endDuel: () => {
				const duel = get().activeDuel;
				if (duel) {
					set((state) => ({
						activeDuel: null,
						duelHistory: [...state.duelHistory, { ...duel, status: 'completed' }],
					}));
				}
			},

			getDuelHistory: () => get().duelHistory,
		}),
		{
			name: 'duel-store',
		}
	)
);
