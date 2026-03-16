'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_THEME, UNLOCKABLE_THEMES, type UnlockableTheme } from '@/constants/themes';

interface ThemeStore {
	activeTheme: UnlockableTheme;
	unlockedThemes: string[];
	applyTheme: (theme: UnlockableTheme) => void;
	unlockTheme: (themeId: string) => void;
	getThemeProgress: (stats: {
		streak: number;
		points: number;
		quizzes: number;
		achievements: number;
	}) => UnlockableTheme[];
}

export const useUnlockableThemes = create<ThemeStore>()(
	persist(
		(set, get) => ({
			activeTheme: DEFAULT_THEME,
			unlockedThemes: ['default'],

			applyTheme: (theme: UnlockableTheme) => {
				set({ activeTheme: theme });

				if (theme.cssVariables && Object.keys(theme.cssVariables).length > 0) {
					const root = document.documentElement;
					Object.entries(theme.cssVariables).forEach(([key, value]) => {
						root.style.setProperty(key, value);
					});
				}
			},

			unlockTheme: (themeId: string) => {
				const { unlockedThemes } = get();
				if (!unlockedThemes.includes(themeId)) {
					set({ unlockedThemes: [...unlockedThemes, themeId] });
				}
			},

			getThemeProgress: (stats: {
				streak: number;
				points: number;
				quizzes: number;
				achievements: number;
			}) => {
				return UNLOCKABLE_THEMES.map((theme) => {
					const { type, value } = theme.unlockRequirement;
					let current = 0;
					const required = value;

					switch (type) {
						case 'streak':
							current = stats.streak;
							break;
						case 'points':
							current = stats.points;
							break;
						case 'quizzes':
							current = stats.quizzes;
							break;
						case 'achievements':
							current = stats.achievements;
							break;
					}

					return {
						...theme,
						isUnlocked: current >= required,
						progress: Math.min((current / required) * 100, 100),
						current,
					};
				});
			},
		}),
		{
			name: 'matricmaster-themes',
		}
	)
);
