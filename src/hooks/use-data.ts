'use client';

import { useCallback, useEffect, useState } from 'react';
import { isUsingMockData } from '@/lib/api/data-source';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface UseDataResult<T> {
	data: T | null;
	state: LoadingState;
	error: string | null;
	refetch: () => void;
	isLoading: boolean;
	isError: boolean;
	isSuccess: boolean;
	isMock: boolean;
}

export function useData<T>(
	fetchFn: () => Promise<T>,
	deps: React.DependencyList = []
): UseDataResult<T> {
	const [data, setData] = useState<T | null>(null);
	const [state, setState] = useState<LoadingState>('idle');
	const [error, setError] = useState<string | null>(null);

	const execute = useCallback(async () => {
		setState('loading');
		setError(null);

		try {
			const result = await fetchFn();
			setData(result);
			setState('success');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
			setState('error');
		}
	}, [fetchFn]);

	useEffect(() => {
		execute();
	}, [execute, ...deps]);

	return {
		data,
		state,
		error,
		refetch: execute,
		isLoading: state === 'loading',
		isError: state === 'error',
		isSuccess: state === 'success',
		isMock: isUsingMockData(),
	};
}

export function useSubjects() {
	const { data: api } = require('@/lib/api/data-source');
	return useData(() => api.subjects.getAll(), []);
}

export function useQuestions(subjectId?: number) {
	const { data: api } = require('@/lib/api/data-source');
	return useData(
		() => (subjectId ? api.questions.getBySubject(subjectId) : api.questions.getAll()),
		[subjectId]
	);
}

export function useRandomQuestions(count = 10) {
	const { data: api } = require('@/lib/api/data-source');
	return useData(() => api.questions.getRandom(count), [count]);
}

export function useProgress(subjectId?: number) {
	const { data: api } = require('@/lib/api/data-source');
	return useData(
		() => (subjectId ? api.progress.getBySubject(subjectId) : api.progress.getByUser()),
		[subjectId]
	);
}

export function useAchievements() {
	const { data: api } = require('@/lib/api/data-source');
	return useData(() => api.achievements.getUserAchievements(), []);
}

export function useStudySessions(limit?: number) {
	const { data: api } = require('@/lib/api/data-source');
	return useData(() => api.studySessions.getRecent(limit || 10), [limit]);
}

export function useStudyPlans() {
	const { data: api } = require('@/lib/api/data-source');
	return useData(() => api.studyPlans.getAll(), []);
}

export function useFlashcardDecks() {
	const { data: api } = require('@/lib/api/data-source');
	return useData(() => api.flashcards.getDecks(), []);
}

export function useTopicMastery(subjectId?: number) {
	const { data: api } = require('@/lib/api/data-source');
	return useData(
		() => (subjectId ? api.topicMastery.getBySubject(subjectId) : api.topicMastery.getAll()),
		[subjectId]
	);
}

export function useLeaderboard() {
	const { data: api } = require('@/lib/api/data-source');
	return useData(() => api.leaderboard.getWeekly(), []);
}

export function useNotifications() {
	const { data: api } = require('@/lib/api/data-source');
	return useData(() => api.notifications.getAll(), []);
}

export function useCalendarEvents() {
	const { data: api } = require('@/lib/api/data-source');
	return useData(() => api.calendar.getEvents(), []);
}

export function usePastPapers(subject?: string) {
	const { data: api } = require('@/lib/api/data-source');
	return useData(
		() => (subject ? api.pastPapers.getBySubject(subject) : api.pastPapers.getAll()),
		[subject]
	);
}

export function useStudyBuddies() {
	const { data: api } = require('@/lib/api/data-source');
	return useData(() => api.studyBuddies.getProfiles(), []);
}

export function useSettings() {
	const { data: api } = require('@/lib/api/data-source');
	return useData(() => api.settings.get(), []);
}
