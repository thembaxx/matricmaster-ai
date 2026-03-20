'use client';

import { toast } from 'sonner';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AchievementToast } from '@/components/Gamification/AchievementToast';
import { getAchievementById } from '@/constants/achievements';
import { checkAndUnlockAchievements } from '@/lib/db/achievement-actions';

export interface UnlockedAchievement {
	id: string;
	name: string;
	description: string;
	icon: string;
	points: number;
	unlockedAt: Date;
}

interface DailyChallengeState {
	id: string;
	title: string;
	type: string;
	target: number;
	current: number;
	xpReward: number;
	isCompleted: boolean;
	isClaimed: boolean;
}

interface TeamGoalState {
	id: string;
	title: string;
	target: number;
	current: number;
	xpReward: number;
	hasJoined: boolean;
	userContribution: number;
}

interface GamificationState {
	// Achievements
	pendingAchievements: UnlockedAchievement[];
	isChecking: boolean;
	checkAchievements: () => Promise<UnlockedAchievement[]>;
	showAchievementToast: (achievement: UnlockedAchievement) => void;
	clearAchievement: (id: string) => void;
	clearAllAchievements: () => void;

	// Daily Challenges
	dailyChallenges: DailyChallengeState[];
	dailyChallengesLoaded: boolean;
	setDailyChallenges: (challenges: DailyChallengeState[]) => void;

	// XP Tracking
	totalXp: number;
	currentLevel: number;
	levelTitle: string;
	setXpData: (xp: number, level: number, title: string) => void;

	// Team Goals
	teamGoals: TeamGoalState[];
	setTeamGoals: (goals: TeamGoalState[]) => void;

	// Streak Shields
	streakFreezes: number;
	setStreakFreezes: (count: number) => void;
}

export const useGamificationStore = create<GamificationState>()(
	persist(
		(set, get) => ({
			// Achievements
			pendingAchievements: [],
			isChecking: false,

			showAchievementToast: (achievement: UnlockedAchievement) => {
				toast.custom(
					(t) =>
						AchievementToast({
							achievement: achievement,
							onDismiss: () => toast.dismiss(t),
						}),
					{
						duration: 6000,
						position: 'top-center',
						className: 'achievement-toast-container',
					}
				);
			},

			checkAchievements: async (): Promise<UnlockedAchievement[]> => {
				set({ isChecking: true });
				try {
					const result = await checkAndUnlockAchievements();
					const unlocked: UnlockedAchievement[] = [];

					for (const achievementId of result.unlocked) {
						const definition = getAchievementById(achievementId);
						if (definition) {
							const achievement: UnlockedAchievement = {
								id: definition.id,
								name: definition.name,
								description: definition.description,
								icon: definition.icon,
								points: definition.points,
								unlockedAt: new Date(),
							};
							unlocked.push(achievement);
							get().showAchievementToast(achievement);
						}
					}

					set((state) => ({
						pendingAchievements: [...state.pendingAchievements, ...unlocked],
						isChecking: false,
					}));

					return unlocked;
				} catch (error) {
					console.debug('Failed to check achievements:', error);
					set({ isChecking: false });
					return [];
				}
			},

			clearAchievement: (id: string) => {
				set((state) => ({
					pendingAchievements: state.pendingAchievements.filter((a) => a.id !== id),
				}));
			},

			clearAllAchievements: () => {
				set({ pendingAchievements: [] });
			},

			// Daily Challenges
			dailyChallenges: [],
			dailyChallengesLoaded: false,
			setDailyChallenges: (challenges) => {
				set({ dailyChallenges: challenges, dailyChallengesLoaded: true });
			},

			// XP
			totalXp: 0,
			currentLevel: 1,
			levelTitle: 'Novice',
			setXpData: (xp, level, title) => {
				set({ totalXp: xp, currentLevel: level, levelTitle: title });
			},

			// Team Goals
			teamGoals: [],
			setTeamGoals: (goals) => {
				set({ teamGoals: goals });
			},

			// Streak Shields
			streakFreezes: 0,
			setStreakFreezes: (count) => {
				set({ streakFreezes: count });
			},
		}),
		{
			name: 'gamification-store',
			partialize: (state) => ({
				pendingAchievements: state.pendingAchievements,
				totalXp: state.totalXp,
				currentLevel: state.currentLevel,
				levelTitle: state.levelTitle,
			}),
		}
	)
);

export function useGamification() {
	const store = useGamificationStore();
	return {
		pendingAchievements: store.pendingAchievements,
		isChecking: store.isChecking,
		checkAchievements: store.checkAchievements,
		showAchievementToast: store.showAchievementToast,
		clearAchievement: store.clearAchievement,
		clearAllAchievements: store.clearAllAchievements,
		dailyChallenges: store.dailyChallenges,
		dailyChallengesLoaded: store.dailyChallengesLoaded,
		setDailyChallenges: store.setDailyChallenges,
		totalXp: store.totalXp,
		currentLevel: store.currentLevel,
		levelTitle: store.levelTitle,
		setXpData: store.setXpData,
		teamGoals: store.teamGoals,
		setTeamGoals: store.setTeamGoals,
		streakFreezes: store.streakFreezes,
		setStreakFreezes: store.setStreakFreezes,
	};
}
