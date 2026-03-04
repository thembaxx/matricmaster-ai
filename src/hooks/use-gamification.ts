import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS, MUTATION_KEYS, QUERY_KEYS } from '@/lib/api/endpoints';

export function useAchievements(userId?: string) {
	return useQuery({
		queryKey: QUERY_KEYS.achievements,
		queryFn: () => apiClient.get<Achievement[]>(API_ENDPOINTS.achievements),
		enabled: !!userId,
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useLeaderboard(limit?: number) {
	return useQuery({
		queryKey: [...QUERY_KEYS.leaderboard, limit],
		queryFn: () =>
			apiClient.get<LeaderboardEntry[]>(`${API_ENDPOINTS.leaderboard}?limit=${limit || 10}`),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
}

export function useNotifications(userId?: string) {
	return useQuery({
		queryKey: QUERY_KEYS.notifications,
		queryFn: () => apiClient.get<Notification[]>(API_ENDPOINTS.notifications),
		enabled: !!userId,
		staleTime: 1 * 60 * 1000, // 1 minute
		gcTime: 3 * 60 * 1000, // 3 minutes
	});
}

export function useUpdateNotification() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: MUTATION_KEYS.updateNotification,
		mutationFn: ({ id, data }: { id: string; data: Partial<Notification> }) =>
			apiClient.put(`${API_ENDPOINTS.notifications}/${id}`, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
		},
	});
}

export function useCreateComment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: MUTATION_KEYS.createComment,
		mutationFn: (data: CreateCommentData) => apiClient.post(API_ENDPOINTS.comments, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.comments });
		},
	});
}

// Type definitions
interface Achievement {
	id: string;
	name: string;
	description: string;
	icon: string;
	unlocked: boolean;
	unlockedAt?: Date;
	progress?: number;
	total?: number;
}

interface LeaderboardEntry {
	id: string;
	userId: string;
	userName: string;
	userImage?: string;
	totalPoints: number;
	rank: number;
}

interface Notification {
	id: string;
	userId: string;
	type: 'achievement' | 'friend_activity' | 'study_reminder' | 'system';
	title: string;
	message: string;
	read: boolean;
	createdAt: Date;
	relatedId?: string;
}

interface CreateCommentData {
	content: string;
	targetType: 'quiz' | 'past_paper' | 'lesson';
	targetId: string;
	parentId?: string;
}
