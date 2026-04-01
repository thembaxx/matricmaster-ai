'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LearningState {
	weakTopics: Array<{ topic: string; subject: string; confidence: number }>;
	setWeakTopics: (topics: Array<{ topic: string; subject: string; confidence: number }>) => void;

	xp: number;
	level: number;
	achievements: string[];
	setGamification: (xp: number, level: number, achievements: string[]) => void;

	energyLevel: number;
	burnoutRisk: 'low' | 'medium' | 'high';
	setWellness: (energy: number, burnoutRisk: 'low' | 'medium' | 'high') => void;

	currentStudyBlocks: Array<{ subject: string; topic: string; time: string }>;
	setStudyBlocks: (blocks: Array<{ subject: string; topic: string; time: string }>) => void;

	refreshFromServer: () => Promise<void>;
}

export const useLearningStateStore = create<LearningState>()(
	persist(
		(set) => ({
			weakTopics: [],
			setWeakTopics: (topics) => set({ weakTopics: topics }),
			xp: 0,
			level: 1,
			achievements: [],
			setGamification: (xp, level, achievements) => set({ xp, level, achievements }),
			energyLevel: 50,
			burnoutRisk: 'low',
			setWellness: (energy, burnoutRisk) => set({ energyLevel: energy, burnoutRisk }),
			currentStudyBlocks: [],
			setStudyBlocks: (blocks) => set({ currentStudyBlocks: blocks }),
			refreshFromServer: async () => {
				const [progressRes, xpRes, energyRes] = await Promise.allSettled([
					fetch('/api/progress'),
					fetch('/api/xp'),
					fetch('/api/energy'),
				]);

				const getData = <T>(res: PromiseSettledResult<Response>, fallback: T): T => {
					if (res.status === 'fulfilled' && res.value.ok) {
						return res.value.json().catch(() => fallback) as T;
					}
					return fallback;
				};

				const progress = getData(progressRes, { weakTopics: [] });
				const xpData = getData(xpRes, { xp: 0, level: 1, achievements: [] });
				const energyData = getData(energyRes, { level: 50, burnoutRisk: 'low' as const });

				set({
					weakTopics: progress.weakTopics || [],
					xp: xpData.xp || 0,
					level: xpData.level || 1,
					achievements: xpData.achievements || [],
					energyLevel: energyData.level || 50,
					burnoutRisk: energyData.burnoutRisk || 'low',
				});
			},
		}),
		{ name: 'lumni-learning-state' }
	)
);
