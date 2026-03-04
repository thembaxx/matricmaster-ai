import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS, MUTATION_KEYS, QUERY_KEYS } from '@/lib/api/endpoints';
import type { ProgressUpdateData, UserProgressSummary } from '@/lib/db/progress-actions';

export function useUserProgress(userId?: string) {
	return useQuery({
		queryKey: QUERY_KEYS.progress,
		queryFn: () => apiClient.get<UserProgressSummary>(API_ENDPOINTS.progress),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
}

export function useUserStreak(userId?: string) {
	return useQuery({
		queryKey: QUERY_KEYS.streak,
		queryFn: () =>
			apiClient.get<{ currentStreak: number; bestStreak: number; lastActivityDate: string | null }>(
				API_ENDPOINTS.streak
			),
		enabled: !!userId,
		staleTime: 10 * 60 * 1000, // 10 minutes
		gcTime: 15 * 60 * 1000, // 15 minutes
	});
}

export function useStudySessions(userId?: string) {
	return useQuery({
		queryKey: QUERY_KEYS.sessions,
		queryFn: () => apiClient.get<SessionData[]>(API_ENDPOINTS.sessions),
		enabled: !!userId,
		staleTime: 3 * 60 * 1000, // 3 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useRecordStudySession() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: MUTATION_KEYS.recordSession,
		mutationFn: (data: ProgressUpdateData) => apiClient.post(API_ENDPOINTS.sessions, data),
		onSuccess: () => {
			// Invalidate related queries to trigger refetch
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.progress });
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.streak });
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions });
		},
	});
}

export function useUpdateProgress() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: MUTATION_KEYS.updateProgress,
		mutationFn: (data: ProgressUpdateData) => apiClient.put(API_ENDPOINTS.userProgress, data),
		onSuccess: () => {
			// Invalidate progress-related queries
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.progress });
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.streak });
		},
	});
}

// Type for session data from API
interface SessionData {
	id: string;
	sessionType: string;
	subjectId: number | null;
	durationMinutes: number | null;
	questionsAttempted: number;
	correctAnswers: number;
	marksEarned: number;
	startedAt: Date;
	completedAt: Date | null;
}
