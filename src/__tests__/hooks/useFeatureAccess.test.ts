import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/subscriptionManager', () => ({
	getFeatureAccess: vi.fn((tier: string, feature: string) => {
		const accessMap: Record<string, { canAccess: boolean; requiredTier: string }> = {
			'free-leaderboard': { canAccess: true, requiredTier: 'free' },
			'free-quizAccess': { canAccess: true, requiredTier: 'free' },
			'basic-flashcardGeneration': { canAccess: true, requiredTier: 'basic' },
			'premium-voiceTutor': { canAccess: true, requiredTier: 'premium' },
			'pro-aiTutorUnlimited': { canAccess: true, requiredTier: 'pro' },
			'premium-pastPapers': { canAccess: false, requiredTier: 'premium' },
		};
		return accessMap[`${tier}-${feature}`] || { canAccess: false, requiredTier: 'premium' };
	}),
	getUserSubscriptionTier: vi.fn((subscription: { planId?: string; status?: string } | null) => {
		if (!subscription || subscription.status === 'expired') return 'free';
		return subscription.planId as 'free' | 'basic' | 'premium' | 'pro';
	}),
	isInGracePeriod: vi.fn((expiry: Date | string) => {
		if (!expiry) return { inGracePeriod: false, daysRemaining: 0 };
		const expiryDate = new Date(expiry);
		const now = new Date();
		const diffDays = Math.ceil((now.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24));
		if (diffDays <= 0 || diffDays > 3) return { inGracePeriod: false, daysRemaining: 0 };
		return { inGracePeriod: true, daysRemaining: 3 - diffDays };
	}),
	FEATURE_TIERS: { free: 0, basic: 1, premium: 2, pro: 3 },
	GRACE_PERIOD_DAYS: 3,
}));

import { useCurrentTier, useFeatureAccess } from '@/hooks/useFeatureAccess';

const mockFetch = vi.fn();

describe('useFeatureAccess', () => {
	beforeEach(() => {
		mockFetch.mockReset();
		globalThis.fetch = mockFetch as unknown as typeof fetch;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('initialization', () => {
		it('should start with loading state', async () => {
			mockFetch.mockImplementation(() => new Promise(() => {}));

			const { result } = renderHook(() => useFeatureAccess('leaderboard'));

			expect(result.current.isLoading).toBe(true);
		});
	});

	describe('feature access for free tier', () => {
		it('should return correct access for free feature', async () => {
			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => ({ planId: 'free', status: 'active' }),
			});

			const { result } = renderHook(() => useFeatureAccess('leaderboard'));

			await waitFor(() => expect(result.current.isLoading).toBe(false));

			expect(result.current.canAccess).toBe(true);
			expect(result.current.userTier).toBe('free');
		});

		it('should deny access for premium feature on free tier', async () => {
			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => ({ planId: 'free', status: 'active' }),
			});

			const { result } = renderHook(() => useFeatureAccess('pastPapers'));

			await waitFor(() => expect(result.current.isLoading).toBe(false));

			expect(result.current.canAccess).toBe(false);
			expect(result.current.requiredTier).toBe('premium');
		});
	});

	describe('feature access for premium tier', () => {
		it('should grant access to premium features', async () => {
			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => ({ planId: 'premium', status: 'active' }),
			});

			const { result } = renderHook(() => useFeatureAccess('voiceTutor'));

			await waitFor(() => expect(result.current.isLoading).toBe(false));

			expect(result.current.canAccess).toBe(true);
			expect(result.current.userTier).toBe('premium');
		});
	});

	describe('grace period', () => {
		it('should grant access during grace period', async () => {
			const futureDate = new Date();
			futureDate.setDate(futureDate.getDate() + 2);

			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => ({
					planId: 'premium',
					status: 'expired',
					expiresAt: futureDate.toISOString(),
				}),
			});

			const { result } = renderHook(() => useFeatureAccess('voiceTutor'));

			await waitFor(() => expect(result.current.isLoading).toBe(false));

			expect(result.current.isGracePeriod).toBe(true);
			expect(result.current.graceDaysRemaining).not.toBeNull();
		});
	});

	describe('error handling', () => {
		it('should handle fetch failure gracefully', async () => {
			mockFetch.mockRejectedValue(new Error('Network error'));

			const { result } = renderHook(() => useFeatureAccess('leaderboard'));

			await waitFor(() => expect(result.current.isLoading).toBe(false));

			expect(result.current.error).toBe('Failed to fetch subscription status');
			expect(result.current.userTier).toBe('free');
		});

		it('should handle non-ok response', async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				status: 500,
			} as Response);

			const { result } = renderHook(() => useFeatureAccess('leaderboard'));

			await waitFor(() => expect(result.current.isLoading).toBe(false));

			expect(result.current.error).toBeNull();
			expect(result.current.userTier).toBe('free');
		});
	});
});

describe('useCurrentTier', () => {
	beforeEach(() => {
		mockFetch.mockReset();
		globalThis.fetch = mockFetch as unknown as typeof fetch;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should return current tier', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => ({ planId: 'premium', status: 'active' }),
		});

		const { result } = renderHook(() => useCurrentTier());

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.tier).toBe('premium');
	});

	it('should return expired state correctly', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => ({ planId: 'premium', status: 'expired' }),
		});

		const { result } = renderHook(() => useCurrentTier());

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.isExpired).toBe(true);
	});

	it('should return null expiresAt when not provided', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => ({ planId: 'free', status: 'active' }),
		});

		const { result } = renderHook(() => useCurrentTier());

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.expiresAt).toBeNull();
	});
});
