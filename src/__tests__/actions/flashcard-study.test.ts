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
	});

	describe('getFlashcardsDueForReview', () => {
		it('should return empty array when no decks exist', async () => {
			vi.mock('@/lib/db/database-manager-v2', () => ({
				dbManagerV2: {
					getDb: vi.fn().mockResolvedValue({
						query: {
							flashcardDecks: {
								findMany: vi.fn().mockResolvedValue([]),
							},
						},
					}),
					getSmartDb: vi.fn().mockResolvedValue({}),
					waitForConnection: vi.fn().mockResolvedValue(true),
					getActiveDatabase: vi.fn().mockReturnValue('postgres'),
					initialize: vi.fn().mockResolvedValue(undefined),
				},
			}));

			const { getFlashcardsDueForReview } = await import('@/actions/flashcard-study');
			const result = await getFlashcardsDueForReview(10);
			expect(result).toEqual([]);
		});

		it('should return error when user not authenticated', async () => {
			vi.mock('@/lib/auth', () => ({
				getAuth: vi.fn().mockResolvedValue({
					api: {
						getSession: vi.fn().mockResolvedValue(null),
					},
				}),
			}));

			const { getFlashcardsDueForReview } = await import('@/actions/flashcard-study');
			const result = await getFlashcardsDueForReview(10);
			expect(result).toEqual([]);
		});
	});

	describe('reviewFlashcard', () => {
		it('should return error when user not authenticated', async () => {
			vi.mock('@/lib/auth', () => ({
				getAuth: vi.fn().mockResolvedValue({
					api: {
						getSession: vi.fn().mockResolvedValue(null),
					},
				}),
			}));

			const { reviewFlashcard } = await import('@/actions/flashcard-study');
			const result = await reviewFlashcard('card_123', 4);
			expect(result.success).toBe(false);
		});
	});

	describe('createAdaptiveFlashcardDeck', () => {
		it('should return error when user not authenticated', async () => {
			vi.mock('@/lib/auth', () => ({
				getAuth: vi.fn().mockResolvedValue({
					api: {
						getSession: vi.fn().mockResolvedValue(null),
					},
				}),
			}));

			const { createAdaptiveFlashcardDeck } = await import('@/actions/flashcard-study');
			const result = await createAdaptiveFlashcardDeck();
			expect(result.success).toBe(false);
		});
	});
});
