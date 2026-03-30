import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	useAchievements,
	useCreateComment,
	useLeaderboard,
	useNotifications,
	useUpdateNotification,
} from '@/hooks/use-gamification';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();

vi.mock('@/lib/api/client', () => ({
	apiClient: {
		get: (...args: unknown[]) => mockGet(...args),
		post: (...args: unknown[]) => mockPost(...args),
		put: (...args: unknown[]) => mockPut(...args),
	},
}));

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: 0,
			},
		},
	});

	return function Wrapper({ children }: { children: ReactNode }) {
		return React.createElement(QueryClientProvider, { client: queryClient }, children);
	};
};

describe('useAchievements', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should fetch achievements when userId is provided', async () => {
		const mockAchievements = [
			{
				id: '1',
				name: 'First Quiz',
				description: 'Complete your first quiz',
				icon: 'trophy',
				unlocked: true,
				unlockedAt: new Date('2024-01-01'),
				progress: 1,
				total: 1,
			},
			{
				id: '2',
				name: 'Streak Master',
				description: 'Study for 7 days in a row',
				icon: 'fire',
				unlocked: false,
			},
		];

		mockGet.mockResolvedValue(mockAchievements);

		const { result } = renderHook(() => useAchievements('user-123'), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data).toEqual(mockAchievements);
		expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.achievements);
	});

	it('should not fetch achievements when userId is not provided', () => {
		const { result } = renderHook(() => useAchievements(), {
			wrapper: createWrapper(),
		});

		expect(result.current.isFetching).toBe(false);
		expect(mockGet).not.toHaveBeenCalled();
	});

	it('should handle API errors gracefully', async () => {
		mockGet.mockRejectedValue(new Error('Failed to fetch'));

		const { result } = renderHook(() => useAchievements('user-123'), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isError).toBe(true));

		expect(result.current.error).toBeDefined();
	});
});

describe('useLeaderboard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should fetch leaderboard with default limit', async () => {
		const mockLeaderboard = [
			{
				id: '1',
				userId: 'user-1',
				userName: 'Alice',
				totalPoints: 1000,
				rank: 1,
			},
			{
				id: '2',
				userId: 'user-2',
				userName: 'Bob',
				totalPoints: 900,
				rank: 2,
			},
		];

		mockGet.mockResolvedValue(mockLeaderboard);

		const { result } = renderHook(() => useLeaderboard(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data).toEqual(mockLeaderboard);
		expect(mockGet).toHaveBeenCalledWith(`${API_ENDPOINTS.leaderboard}?limit=10`);
	});

	it('should fetch leaderboard with custom limit', async () => {
		const mockLeaderboard = [
			{
				id: '1',
				userId: 'user-1',
				userName: 'Alice',
				totalPoints: 1000,
				rank: 1,
			},
		];

		mockGet.mockResolvedValue(mockLeaderboard);

		const { result } = renderHook(() => useLeaderboard(5), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mockGet).toHaveBeenCalledWith(`${API_ENDPOINTS.leaderboard}?limit=5`);
	});

	it('should handle empty leaderboard', async () => {
		mockGet.mockResolvedValue([]);

		const { result } = renderHook(() => useLeaderboard(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data).toEqual([]);
	});
});

describe('useNotifications', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should fetch notifications when userId is provided', async () => {
		const mockNotifications = [
			{
				id: '1',
				userId: 'user-123',
				type: 'achievement' as const,
				title: 'Achievement Unlocked!',
				message: 'You completed your first quiz',
				read: false,
				createdAt: new Date('2024-01-01'),
			},
			{
				id: '2',
				userId: 'user-123',
				type: 'study_reminder' as const,
				title: 'Time to Study',
				message: 'Keep your streak going!',
				read: true,
				createdAt: new Date('2024-01-02'),
			},
		];

		mockGet.mockResolvedValue(mockNotifications);

		const { result } = renderHook(() => useNotifications('user-123'), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data).toEqual(mockNotifications);
		expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.notifications);
	});

	it('should not fetch notifications when userId is not provided', () => {
		const { result } = renderHook(() => useNotifications(), {
			wrapper: createWrapper(),
		});

		expect(result.current.isFetching).toBe(false);
		expect(mockGet).not.toHaveBeenCalled();
	});
});

describe('useUpdateNotification', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should update notification successfully', async () => {
		mockPut.mockResolvedValue({ success: true });

		const { result } = renderHook(() => useUpdateNotification(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({
				id: 'notification-1',
				data: { read: true },
			});
		});

		expect(mockPut).toHaveBeenCalledWith(`${API_ENDPOINTS.notifications}/notification-1`, {
			read: true,
		});
	});
});

describe('useCreateComment', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should create comment successfully', async () => {
		const mockCommentData = {
			content: 'Great explanation!',
			targetType: 'quiz' as const,
			targetId: 'quiz-123',
		};

		const mockResponse = {
			id: 'comment-1',
			...mockCommentData,
			createdAt: new Date(),
		};

		mockPost.mockResolvedValue(mockResponse);

		const { result } = renderHook(() => useCreateComment(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync(mockCommentData);
		});

		expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.comments, mockCommentData);
	});

	it('should handle comment creation for different target types', async () => {
		const testCases = [
			{ targetType: 'quiz' as const, targetId: 'quiz-1' },
			{ targetType: 'past_paper' as const, targetId: 'paper-1' },
			{ targetType: 'lesson' as const, targetId: 'lesson-1' },
		];

		mockPost.mockResolvedValue({ id: 'comment-1' });

		for (const testCase of testCases) {
			const { result } = renderHook(() => useCreateComment(), {
				wrapper: createWrapper(),
			});

			await act(async () => {
				await result.current.mutateAsync({
					content: 'Test comment',
					...testCase,
				});
			});

			expect(mockPost).toHaveBeenCalledWith(
				API_ENDPOINTS.comments,
				expect.objectContaining({
					targetType: testCase.targetType,
				})
			);
		}
	});

	it('should handle nested comments with parentId', async () => {
		const mockCommentData = {
			content: 'Reply to comment',
			targetType: 'quiz' as const,
			targetId: 'quiz-123',
			parentId: 'parent-comment-1',
		};

		mockPost.mockResolvedValue({ id: 'comment-2', ...mockCommentData });

		const { result } = renderHook(() => useCreateComment(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync(mockCommentData);
		});

		expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.comments, mockCommentData);
	});
});
