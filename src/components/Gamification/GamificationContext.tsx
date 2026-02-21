'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { toast } from 'sonner';
import { ACHIEVEMENTS, type AchievementDefinition } from '@/constants/achievements';
import { checkAndUnlockAchievements } from '@/lib/db/achievement-actions';
import { AchievementToast } from './AchievementToast';

export interface UnlockedAchievement {
	id: string;
	name: string;
	description: string;
	icon: string;
	points: number;
	unlockedAt: Date;
}

interface GamificationContextType {
	pendingAchievements: UnlockedAchievement[];
	isChecking: boolean;
	checkAchievements: () => Promise<UnlockedAchievement[]>;
	showAchievementToast: (achievement: UnlockedAchievement) => void;
	clearAchievement: (id: string) => void;
	clearAllAchievements: () => void;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

export function useGamification() {
	const context = useContext(GamificationContext);
	if (!context) {
		throw new Error('useGamification must be used within a GamificationProvider');
	}
	return context;
}

interface GamificationProviderProps {
	children: React.ReactNode;
}

export function GamificationProvider({ children }: GamificationProviderProps) {
	const [pendingAchievements, setPendingAchievements] = useState<UnlockedAchievement[]>([]);
	const [isChecking, setIsChecking] = useState(false);

	const showAchievementToast = useCallback((achievement: UnlockedAchievement) => {
		toast.custom(
			(t) => <AchievementToast achievement={achievement} onDismiss={() => toast.dismiss(t)} />,
			{
				duration: 6000,
				position: 'top-center',
				className: 'achievement-toast-container',
			}
		);
	}, []);

	const checkAchievements = useCallback(async (): Promise<UnlockedAchievement[]> => {
		setIsChecking(true);
		try {
			const result = await checkAndUnlockAchievements();

			const newlyUnlocked: UnlockedAchievement[] = result.unlocked.map((id) => {
				const def = ACHIEVEMENTS.find((a) => a.id === id);
				return {
					id,
					name: def?.name || 'Achievement Unlocked!',
					description: def?.description || '',
					icon: def?.icon || '🏆',
					points: def?.points || 0,
					unlockedAt: new Date(),
				};
			});

			if (newlyUnlocked.length > 0) {
				setPendingAchievements((prev) => [...prev, ...newlyUnlocked]);

				newlyUnlocked.forEach((achievement, index) => {
					setTimeout(() => {
						showAchievementToast(achievement);
					}, index * 500);
				});
			}

			return newlyUnlocked;
		} catch (error) {
			console.error('[Gamification] Error checking achievements:', error);
			return [];
		} finally {
			setIsChecking(false);
		}
	}, [showAchievementToast]);

	const clearAchievement = useCallback((id: string) => {
		setPendingAchievements((prev) => prev.filter((a) => a.id !== id));
	}, []);

	const clearAllAchievements = useCallback(() => {
		setPendingAchievements([]);
	}, []);

	return (
		<GamificationContext.Provider
			value={{
				pendingAchievements,
				isChecking,
				checkAchievements,
				showAchievementToast,
				clearAchievement,
				clearAllAchievements,
			}}
		>
			{children}
		</GamificationContext.Provider>
	);
}

export function getAchievementDefinition(id: string): AchievementDefinition | undefined {
	return ACHIEVEMENTS.find((a) => a.id === id);
}
