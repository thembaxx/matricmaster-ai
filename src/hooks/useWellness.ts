'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getWellnessStats, recordWellnessCheckIn } from '@/services/wellnessService';

const WELLNESS_THRESHOLDS = {
	STUDY_DURATION_MINUTES: 30,
	CONSECUTIVE_WRONG: 5,
	BURNOUT_MOOD_DECLINE: 2,
	BURNOUT_CHECK_IN_COUNT: 3,
	MAX_CHECK_INS_PER_SESSION: 2,
} as const;

export interface UseWellnessReturn {
	wellnessScore: number;
	totalCheckIns: number;
	averageMood: number;
	moodTrend: 'improving' | 'declining' | 'stable';
	burnoutRisk: boolean;
	recentMoods: number[];
	isLoading: boolean;
	recordCheckIn: (data: CheckInData) => Promise<void>;
}

export interface CheckInData {
	moodBefore: number;
	moodAfter?: number;
	sessionDuration: number;
	suggestions?: string;
}

export function useWellness(): UseWellnessReturn {
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery({
		queryKey: ['wellness-stats'],
		queryFn: async () => {
			try {
				return await getWellnessStats();
			} catch (error) {
				console.debug('Failed to fetch wellness stats, using defaults:', error);
				return {
					wellnessScore: 75,
					totalCheckIns: 0,
					averageMood: 3.5,
					moodTrend: 'stable' as const,
					burnoutRisk: false,
					lastCheckIn: null,
					recentMoods: [],
				};
			}
		},
		refetchInterval: 300000,
	});

	const recordMutation = useMutation({
		mutationFn: async (data: CheckInData) => {
			await recordWellnessCheckIn(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['wellness-stats'] });
			queryClient.invalidateQueries({ queryKey: ['wellness-check-ins-today'] });
		},
	});

	const recordCheckIn = useCallback(
		async (data: CheckInData) => {
			await recordMutation.mutateAsync(data);
		},
		[recordMutation]
	);

	return {
		wellnessScore: data?.wellnessScore ?? 75,
		totalCheckIns: data?.totalCheckIns ?? 0,
		averageMood: data?.averageMood ?? 3.5,
		moodTrend: data?.moodTrend ?? 'stable',
		burnoutRisk: data?.burnoutRisk ?? false,
		recentMoods: data?.recentMoods ?? [],
		isLoading,
		recordCheckIn,
	};
}

export function useWellnessScore(): number {
	const { data } = useQuery({
		queryKey: ['wellness-stats'],
		queryFn: async () => {
			try {
				return await getWellnessStats();
			} catch (error) {
				console.debug('Failed to fetch wellness score, using default:', error);
				return {
					wellnessScore: 75,
					totalCheckIns: 0,
					averageMood: 3.5,
					moodTrend: 'stable' as const,
					burnoutRisk: false,
					lastCheckIn: null,
					recentMoods: [],
				};
			}
		},
		refetchInterval: 300000,
	});

	return data?.wellnessScore ?? 75;
}

export interface ShouldShowCheckInReturn {
	shouldShow: boolean;
	reason: 'study_duration' | 'consecutive_wrong' | null;
	consecutiveWrong: number;
	studyDuration: number;
}

export function useShouldShowCheckIn(): ShouldShowCheckInReturn & {
	incrementWrong: () => void;
	resetWrong: () => void;
	startSession: () => void;
	dismissCheckIn: () => void;
} {
	const sessionStartRef = useRef<Date | null>(null);
	const [consecutiveWrong, setConsecutiveWrong] = useState(0);
	const [checkInsThisSession, setCheckInsThisSession] = useState(0);

	useEffect(() => {
		if (!sessionStartRef.current) {
			sessionStartRef.current = new Date();
		}
	}, []);

	const startSession = useCallback(() => {
		sessionStartRef.current = new Date();
		setConsecutiveWrong(0);
		setCheckInsThisSession(0);
	}, []);

	const incrementWrong = useCallback(() => {
		setConsecutiveWrong((prev) => prev + 1);
	}, []);

	const resetWrong = useCallback(() => {
		setConsecutiveWrong(0);
	}, []);

	const dismissCheckIn = useCallback(() => {
		setCheckInsThisSession((prev) => prev + 1);
	}, []);

	const studyDuration = sessionStartRef.current
		? Math.floor((Date.now() - sessionStartRef.current.getTime()) / 60000)
		: 0;

	const tooManyDismissals = checkInsThisSession >= WELLNESS_THRESHOLDS.MAX_CHECK_INS_PER_SESSION;

	let reason: 'study_duration' | 'consecutive_wrong' | null = null;
	let shouldShow = false;

	if (!tooManyDismissals) {
		if (studyDuration >= WELLNESS_THRESHOLDS.STUDY_DURATION_MINUTES) {
			reason = 'study_duration';
			shouldShow = true;
		} else if (consecutiveWrong >= WELLNESS_THRESHOLDS.CONSECUTIVE_WRONG) {
			reason = 'consecutive_wrong';
			shouldShow = true;
		}
	}

	return {
		shouldShow,
		reason,
		consecutiveWrong,
		studyDuration,
		incrementWrong,
		resetWrong,
		startSession,
		dismissCheckIn,
	};
}
