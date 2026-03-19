'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GlobalProgress, StudyStats, WeakTopic } from '@/services/progressService';

interface ProgressState {
	progress: GlobalProgress | null;
	weakTopics: WeakTopic[];
	studyStats: StudyStats | null;
	isLoading: boolean;
	error: string | null;
	lastFetched: number | null;

	fetchProgress: () => Promise<void>;
	fetchWeakTopics: (limit?: number) => Promise<void>;
	fetchStudyStats: () => Promise<void>;
	updateLocalProgress: (updates: Partial<GlobalProgress>) => void;
	clearProgress: () => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
}

const PROGRESS_CACHE_DURATION = 5 * 60 * 1000;

export const useProgressStore = create<ProgressState>()(
	persist(
		(set, get) => ({
			progress: null,
			weakTopics: [],
			studyStats: null,
			isLoading: false,
			error: null,
			lastFetched: null,

			fetchProgress: async () => {
				const { lastFetched, isLoading } = get();
				if (isLoading) return;

				const now = Date.now();
				if (lastFetched && now - lastFetched < PROGRESS_CACHE_DURATION) {
					return;
				}

				set({ isLoading: true, error: null });

				try {
					const response = await fetch('/api/progress');
					if (!response.ok) {
						throw new Error('Failed to fetch progress');
					}
					const data = await response.json();
					set({
						progress: data,
						lastFetched: now,
						isLoading: false,
					});
				} catch (error) {
					console.error('Error fetching progress:', error);
					set({
						error: error instanceof Error ? error.message : 'Failed to fetch progress',
						isLoading: false,
					});
				}
			},

			fetchWeakTopics: async (limit = 5) => {
				try {
					const response = await fetch(`/api/progress/weak-topics?limit=${limit}`);
					if (!response.ok) {
						throw new Error('Failed to fetch weak topics');
					}
					const data = await response.json();
					set({ weakTopics: data });
				} catch (error) {
					console.error('Error fetching weak topics:', error);
				}
			},

			fetchStudyStats: async () => {
				try {
					const response = await fetch('/api/progress/stats');
					if (!response.ok) {
						throw new Error('Failed to fetch study stats');
					}
					const data = await response.json();
					set({ studyStats: data });
				} catch (error) {
					console.error('Error fetching study stats:', error);
				}
			},

			updateLocalProgress: (updates: Partial<GlobalProgress>) => {
				const { progress } = get();
				if (progress) {
					set({
						progress: { ...progress, ...updates },
					});
				}
			},

			clearProgress: () => {
				set({
					progress: null,
					weakTopics: [],
					studyStats: null,
					lastFetched: null,
					error: null,
				});
			},

			setLoading: (loading: boolean) => {
				set({ isLoading: loading });
			},

			setError: (error: string | null) => {
				set({ error });
			},
		}),
		{
			name: 'progress-store',
			partialize: (state) => ({
				progress: state.progress,
				weakTopics: state.weakTopics,
				studyStats: state.studyStats,
				lastFetched: state.lastFetched,
			}),
		}
	)
);

export function useProgress() {
	const store = useProgressStore();
	return {
		progress: store.progress,
		weakTopics: store.weakTopics,
		studyStats: store.studyStats,
		isLoading: store.isLoading,
		error: store.error,
		fetchProgress: store.fetchProgress,
		fetchWeakTopics: store.fetchWeakTopics,
		fetchStudyStats: store.fetchStudyStats,
		updateLocalProgress: store.updateLocalProgress,
		clearProgress: store.clearProgress,
	};
}

export function useDashboardProgress() {
	const { progress, weakTopics, isLoading, fetchProgress } = useProgress();

	return {
		progress,
		flashcardsDue: progress?.flashcardsDue ?? 0,
		weakTopicsCount: progress?.weakTopicsCount ?? weakTopics.length,
		accuracy: progress?.accuracy ?? 0,
		streakDays: progress?.streakDays ?? 0,
		totalMarksEarned: progress?.totalMarksEarned ?? 0,
		totalQuestionsAttempted: progress?.totalQuestionsAttempted ?? 0,
		weeklyPoints: progress?.weeklyPoints ?? 0,
		monthlyRank: progress?.monthlyRank,
		subjectProgress: progress?.subjectProgress ?? [],
		isLoading,
		refetch: fetchProgress,
	};
}

export function useWeakTopics(limit = 5) {
	const { weakTopics, fetchWeakTopics, isLoading } = useProgress();

	return {
		weakTopics,
		weakTopicsCount: weakTopics.length,
		isLoading,
		refetch: () => fetchWeakTopics(limit),
	};
}

export function useStudyStats() {
	const { studyStats, fetchStudyStats, isLoading } = useProgress();

	return {
		stats: studyStats,
		isLoading,
		refetch: fetchStudyStats,
	};
}
