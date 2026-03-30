import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAchievements, useLeaderboard, useNotifications } from '@/hooks/use-gamification';

vi.mock('@/lib/api/client', () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
	},
}));

vi.mock('@/lib/api/endpoints', () => ({
	API_ENDPOINTS: {
		achievements: '/api/achievements',
		leaderboard: '/api/leaderboard',
		notifications: '/api/notifications',
		comments: '/api/comments',
	},
	QUERY_KEYS: {
		achievements: ['achievements'],
		leaderboard: ['leaderboard'],
		notifications: ['notifications'],
		comments: ['comments'],
	},
	MUTATION_KEYS: {
		updateNotification: ['updateNotification'],
		createComment: ['createComment'],
	},
}));

import { apiClient } from '@/lib/api/client';

const mockApiClient = vi.mocked(apiClient);

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
		progress: 3,
		total: 7,
	},
];

const mockLeaderboard = [
	{
		id: '1',
		userId: 'user1',
		userName: 'Alice',
		userImage: '/avatar1.png',
		totalPoints: 1500,
		rank: 1,
	},
	{
		id: '2',
		userId: 'user2',
		userName: 'Bob',
		totalPoints: 1200,
		rank: 2,
	},
];

const mockNotifications = [
	{
		id: '1',
		userId: 'user1',
		type: 'achievement' as const,
		title: 'Achievement Unlocked!',
		message: 'You earned First Quiz',
		read: false,
		createdAt: new Date('2024-01-01'),
	},
	{
		id: '2',
		userId: 'user1',
		type: 'study_reminder' as const,
		title: 'Time to study!',
		message: 'Your daily streak is at risk',
		read: true,
		createdAt: new Date('2024-01-02'),
	},
];

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

	return function Wrapper({ children }: { children: React.ReactNode }) {
		return React.createElement(QueryClientProvider, { client: queryClient, children });
	};
}

describe('useAchievements', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should fetch achievements when userId provided', async () => {
		mockApiClient.get.mockResolvedValue(mockAchievements);

		const { result } = renderHook(() => useAchievements('user1'), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(result.current.data).toEqual(mockAchievements);
	});

	it('should not fetch when userId is undefined', () => {
		const { result } = renderHook(() => useAchievements(), {
			wrapper: createWrapper(),
		});

		expect(result.current.isLoading).toBe(false);
		expect(mockApiClient.get).not.toHaveBeenCalled();
	});
});

describe('useLeaderboard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should fetch leaderboard with default limit', async () => {
		mockApiClient.get.mockResolvedValue(mockLeaderboard);

		const { result } = renderHook(() => useLeaderboard(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(result.current.data).toEqual(mockLeaderboard);
		expect(mockApiClient.get).toHaveBeenCalledWith('/api/leaderboard?limit=10');
	});

	it('should fetch leaderboard with custom limit', async () => {
		mockApiClient.get.mockResolvedValue(mockLeaderboard);

		const { result } = renderHook(() => useLeaderboard(5), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(mockApiClient.get).toHaveBeenCalledWith('/api/leaderboard?limit=5');
	});
});

describe('useNotifications', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should fetch notifications when userId provided', async () => {
		mockApiClient.get.mockResolvedValue(mockNotifications);

		const { result } = renderHook(() => useNotifications('user1'), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(result.current.data).toEqual(mockNotifications);
	});

	it('should not fetch when userId is undefined', () => {
		const { result } = renderHook(() => useNotifications(), {
			wrapper: createWrapper(),
		});

		expect(result.current.isLoading).toBe(false);
		expect(mockApiClient.get).not.toHaveBeenCalled();
	});
});
