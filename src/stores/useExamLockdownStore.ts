'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ExamLockdownState = 'idle' | 'ready' | 'active' | 'paused' | 'completed';

export interface ExamLockdownConfig {
	paperId: string;
	paperTitle: string;
	duration: number;
	subject: string;
	allowFlashcards: boolean;
	allowAIHelp: boolean;
	allowNotes: boolean;
}

interface ExamLockdownStore {
	state: ExamLockdownState;
	config: ExamLockdownConfig | null;
	timeRemaining: number;
	pausedAt: number | null;
	startTime: number | null;
	violations: number;
	maxViolations: number;
	enable: (config: ExamLockdownConfig) => void;
	disable: () => void;
	start: () => void;
	pause: () => void;
	resume: () => void;
	complete: () => void;
	addViolation: () => void;
	setTimeRemaining: (time: number) => void;
	canAccessFeature: (feature: 'flashcards' | 'ai' | 'notes' | 'search') => boolean;
}

export const useExamLockdownStore = create<ExamLockdownStore>()(
	persist(
		(set, get) => ({
			state: 'idle',
			config: null,
			timeRemaining: 0,
			pausedAt: null,
			startTime: null,
			violations: 0,
			maxViolations: 3,

			enable: (config) => {
				set({
					state: 'ready',
					config,
					timeRemaining: config.duration * 60,
					violations: 0,
				});
			},

			disable: () => {
				set({
					state: 'idle',
					config: null,
					timeRemaining: 0,
					pausedAt: null,
					startTime: null,
					violations: 0,
				});
			},

			start: () => {
				set({
					state: 'active',
					startTime: Date.now(),
				});
			},

			pause: () => {
				set({
					state: 'paused',
					pausedAt: Date.now(),
				});
			},

			resume: () => {
				set({
					state: 'active',
					pausedAt: null,
				});
			},

			complete: () => {
				set({ state: 'completed' });
			},

			addViolation: () => {
				const { violations, maxViolations, state } = get();
				const newViolations = violations + 1;
				set({ violations: newViolations });

				if (newViolations >= maxViolations && state === 'active') {
					set({ state: 'completed' });
				}
			},

			setTimeRemaining: (time) => {
				set({ timeRemaining: time });
			},

			canAccessFeature: (feature) => {
				const { config, state } = get();
				if (state !== 'active' || !config) return true;

				switch (feature) {
					case 'flashcards':
						return config.allowFlashcards;
					case 'ai':
						return config.allowAIHelp;
					case 'notes':
						return config.allowNotes;
					case 'search':
						return false;
					default:
						return false;
				}
			},
		}),
		{
			name: 'exam-lockdown-storage',
			partialize: (state) => ({
				state: state.state,
				config: state.config,
				violations: state.violations,
			}),
		}
	)
);
