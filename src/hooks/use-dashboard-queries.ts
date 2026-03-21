'use client';

import { useQuery } from '@tanstack/react-query';

interface GrowthMapTopic {
	topic: string;
	mistakes: number;
	subject: string;
	confidence: number | null;
	trend: 'up' | 'down' | 'stable';
	struggleCount: number;
}

interface GrowthMapData {
	topics: GrowthMapTopic[];
	insights: string[];
}

interface ScheduleAdjustment {
	type: 'reschedule' | 'extra_practice' | 'reminder';
	originalEventId?: string;
	newDate?: string;
	topic?: string;
	subject?: string;
	reason: string;
}

interface ScheduleData {
	adjustments: ScheduleAdjustment[];
	rescheduledGoals: number;
	extraPracticeAdded: number;
	message: string;
}

export interface UseDashboardQueriesResult {
	growthMapData: GrowthMapData | undefined;
	scheduleData: ScheduleData | null;
	flashcardsDue: number;
	isLoadingGrowthMap: boolean;
	isLoadingSchedule: boolean;
	isLoadingFlashcards: boolean;
}

export function useDashboardQueries() {
	const { data: growthMapData, isLoading: isLoadingGrowthMap } = useQuery({
		queryKey: ['growth-map'],
		queryFn: async () => {
			const res = await fetch('/api/growth-map');
			return res.json();
		},
		select: (data) => (data ?? {}) as GrowthMapData,
	});

	const { data: scheduleData, isLoading: isLoadingSchedule } = useQuery({
		queryKey: ['adaptive-schedule'],
		queryFn: async () => {
			const res = await fetch('/api/adaptive-schedule', { method: 'POST' });
			return res.json();
		},
		select: (data) => (data?.adjustments?.length > 0 ? (data as ScheduleData) : null),
	});

	const { data: flashcardsDueData, isLoading: isLoadingFlashcards } = useQuery({
		queryKey: ['flashcards-due'],
		queryFn: async () => {
			const res = await fetch('/api/flashcards/due');
			if (!res.ok) return [];
			return res.json();
		},
		select: (data) => (Array.isArray(data) ? data.length : 0),
	});

	const flashcardsDue = flashcardsDueData ?? 0;

	return {
		growthMapData,
		scheduleData,
		flashcardsDue,
		isLoadingGrowthMap,
		isLoadingSchedule,
		isLoadingFlashcards,
	};
}
