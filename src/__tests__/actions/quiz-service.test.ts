import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock database manager v2
vi.mock('@/lib/db/database-manager-v2', () => ({
	dbManagerV2: {
		getDb: vi.fn().mockResolvedValue({}),
		getSmartDb: vi.fn().mockResolvedValue({}),
		waitForConnection: vi.fn().mockResolvedValue(true),
		getActiveDatabase: vi.fn().mockReturnValue('postgres'),
		initialize: vi.fn().mockResolvedValue(undefined),
	},
}));

vi.mock('@/lib/auth', () => ({
	getAuth: vi.fn().mockResolvedValue({
		api: {
			getSession: vi.fn().mockResolvedValue({
				user: {
					id: 'user_123',
					email: 'test@example.com',
					name: 'Test User',
				},
			}),
		},
	}),
}));

vi.mock('@/lib/db/auth-utils', () => ({
	ensureAuthenticated: vi.fn().mockResolvedValue({
		id: 'user_123',
		email: 'test@example.com',
		name: 'Test User',
	}),
}));

vi.mock('@/lib/db/schema', () => ({
	quizResults: {},
	questionAttempts: {},
}));

vi.mock('@/lib/spaced-repetition', () => ({
	calculateNextReviewBoolean: vi.fn().mockReturnValue({ intervalDays: 1, easeFactor: 2.5 }),
}));

describe('quiz-service server actions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('saveQuizResultWithSpacedRepetition', () => {
		it('should handle database unavailable error', async () => {
			vi.mock('@/lib/db/database-manager-v2', () => ({
				dbManagerV2: {
					getDb: vi.fn().mockRejectedValue(new Error('Database not available')),
					getSmartDb: vi.fn().mockRejectedValue(new Error('Database not available')),
					waitForConnection: vi.fn().mockResolvedValue(false),
					getActiveDatabase: vi.fn().mockReturnValue('none'),
					initialize: vi.fn().mockResolvedValue(undefined),
				},
			}));

			const { saveQuizResultWithSpacedRepetition } = await import('@/services/quizService');
			const result = await saveQuizResultWithSpacedRepetition(
				'quiz_123',
				1,
				'Mathematics',
				8,
				10,
				600,
				[]
			);
			expect(result.success).toBe(false);
			expect(result.error).toBe('Failed to save quiz result');
		});
	});

	describe('getQuizResultsHistory', () => {
		it('should return empty array on error', async () => {
			vi.mock('@/lib/db/database-manager-v2', () => ({
				dbManagerV2: {
					getDb: vi.fn().mockRejectedValue(new Error('Database error')),
					getSmartDb: vi.fn().mockRejectedValue(new Error('Database error')),
					waitForConnection: vi.fn().mockResolvedValue(false),
					getActiveDatabase: vi.fn().mockReturnValue('none'),
					initialize: vi.fn().mockResolvedValue(undefined),
				},
			}));

			const { getQuizResultsHistory } = await import('@/services/quizService');
			const result = await getQuizResultsHistory(10);
			expect(result).toEqual([]);
		});
	});

	describe('getWeakTopicsFromQuiz', () => {
		it('should return empty array on error', async () => {
			vi.mock('@/lib/db/database-manager-v2', () => ({
				dbManagerV2: {
					getDb: vi.fn().mockRejectedValue(new Error('Database error')),
					getSmartDb: vi.fn().mockRejectedValue(new Error('Database error')),
					waitForConnection: vi.fn().mockResolvedValue(false),
					getActiveDatabase: vi.fn().mockReturnValue('none'),
					initialize: vi.fn().mockResolvedValue(undefined),
				},
			}));

			const { getWeakTopicsFromQuiz } = await import('@/services/quizService');
			const result = await getWeakTopicsFromQuiz('quiz_123');
			expect(result).toEqual([]);
		});
	});
});
