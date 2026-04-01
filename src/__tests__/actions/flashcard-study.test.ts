import { beforeEach, describe, expect, it, vi } from 'vitest';

// Create mock functions that can be reused
const mockGetDb = vi.fn().mockResolvedValue({});
const mockGetSmartDb = vi.fn().mockResolvedValue({});
const mockWaitForConnection = vi.fn().mockResolvedValue(true);
const mockGetActiveDatabase = vi.fn().mockReturnValue('postgres');
const mockInitialize = vi.fn().mockResolvedValue(undefined);

const mockGetSession = vi.fn().mockResolvedValue({
	user: {
		id: 'user_123',
		email: 'test@example.com',
		name: 'Test User',
	},
});

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
			getSession: (...args: unknown[]) => mockGetSession(...args),
		},
	}),
}));

vi.mock('drizzle-orm', () => ({
	eq: vi.fn().mockReturnValue({}),
	and: vi.fn().mockReturnValue({}),
	or: vi.fn().mockReturnValue({}),
	desc: vi.fn().mockReturnValue({}),
	isNull: vi.fn().mockReturnValue({}),
	lte: vi.fn().mockReturnValue({}),
	relations: vi.fn().mockReturnValue({}),
	flashcards: {},
	flashcardDecks: {},
	flashcardReviews: {},
}));

describe('flashcard-study server actions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetDb.mockResolvedValue({});
		mockGetSmartDb.mockResolvedValue({});
		mockWaitForConnection.mockResolvedValue(true);
		mockGetActiveDatabase.mockReturnValue('postgres');
		mockInitialize.mockResolvedValue(undefined);
		mockGetSession.mockResolvedValue({
			user: {
				id: 'user_123',
				email: 'test@example.com',
				name: 'Test User',
			},
		});
	});

	describe('getFlashcardsDueForReview', () => {
		it('should return empty array when no decks exist', async () => {
			mockGetDb.mockResolvedValueOnce({
				select: vi.fn().mockReturnValue({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue([]),
					}),
				}),
			});

			const { getFlashcardsDueForReview } = await import('@/actions/flashcard-study');
			const result = await getFlashcardsDueForReview(10);
			expect(result).toEqual([]);
		});

		it('should return empty array when user not authenticated', async () => {
			mockGetSession.mockResolvedValueOnce(null);

			const { getFlashcardsDueForReview } = await import('@/actions/flashcard-study');
			const result = await getFlashcardsDueForReview(10);
			expect(result).toEqual([]);
		});
	});

	describe('reviewFlashcard', () => {
		it('should return error when user not authenticated', async () => {
			mockGetSession.mockResolvedValueOnce(null);

			const { reviewFlashcard } = await import('@/actions/flashcard-study');
			const result = await reviewFlashcard('card_123', 4);
			expect(result.success).toBe(false);
		});
	});

	describe('createAdaptiveFlashcardDeck', () => {
		it('should return error when user not authenticated', async () => {
			mockGetSession.mockResolvedValueOnce(null);

			const { createAdaptiveFlashcardDeck } = await import('@/actions/flashcard-study');
			const result = await createAdaptiveFlashcardDeck();
			expect(result.success).toBe(false);
		});
	});
});
