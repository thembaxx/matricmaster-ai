import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GoalType = 'past_papers' | 'quizzes' | 'study_hours' | 'flashcards';

export interface FocusGoal {
	id: string;
	type: GoalType;
	target: number;
	progress: number;
	title: string;
	xpReward: number;
	createdAt: number;
	completedAt?: number;
	isCompleted: boolean;
}

interface FocusGoalStore {
	goals: FocusGoal[];
	addGoal: (goal: Omit<FocusGoal, 'id' | 'createdAt' | 'progress' | 'isCompleted'>) => void;
	removeGoal: (id: string) => void;
	updateProgress: (id: string, progress: number) => void;
	completeGoal: (id: string) => void;
	getActiveGoals: () => FocusGoal[];
	getCompletedGoals: () => FocusGoal[];
	claimReward: (id: string) => { xpReward: number } | null;
}

export const useFocusGoalStore = create<FocusGoalStore>()(
	persist(
		(set, get) => ({
			goals: [],

			addGoal: (goalData) => {
				const newGoal: FocusGoal = {
					...goalData,
					id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
					progress: 0,
					isCompleted: false,
					createdAt: Date.now(),
				};
				set((state) => ({
					goals: [...state.goals, newGoal],
				}));
			},

			removeGoal: (id) => {
				set((state) => ({
					goals: state.goals.filter((g) => g.id !== id),
				}));
			},

			updateProgress: (id, progress) => {
				set((state) => ({
					goals: state.goals.map((g) => {
						if (g.id === id && !g.isCompleted) {
							const isNowCompleted = progress >= g.target;
							return {
								...g,
								progress,
								isCompleted: isNowCompleted,
								completedAt: isNowCompleted ? Date.now() : undefined,
							};
						}
						return g;
					}),
				}));
			},

			completeGoal: (id) => {
				set((state) => ({
					goals: state.goals.map((g) => {
						if (g.id === id && !g.isCompleted) {
							return {
								...g,
								progress: g.target,
								isCompleted: true,
								completedAt: Date.now(),
							};
						}
						return g;
					}),
				}));
			},

			getActiveGoals: () => {
				return get().goals.filter((g) => !g.isCompleted);
			},

			getCompletedGoals: () => {
				return get().goals.filter((g) => g.isCompleted);
			},

			claimReward: (id) => {
				const goal = get().goals.find((g) => g.id === id);
				if (goal?.isCompleted && !goal.completedAt) {
					set((state) => ({
						goals: state.goals.map((g) => (g.id === id ? { ...g, completedAt: Date.now() } : g)),
					}));
					return { xpReward: goal.xpReward };
				}
				return null;
			},
		}),
		{
			name: 'lumni-focus-goals',
		}
	)
);
