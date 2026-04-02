'use client';

import { toast } from 'sonner';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AchievementToast } from '@/components/Gamification/AchievementToast';
import { getAchievementById } from '@/content';
import { checkAndUnlockAchievements } from '@/lib/db/achievement-actions';
import { getUserXPAndLevel } from '@/services/xpSystem';

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
	syncWithServer: () => Promise<void>;

	// Team Goals
	teamGoals: TeamGoalState[];
	setTeamGoals: (goals: TeamGoalState[]) => void;

	// Streak Shields
	streakFreezes: number;
	setStreakFreezes: (count: number) => void;
}

function getMockInitialState() {
	const now = new Date();
	const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

	return {
		pendingAchievements: [
			{
				id: 'first-lesson',
				name: 'First Steps',
				description: 'Complete your first lesson',
				icon: '🎯',
				points: 50,
				unlockedAt: daysAgo(120),
			},
			{
				id: 'streak-3',
				name: 'On a Roll',
				description: 'Maintain a 3-day streak',
				icon: '🔥',
				points: 100,
				unlockedAt: daysAgo(115),
			},
			{
				id: 'five-lessons',
				name: 'Getting Started',
				description: 'Complete 5 lessons',
				icon: '📚',
				points: 150,
				unlockedAt: daysAgo(110),
			},
			{
				id: 'streak-7',
				name: 'Week Warrior',
				description: 'Maintain a 7-day streak',
				icon: '💪',
				points: 200,
				unlockedAt: daysAgo(100),
			},
			{
				id: 'ten-lessons',
				name: 'Dedicated Learner',
				description: 'Complete 10 lessons',
				icon: '🌟',
				points: 250,
				unlockedAt: daysAgo(90),
			},
			{
				id: 'perfect-quiz',
				name: 'Perfectionist',
				description: 'Score 100% on a quiz',
				icon: '💯',
				points: 150,
				unlockedAt: daysAgo(85),
			},
			{
				id: 'streak-14',
				name: 'Two Week Titan',
				description: 'Maintain a 14-day streak',
				icon: '🏆',
				points: 350,
				unlockedAt: daysAgo(75),
			},
			{
				id: 'twenty-five-lessons',
				name: 'Quarter Century',
				description: 'Complete 25 lessons',
				icon: '🎖️',
				points: 400,
				unlockedAt: daysAgo(60),
			},
			{
				id: 'streak-30',
				name: 'Monthly Master',
				icon: '👑',
				description: 'Maintain a 30-day streak',
				points: 500,
				unlockedAt: daysAgo(45),
			},
			{
				id: 'fifty-lessons',
				name: 'Half Century',
				description: 'Complete 50 lessons',
				icon: '🏅',
				points: 600,
				unlockedAt: daysAgo(30),
			},
			{
				id: 'subject-master',
				name: 'Subject Master',
				description: 'Complete all lessons in a subject',
				icon: '🎓',
				points: 750,
				unlockedAt: daysAgo(15),
			},
		] as UnlockedAchievement[],
		totalXp: 3725,
		currentLevel: 13,
		levelTitle: 'Scholar',
		dailyChallenges: [
			{
				id: 'daily-1',
				title: 'Complete 3 lessons today',
				type: 'lessons',
				target: 3,
				current: 3,
				xpReward: 75,
				isCompleted: true,
				isClaimed: true,
			},
			{
				id: 'daily-2',
				title: 'Score 80%+ on 2 quizzes',
				type: 'quiz',
				target: 2,
				current: 1,
				xpReward: 100,
				isCompleted: false,
				isClaimed: false,
			},
			{
				id: 'daily-3',
				title: 'Earn 200 XP',
				type: 'xp',
				target: 200,
				current: 145,
				xpReward: 50,
				isCompleted: false,
				isClaimed: false,
			},
		] as DailyChallengeState[],
		dailyChallengesLoaded: true,
		streakFreezes: 2,
		teamGoals: [],
	};
}

export const useGamificationStore = create<GamificationState>()(
	persist(
		(set, get) => {
			const mockState = getMockInitialState();
			return {
				pendingAchievements: mockState.pendingAchievements,
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

				dailyChallenges: mockState.dailyChallenges,
				dailyChallengesLoaded: mockState.dailyChallengesLoaded,
				setDailyChallenges: (challenges) => {
					set({ dailyChallenges: challenges, dailyChallengesLoaded: true });
				},

				totalXp: mockState.totalXp,
				currentLevel: mockState.currentLevel,
				levelTitle: mockState.levelTitle,
				setXpData: (xp, level, title) => {
					set({ totalXp: xp, currentLevel: level, levelTitle: title });
				},
				syncWithServer: async () => {
					try {
						const { totalXp, level } = await getUserXPAndLevel();
						set({
							totalXp,
							currentLevel: level.level,
							levelTitle: level.title,
						});
					} catch (error) {
						console.debug('Failed to sync gamification with server:', error);
					}
				},

				teamGoals: mockState.teamGoals,
				setTeamGoals: (goals) => {
					set({ teamGoals: goals });
				},

				streakFreezes: mockState.streakFreezes,
				setStreakFreezes: (count) => {
					set({ streakFreezes: count });
				},
			};
		},
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
