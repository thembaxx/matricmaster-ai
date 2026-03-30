import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	type CheckInData,
	useShouldShowCheckIn,
	useWellness,
	useWellnessScore,
} from '@/hooks/useWellness';
import * as wellnessService from '@/services/wellnessService';

vi.mock('@/services/wellnessService', () => ({
	getWellnessStats: vi.fn(),
	recordWellnessCheckIn: vi.fn(),
}));

const WELLNESS_THRESHOLDS = {
	STUDY_DURATION_MINUTES: 30,
	CONSECUTIVE_WRONG: 5,
	BURNOUT_MOOD_DECLINE: 2,
	BURNOUT_CHECK_IN_COUNT: 3,
	MAX_CHECK_INS_PER_SESSION: 2,
} as const;

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

describe('useWellness', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('initialization with default values', () => {
		it('should return default values when query fails', async () => {
			vi.mocked(wellnessService.getWellnessStats).mockRejectedValue(new Error('Failed to fetch'));

			const { result } = renderHook(() => useWellness(), {
				wrapper: createWrapper(),
			});

			expect(result.current.wellnessScore).toBe(75);
			expect(result.current.totalCheckIns).toBe(0);
			expect(result.current.averageMood).toBe(3.5);
			expect(result.current.moodTrend).toBe('stable');
			expect(result.current.burnoutRisk).toBe(false);
			expect(result.current.recentMoods).toEqual([]);
		});

		it('should return data from API when query succeeds', async () => {
			const mockData = {
				wellnessScore: 85,
				totalCheckIns: 10,
				averageMood: 4.2,
				moodTrend: 'improving' as const,
				burnoutRisk: false,
				lastCheckIn: null,
				recentMoods: [4, 5, 4, 5, 4],
			};

			vi.mocked(wellnessService.getWellnessStats).mockResolvedValue(mockData);

			const { result } = renderHook(() => useWellness(), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isLoading).toBe(false));

			expect(result.current.wellnessScore).toBe(85);
			expect(result.current.totalCheckIns).toBe(10);
			expect(result.current.averageMood).toBe(4.2);
			expect(result.current.moodTrend).toBe('improving');
			expect(result.current.burnoutRisk).toBe(false);
			expect(result.current.recentMoods).toEqual([4, 5, 4, 5, 4]);
		});

		it('should show loading state initially', () => {
			vi.mocked(wellnessService.getWellnessStats).mockImplementation(() => new Promise(() => {}));

			const { result } = renderHook(() => useWellness(), {
				wrapper: createWrapper(),
			});

			expect(result.current.isLoading).toBe(true);
		});
	});

	describe('wellness score calculation', () => {
		it('should calculate high wellness score from positive moods', async () => {
			const mockData = {
				wellnessScore: 90,
				totalCheckIns: 5,
				averageMood: 4.5,
				moodTrend: 'improving' as const,
				burnoutRisk: false,
				lastCheckIn: null,
				recentMoods: [5, 4, 5, 4, 5],
			};

			vi.mocked(wellnessService.getWellnessStats).mockResolvedValue(mockData);

			const { result } = renderHook(() => useWellness(), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isLoading).toBe(false));

			expect(result.current.wellnessScore).toBeGreaterThanOrEqual(80);
		});

		it('should show burnout risk when mood declining', async () => {
			const mockData = {
				wellnessScore: 45,
				totalCheckIns: 5,
				averageMood: 2.5,
				moodTrend: 'declining' as const,
				burnoutRisk: true,
				lastCheckIn: null,
				recentMoods: [3, 2, 1, 2, 1],
			};

			vi.mocked(wellnessService.getWellnessStats).mockResolvedValue(mockData);

			const { result } = renderHook(() => useWellness(), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isLoading).toBe(false));

			expect(result.current.burnoutRisk).toBe(true);
			expect(result.current.moodTrend).toBe('declining');
		});
	});

	describe('recordCheckIn', () => {
		it('should call recordWellnessCheckIn when recordCheckIn is called', async () => {
			vi.mocked(wellnessService.getWellnessStats).mockResolvedValue({
				wellnessScore: 75,
				totalCheckIns: 0,
				averageMood: 3.5,
				moodTrend: 'stable' as const,
				burnoutRisk: false,
				lastCheckIn: null,
				recentMoods: [],
			});

			vi.mocked(wellnessService.recordWellnessCheckIn).mockResolvedValue(undefined);

			const { result } = renderHook(() => useWellness(), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isLoading).toBe(false));

			const checkInData: CheckInData = {
				moodBefore: 4,
				moodAfter: 5,
				sessionDuration: 30,
				suggestions: 'Take more breaks',
			};

			await act(async () => {
				await result.current.recordCheckIn(checkInData);
			});

			expect(wellnessService.recordWellnessCheckIn).toHaveBeenCalledWith(checkInData);
		});
	});
});

describe('useWellnessScore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return default wellness score when API fails', async () => {
		vi.mocked(wellnessService.getWellnessStats).mockRejectedValue(new Error('Failed'));

		const { result } = renderHook(() => useWellnessScore(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current).toBe(75));

		expect(result.current).toBe(75);
	});

	it('should return wellness score from API', async () => {
		vi.mocked(wellnessService.getWellnessStats).mockResolvedValue({
			wellnessScore: 82,
			totalCheckIns: 10,
			averageMood: 4.1,
			moodTrend: 'stable' as const,
			burnoutRisk: false,
			lastCheckIn: null,
			recentMoods: [4, 4, 5, 4, 4],
		});

		const { result } = renderHook(() => useWellnessScore(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current).toBe(82));

		expect(result.current).toBe(82);
	});
});

describe('useShouldShowCheckIn', () => {
	describe('consecutive wrong answers', () => {
		it('should show check-in after consecutive wrong threshold', () => {
			const { result } = renderHook(() => useShouldShowCheckIn());

			expect(result.current.shouldShow).toBe(false);

			act(() => {
				for (let i = 0; i < WELLNESS_THRESHOLDS.CONSECUTIVE_WRONG; i++) {
					result.current.incrementWrong();
				}
			});

			expect(result.current.consecutiveWrong).toBe(WELLNESS_THRESHOLDS.CONSECUTIVE_WRONG);
			expect(result.current.shouldShow).toBe(true);
			expect(result.current.reason).toBe('consecutive_wrong');
		});

		it('should not show check-in before consecutive wrong threshold', () => {
			const { result } = renderHook(() => useShouldShowCheckIn());

			act(() => {
				result.current.incrementWrong();
				result.current.incrementWrong();
				result.current.incrementWrong();
			});

			expect(result.current.consecutiveWrong).toBe(3);
			expect(result.current.shouldShow).toBe(false);
			expect(result.current.reason).toBe(null);
		});

		it('should reset consecutive wrong count', () => {
			const { result } = renderHook(() => useShouldShowCheckIn());

			act(() => {
				result.current.incrementWrong();
				result.current.incrementWrong();
			});

			expect(result.current.consecutiveWrong).toBe(2);

			act(() => {
				result.current.resetWrong();
			});

			expect(result.current.consecutiveWrong).toBe(0);
		});
	});

	describe('max check-ins per session', () => {
		it('should respect max check-ins per session limit', () => {
			const { result } = renderHook(() => useShouldShowCheckIn());

			act(() => {
				result.current.dismissCheckIn();
			});

			expect(result.current.shouldShow).toBe(false);

			act(() => {
				result.current.dismissCheckIn();
			});

			expect(result.current.shouldShow).toBe(false);
		});
	});

	describe('session management', () => {
		it('should start a new session and reset counters', () => {
			const { result } = renderHook(() => useShouldShowCheckIn());

			act(() => {
				result.current.incrementWrong();
				result.current.incrementWrong();
			});

			expect(result.current.consecutiveWrong).toBe(2);

			act(() => {
				result.current.startSession();
			});

			expect(result.current.consecutiveWrong).toBe(0);
		});

		it('should initialize with zero consecutive wrong', () => {
			const { result } = renderHook(() => useShouldShowCheckIn());

			expect(result.current.consecutiveWrong).toBe(0);
		});
	});

	describe('initial state', () => {
		it('should not show check-in on initial render', () => {
			const { result } = renderHook(() => useShouldShowCheckIn());

			expect(result.current.shouldShow).toBe(false);
			expect(result.current.reason).toBe(null);
		});

		it('should return all required functions', () => {
			const { result } = renderHook(() => useShouldShowCheckIn());

			expect(typeof result.current.incrementWrong).toBe('function');
			expect(typeof result.current.resetWrong).toBe('function');
			expect(typeof result.current.startSession).toBe('function');
			expect(typeof result.current.dismissCheckIn).toBe('function');
		});
	});
});

describe('WELLNESS_THRESHOLDS constants', () => {
	it('should have correct study duration threshold', () => {
		expect(WELLNESS_THRESHOLDS.STUDY_DURATION_MINUTES).toBe(30);
	});

	it('should have correct consecutive wrong threshold', () => {
		expect(WELLNESS_THRESHOLDS.CONSECUTIVE_WRONG).toBe(5);
	});

	it('should have correct burnout check-in count threshold', () => {
		expect(WELLNESS_THRESHOLDS.BURNOUT_CHECK_IN_COUNT).toBe(3);
	});

	it('should have correct max check-ins per session threshold', () => {
		expect(WELLNESS_THRESHOLDS.MAX_CHECK_INS_PER_SESSION).toBe(2);
	});
});
