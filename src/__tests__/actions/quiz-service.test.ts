import { beforeEach, describe, expect, it, vi } from 'vitest';

// Create mock functions that can be reused
const mockGetDb = vi.fn().mockResolvedValue({});
const mockGetSmartDb = vi.fn().mockResolvedValue({});
const mockWaitForConnection = vi.fn().mockResolvedValue(true);
const mockGetActiveDatabase = vi.fn().mockReturnValue('postgres');
const mockInitialize = vi.fn().mockResolvedValue(undefined);

// Mock database manager v2
vi.mock('@/lib/db/database-manager-v2', () => ({
	dbManagerV2: {
		getDb: (...args: unknown[]) => mockGetDb(...args),
		getSmartDb: (...args: unknown[]) => mockGetSmartDb(...args),
		waitForConnection: (...args: unknown[]) => mockWaitForConnection(...args),
		getActiveDatabase: (...args: unknown[]) => mockGetActiveDatabase(...args),
		initialize: (...args: unknown[]) => mockInitialize(...args),
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
		mockGetDb.mockResolvedValue({});
		mockGetSmartDb.mockResolvedValue({});
		mockWaitForConnection.mockResolvedValue(true);
		mockGetActiveDatabase.mockReturnValue('postgres');
		mockInitialize.mockResolvedValue(undefined);
	});

	describe('saveQuizResultWithSpacedRepetition', () => {
		it('should handle database unavailable error', async () => {
			mockGetDb.mockRejectedValueOnce(new Error('Database not available'));
			mockGetSmartDb.mockRejectedValueOnce(new Error('Database not available'));
			mockWaitForConnection.mockResolvedValueOnce(false);
			mockGetActiveDatabase.mockReturnValueOnce('none');

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
			mockGetDb.mockRejectedValueOnce(new Error('Database error'));
			mockGetSmartDb.mockRejectedValueOnce(new Error('Database error'));
			mockWaitForConnection.mockResolvedValueOnce(false);
			mockGetActiveDatabase.mockReturnValueOnce('none');

			const { getQuizResultsHistory } = await import('@/services/quizService');
			const result = await getQuizResultsHistory(10);
			expect(result).toEqual([]);
		});
	});

	describe('getWeakTopicsFromQuiz', () => {
		it('should return empty array on error', async () => {
			mockGetDb.mockRejectedValueOnce(new Error('Database error'));
			mockGetSmartDb.mockRejectedValueOnce(new Error('Database error'));
			mockWaitForConnection.mockResolvedValueOnce(false);
			mockGetActiveDatabase.mockReturnValueOnce('none');

			const { getWeakTopicsFromQuiz } = await import('@/services/quizService');
			const result = await getWeakTopicsFromQuiz('quiz_123');
			expect(result).toEqual([]);
		});
	});
});
