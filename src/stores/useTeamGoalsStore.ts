'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TeamGoal {
	id: string;
	name: string;
	description: string;
	targetXP: number;
	currentXP: number;
	startDate: string;
	endDate: string;
	memberIds: string[];
	rewards: { xp: number; badge?: string };
	isCompleted: boolean;
}

export interface TeamProgress {
	totalXP: number;
	rank: number;
	memberCount: number;
	weeklyXP: number;
	goalProgress: number;
}

interface TeamGoalsStore {
	teamGoals: TeamGoal[];
	currentTeam: TeamGoal | null;
	teamProgress: TeamProgress | null;
	isLoading: boolean;
	joinTeam: (goalId: string) => Promise<void>;
	leaveTeam: () => Promise<void>;
	fetchTeamGoals: () => Promise<void>;
	createTeamGoal: (
		goal: Omit<TeamGoal, 'id' | 'currentXP' | 'isCompleted' | 'memberIds'>
	) => Promise<string>;
	contributeXP: (xp: number, activity: string) => Promise<void>;
	claimReward: (
		goalId: string
	) => Promise<{ success: boolean; reward?: { xp: number; badge?: string } }>;
}

export const useTeamGoalsStore = create<TeamGoalsStore>()(
	persist(
		(set, get) => ({
			teamGoals: [],
			currentTeam: null,
			teamProgress: null,
			isLoading: false,

			fetchTeamGoals: async () => {
				set({ isLoading: true });
				try {
					const response = await fetch('/api/team-goals');
					const data = await response.json();
					set({
						teamGoals: data.goals || [],
						currentTeam: data.currentTeam || null,
						teamProgress: data.progress || null,
					});
				} catch (error) {
					console.debug('Failed to fetch team goals:', error);
				} finally {
					set({ isLoading: false });
				}
			},

			joinTeam: async (goalId) => {
				try {
					const response = await fetch('/api/team-goals/join', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ goalId }),
					});

					if (response.ok) {
						const data = await response.json();
						set({ currentTeam: data.goal });
					}
				} catch (error) {
					console.debug('Failed to join team:', error);
				}
			},

			leaveTeam: async () => {
				try {
					await fetch('/api/team-goals/leave', {
						method: 'POST',
					});
					set({ currentTeam: null });
				} catch (error) {
					console.debug('Failed to leave team:', error);
				}
			},

			createTeamGoal: async (goal) => {
				try {
					const response = await fetch('/api/team-goals', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(goal),
					});

					const data = await response.json();
					set((state) => ({
						teamGoals: [...state.teamGoals, data.goal],
					}));
					return data.goal.id;
				} catch (error) {
					console.debug('Failed to create team goal:', error);
					return '';
				}
			},

			contributeXP: async (xp, activity) => {
				const { currentTeam } = get();
				if (!currentTeam) return;

				try {
					const response = await fetch('/api/team-goals/contribute', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							goalId: currentTeam.id,
							xp,
							activity,
						}),
					});

					if (response.ok) {
						const data = await response.json();
						set((state) => ({
							currentTeam: state.currentTeam
								? {
										...state.currentTeam,
										currentXP: data.currentXP,
										isCompleted: data.isCompleted,
									}
								: null,
							teamProgress: data.progress || state.teamProgress,
						}));
					}
				} catch (error) {
					console.debug('Failed to contribute XP:', error);
				}
			},

			claimReward: async (goalId) => {
				try {
					const response = await fetch('/api/team-goals/reward', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ goalId }),
					});

					const data = await response.json();
					if (data.success) {
						set((state) => ({
							teamGoals: state.teamGoals.map((g) =>
								g.id === goalId ? { ...g, isCompleted: true } : g
							),
						}));
					}
					return data;
				} catch (error) {
					console.debug('Failed to claim reward:', error);
					return { success: false };
				}
			},
		}),
		{
			name: 'team-goals-storage',
			partialize: (state) => ({
				currentTeam: state.currentTeam,
			}),
		}
	)
);
