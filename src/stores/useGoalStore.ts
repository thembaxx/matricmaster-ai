import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UniversityGoal {
	universityName: string;
	faculty: string;
	currentAps: number;
	targetAps: number;
	setAt: number;
}

interface GoalStore {
	goal: UniversityGoal | null;
	setGoal: (goal: UniversityGoal) => void;
	updateCurrentAps: (aps: number) => void;
	clearGoal: () => void;
}

export const useGoalStore = create<GoalStore>()(
	persist(
		(set) => ({
			goal: null,

			setGoal: (goal) => {
				set({ goal });
			},

			updateCurrentAps: (aps) => {
				set((state) => ({
					goal: state.goal ? { ...state.goal, currentAps: aps } : null,
				}));
			},

			clearGoal: () => {
				set({ goal: null });
			},
		}),
		{
			name: 'university-goal-storage',
		}
	)
);
