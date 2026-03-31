import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/db/database-manager-v2', () => ({
	dbManagerV2: {
		getDb: vi.fn().mockResolvedValue({}),
		getSmartDb: vi.fn().mockResolvedValue({}),
		waitForConnection: vi.fn().mockResolvedValue(true),
		getActiveDatabase: vi.fn().mockReturnValue('postgres'),
		initialize: vi.fn().mockResolvedValue(undefined),
	},
}));

const mockGetAuth = vi.fn();
vi.mock('@/lib/auth', () => ({
	getAuth: () => mockGetAuth(),
}));

vi.mock('@/lib/db/schema', () => ({
	userProgress: {},
	userAchievements: {},
	quizResults: {},
	flashcardReviews: {},
	leaderboardEntries: {},
	studySessions: {},
	universityTargets: {},
	questionAttempts: {},
}));

vi.mock('@/lib/spaced-repetition', () => ({
	calculateNextReviewBoolean: vi.fn().mockReturnValue({ intervalDays: 1, easeFactor: 2.5 }),
}));

describe('gamification server actions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetAuth.mockResolvedValue({
			api: {
				getSession: vi.fn().mockResolvedValue({
					user: {
						id: 'user_123',
						email: 'test@example.com',
						name: 'Test User',
						role: 'user',
					},
				}),
			},
		});
	});

	describe('checkAndUnlockAchievements', () => {
		it('should return error when user not authenticated', async () => {
			mockGetAuth.mockResolvedValue({
				api: {
					getSession: vi.fn().mockResolvedValue(null),
				},
			});

			const { checkAndUnlockAchievements } = await import('@/actions/gamification');
			const result = await checkAndUnlockAchievements();
			expect(result.success).toBe(false);
		});
	});

	describe('updateStreak', () => {
		it('should return error when user not authenticated', async () => {
			mockGetAuth.mockResolvedValue({
				api: {
					getSession: vi.fn().mockResolvedValue(null),
				},
			});

			const { updateStreak } = await import('@/actions/gamification');
			const result = await updateStreak();
			expect(result.success).toBe(false);
		});
	});

	describe('claimLoginBonus', () => {
		it('should return error when user not authenticated', async () => {
			mockGetAuth.mockResolvedValue({
				api: {
					getSession: vi.fn().mockResolvedValue(null),
				},
			});

			const { claimLoginBonus } = await import('@/actions/gamification');
			const result = await claimLoginBonus();
			expect(result.success).toBe(false);
		});
	});

	describe('calculateLeaderboardPoints', () => {
		it('should return error when user not authenticated', async () => {
			mockGetAuth.mockResolvedValue({
				api: {
					getSession: vi.fn().mockResolvedValue(null),
				},
			});

			const { calculateLeaderboardPoints } = await import('@/actions/gamification');
			const result = await calculateLeaderboardPoints();
			expect(result.success).toBe(false);
		});
	});
});
