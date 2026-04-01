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
				try {
					const [progress, xp, energy] = await Promise.all([
						fetch('/api/progress').then((r) => r.json()),
						fetch('/api/xp').then((r) => r.json()),
						fetch('/api/energy').then((r) => r.json()),
					]);
					set({
						weakTopics: progress?.weakTopics || [],
						xp: xp?.xp || 0,
						level: xp?.level || 1,
						achievements: xp?.achievements || [],
						energyLevel: energy?.level || 50,
						burnoutRisk: energy?.burnoutRisk || 'low',
					});
				} catch (e) {
					console.error('Failed to refresh learning state', e);
				}
			},
		}),
		{ name: 'lumni-learning-state' }
	)
);
