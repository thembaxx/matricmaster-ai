import { describe, expect, it } from 'vitest';
import {
	calculateMasteryLevel,
	calculateNextReview,
	DEFAULT_EASE_FACTOR,
	formatReviewInterval,
	getCardsDueByDate,
	getCardsDueForReview,
	getCardsDueToday,
	getReviewForecast,
	initializeCard,
	MIN_EASE_FACTOR,
	type SpacedRepetitionCard,
} from '@/lib/spaced-repetition';

describe('spaced-repetition', () => {
	describe('calculateNextReview', () => {
		it('should reset repetitions and interval for rating < 3', () => {
			const result = calculateNextReview(10, 5, 2.5, 1);
			expect(result.repetitions).toBe(0);
			expect(result.interval).toBe(1);
		});

		it('should set interval to 1 for first successful review', () => {
			const result = calculateNextReview(0, 0, 2.5, 3);
			expect(result.interval).toBe(1);
			expect(result.repetitions).toBe(1);
		});

		it('should set interval to 6 for second successful review', () => {
			const result = calculateNextReview(1, 1, 2.5, 4);
			expect(result.interval).toBe(6);
			expect(result.repetitions).toBe(2);
		});

		it('should multiply interval by ease factor for subsequent reviews', () => {
			const result = calculateNextReview(6, 2, 2.5, 4);
			expect(result.interval).toBe(15); // Math.round(6 * 2.5)
		});

		it('should not let ease factor go below minimum', () => {
			const result = calculateNextReview(10, 5, 1.3, 1);
			expect(result.easeFactor).toBeGreaterThanOrEqual(MIN_EASE_FACTOR);
		});

		it('should increase ease factor for good ratings', () => {
			const result = calculateNextReview(1, 1, 2.5, 5);
			expect(result.easeFactor).toBeGreaterThan(2.5);
		});

		it('should return correct next review date', () => {
			const now = new Date();
			const result = calculateNextReview(1, 1, 2.5, 3, now);
			const expectedDate = new Date(now);
			expectedDate.setDate(expectedDate.getDate() + 6);
			expect(result.nextReview.toDateString()).toBe(expectedDate.toDateString());
		});
	});

	describe('getCardsDueForReview', () => {
		it('should return only cards that are due', () => {
			const now = new Date();
			const past = new Date(now.getTime() - 1000 * 60 * 60 * 24); // 1 day ago
			const future = new Date(now.getTime() + 1000 * 60 * 60 * 24); // 1 day from now

			const cards: SpacedRepetitionCard[] = [
				{ id: '1', interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: past },
				{ id: '2', interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: future },
				{ id: '3', interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: now },
			];

			const dueCards = getCardsDueForReview(cards);
			expect(dueCards.length).toBe(2); // past and now
			expect(dueCards.map((c) => c.id)).toContain('1');
			expect(dueCards.map((c) => c.id)).toContain('3');
		});

		it('should sort cards by next review date', () => {
			const now = new Date();
			const yesterday = new Date(now.getTime() - 1000 * 60 * 60 * 24);
			const twoDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 48);

			const cards: SpacedRepetitionCard[] = [
				{ id: '1', interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: yesterday },
				{ id: '2', interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: twoDaysAgo },
			];

			const dueCards = getCardsDueForReview(cards);
			expect(dueCards[0].id).toBe('2'); // Most overdue first
		});
	});

	describe('getCardsDueToday', () => {
		it('should return cards due by end of today', () => {
			const now = new Date();
			const tomorrow = new Date(now.getTime() + 1000 * 60 * 60 * 25);

			const cards: SpacedRepetitionCard[] = [
				{ id: '1', interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: now },
				{ id: '2', interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: tomorrow },
			];

			const dueToday = getCardsDueToday(cards);
			expect(dueToday.length).toBe(1);
			expect(dueToday[0].id).toBe('1');
		});
	});

	describe('getCardsDueByDate', () => {
		it('should return cards due on specific date', () => {
			const today = new Date();
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);

			const cards: SpacedRepetitionCard[] = [
				{ id: '1', interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: today },
				{ id: '2', interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: tomorrow },
			];

			const dueToday = getCardsDueByDate(cards, today);
			expect(dueToday.length).toBe(1);
			expect(dueToday[0].id).toBe('1');
		});
	});

	describe('calculateMasteryLevel', () => {
		it('should return 0 for cards with no reviews', () => {
			expect(calculateMasteryLevel(0, 0, 0)).toBe(0);
		});

		it('should increase with more reviews (up to cap)', () => {
			const lowReviews = calculateMasteryLevel(3, 2, 4); // 66% accuracy
			const highReviews = calculateMasteryLevel(10, 10, 4); // 100% accuracy
			expect(highReviews).toBeGreaterThan(lowReviews);
		});

		it('should be higher for better ratings', () => {
			const lowRating = calculateMasteryLevel(10, 10, 3);
			const highRating = calculateMasteryLevel(10, 10, 5);
			expect(highRating).toBeGreaterThan(lowRating);
		});

		it('should cap at 100', () => {
			const result = calculateMasteryLevel(1000, 1000, 5);
			expect(result).toBeLessThanOrEqual(100);
		});
	});

	describe('getReviewForecast', () => {
		it('should return array of correct length', () => {
			const cards: SpacedRepetitionCard[] = [];
			const forecast = getReviewForecast(cards, 7);
			expect(forecast.length).toBe(7);
		});

		it('should count cards due on each day', () => {
			const now = new Date();
			const tomorrow = new Date(now);
			tomorrow.setDate(tomorrow.getDate() + 1);

			const cards: SpacedRepetitionCard[] = [
				{ id: '1', interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: now },
				{ id: '2', interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: now },
				{ id: '3', interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: tomorrow },
			];

			const forecast = getReviewForecast(cards, 7);
			expect(forecast[0]).toBe(2); // Today
			expect(forecast[1]).toBe(1); // Tomorrow
		});
	});

	describe('initializeCard', () => {
		it('should return card with default values', () => {
			const card = initializeCard();
			expect(card.interval).toBe(0);
			expect(card.repetitions).toBe(0);
			expect(card.easeFactor).toBe(DEFAULT_EASE_FACTOR);
			expect(card.nextReview).toBeInstanceOf(Date);
		});
	});

	describe('formatReviewInterval', () => {
		it('should format 0 days as Today', () => {
			expect(formatReviewInterval(0)).toBe('Today');
		});

		it('should format 1 day as Tomorrow', () => {
			expect(formatReviewInterval(1)).toBe('Tomorrow');
		});

		it('should format days less than 7', () => {
			expect(formatReviewInterval(3)).toBe('In 3 days');
		});

		it('should format weeks', () => {
			expect(formatReviewInterval(14)).toBe('In 2 weeks');
		});

		it('should format months', () => {
			expect(formatReviewInterval(60)).toBe('In 2 months');
		});

		it('should format years', () => {
			expect(formatReviewInterval(365)).toBe('In 1 year');
		});
	});
});
