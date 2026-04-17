'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useDashboardProgress } from '@/stores/useProgressStore';

interface GrowthMapData {
	topics: {
		topic: string;
		mistakes: number;
		subject: string;
		confidence: number | null;
		trend: 'up' | 'down' | 'stable';
		struggleCount: number;
	}[];
	insights: string[];
}

interface ScheduleData {
	adjustments: {
		type: 'reschedule' | 'extra_practice' | 'reminder';
		originalEventId?: string;
		newDate?: string;
		topic?: string;
		subject?: string;
		reason: string;
	}[];
	rescheduledGoals: number;
	extraPracticeAdded: number;
	message: string;
}

export function useDashboardData() {
	const {
		progress,
		flashcardsDue: storeFlashcardsDue,
		weakTopicsCount: storeWeakTopicsCount,
		accuracy: storeAccuracy,
		streakDays: storeStreakDays,
		refetch,
	} = useDashboardProgress();

	const { data: growthMapData } = useQuery({
		queryKey: ['growth-map'],
		queryFn: async () => {
			const res = await fetch('/api/growth-map');
			if (!res.ok) throw new Error('Failed to load growth data');
			return res.json();
		},
		select: (data) => data as GrowthMapData,
	});

	const { data: scheduleData } = useQuery({
		queryKey: ['adaptive-schedule'],
		queryFn: async () => {
			const res = await fetch('/api/adaptive-schedule', { method: 'POST' });
			if (!res.ok) throw new Error('Failed to load schedule');
			return res.json();
		},
		select: (data: unknown) => data as ScheduleData | null,
	});

	const { data: flashcardsDueData } = useQuery({
		queryKey: ['flashcards-due'],
		queryFn: async () => {
			const res = await fetch('/api/flashcards/due');
			if (!res.ok) return 0;
			const data = await res.json();
			return Array.isArray(data) ? data.length : 0;
		},
		select: (data: unknown) => (typeof data === 'number' ? data : 0),
	});

	const weaknessData = useMemo(() => growthMapData?.topics ?? [], [growthMapData]);

	const growthInsights = useMemo(() => growthMapData?.insights ?? [], [growthMapData]);

	const scheduleChanges = useMemo(
		() =>
			scheduleData?.adjustments?.length
				? {
						adjustments: scheduleData.adjustments,
						rescheduledGoals: scheduleData.rescheduledGoals,
						extraPracticeAdded: scheduleData.extraPracticeAdded,
					}
				: null,
		[scheduleData]
	);

	const flashcardsDue = flashcardsDueData ?? storeFlashcardsDue;
	const weakTopicsCount = storeWeakTopicsCount;
	const recentAccuracy = storeAccuracy || 0;

	return {
		growthMapData,
		weaknessData,
		growthInsights,
		scheduleData,
		scheduleChanges,
		flashcardsDue,
		weakTopicsCount,
		recentAccuracy,
		progress,
		storeStreakDays,
		refetch,
	};
}

export default useDashboardData;
