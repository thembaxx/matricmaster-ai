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

interface GamificationState {
	pendingAchievements: UnlockedAchievement[];
	isChecking: boolean;
	checkAchievements: () => Promise<UnlockedAchievement[]>;
	showAchievementToast: (achievement: UnlockedAchievement) => void;
	clearAchievement: (id: string) => void;
	clearAllAchievements: () => void;
}

export const useGamificationStore = create<GamificationState>()(
	persist(
		(set, get) => ({
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
					console.error('Failed to check achievements:', error);
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
		}),
		{
			name: 'gamification-store',
			partialize: (state) => ({
				pendingAchievements: state.pendingAchievements,
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
	};
}
