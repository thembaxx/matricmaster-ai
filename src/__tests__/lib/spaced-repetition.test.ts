import { describe, expect, it } from 'vitest';
import {
	calculateMasteryLevel,
	calculateNextReview,
	calculateNextReviewBoolean,
	getCardsDueByDate,
	getCardsDueForReview,
	getCardsDueToday,
	getReviewForecast,
	initializeCard,
	type SpacedRepetitionCard,
} from '@/lib/spaced-repetition';

describe('spaced-repetition SM-2 Algorithm', () => {
	describe('calculateNextReview', () => {
		it('should reset repetitions on rating below 3', () => {
			const result = calculateNextReview(10, 3, 2.5, 2);
			expect(result.repetitions).toBe(0);
			expect(result.interval).toBe(1);
		});

		it('should set interval to 1 for first correct repetition', () => {
			const result = calculateNextReview(0, 0, 2.5, 3);
			expect(result.interval).toBe(1);
			expect(result.repetitions).toBe(1);
		});

		it('should set interval to 6 for second correct repetition', () => {
			const result = calculateNextReview(1, 1, 2.5, 3);
			expect(result.interval).toBe(6);
			expect(result.repetitions).toBe(2);
		});

		it('should multiply interval by ease factor for subsequent repetitions', () => {
			const result = calculateNextReview(6, 2, 2.5, 4);
			expect(result.interval).toBe(15);
			expect(result.repetitions).toBe(3);
		});

		it('should decrease ease factor for low ratings', () => {
			const result = calculateNextReview(5, 2, 2.5, 2);
			expect(result.easeFactor).toBeLessThan(2.5);
		});

		it('should increase ease factor for high ratings', () => {
			const result = calculateNextReview(5, 2, 2.5, 5);
			expect(result.easeFactor).toBeGreaterThan(2.5);
		});

		it('should not let ease factor go below minimum', () => {
			const result = calculateNextReview(5, 2, 1.5, 1);
			expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
		});

		it('should calculate correct next review date', () => {
			const lastReview = new Date('2024-01-01');
			const result = calculateNextReview(0, 0, 2.5, 3, lastReview);
			expect(result.nextReview.getDate()).toBe(2);
		});
	});

	describe('calculateNextReviewBoolean', () => {
		it('should return intervalDays 1 for incorrect answer', () => {
			const result = calculateNextReviewBoolean(false, 10, 2.5, 3);
			expect(result.intervalDays).toBe(1);
			expect(result.easeFactor).toBeLessThan(2.5);
		});

		it('should increase intervalDays for correct answer', () => {
			const result = calculateNextReviewBoolean(true, 5, 2.5, 3);
			expect(result.intervalDays).toBeGreaterThan(5);
		});

		it('should apply bonus for 5+ consecutive correct', () => {
			const result = calculateNextReviewBoolean(true, 10, 2.5, 5);
			expect(result.intervalDays).toBeGreaterThan(10);
		});

		it('should cap intervalDays at 90 days for 10+ consecutive correct', () => {
			const result = calculateNextReviewBoolean(true, 60, 2.5, 10);
			expect(result.intervalDays).toBeLessThanOrEqual(90);
		});
	});

	describe('getCardsDueForReview', () => {
		it('should return cards with nextReview in the past', () => {
			const cards: SpacedRepetitionCard[] = [
				{
					id: '1',
					interval: 1,
					repetitions: 1,
					easeFactor: 2.5,
					nextReview: new Date('2020-01-01'),
				},
				{
					id: '2',
					interval: 1,
					repetitions: 1,
					easeFactor: 2.5,
					nextReview: new Date('2099-01-01'),
				},
			];
			const due = getCardsDueForReview(cards);
			expect(due.length).toBe(1);
			expect(due[0].id).toBe('1');
		});

		it('should sort by next review date', () => {
			const cards: SpacedRepetitionCard[] = [
				{
					id: 'b',
					interval: 1,
					repetitions: 1,
					easeFactor: 2.5,
					nextReview: new Date('2020-02-01'),
				},
				{
					id: 'a',
					interval: 1,
					repetitions: 1,
					easeFactor: 2.5,
					nextReview: new Date('2020-01-01'),
				},
			];
			const due = getCardsDueForReview(cards);
			expect(due[0].id).toBe('a');
		});
	});

	describe('getCardsDueToday', () => {
		it('should return cards due before end of today', () => {
			const now = new Date();
			const today = new Date(now);
			today.setHours(12, 0, 0, 0);

			const cards: SpacedRepetitionCard[] = [
				{ id: '1', interval: 1, repetitions: 1, easeFactor: 2.5, nextReview: today },
				{ id: '2', interval: 1, repetitions: 1, easeFactor: 2.5, nextReview: new Date(2099, 0, 1) },
			];
			const due = getCardsDueToday(cards);
			expect(due.length).toBe(1);
		});
	});

	describe('getCardsDueByDate', () => {
		it('should return cards due on specific date', () => {
			const targetDate = new Date('2024-06-15');
			const cards: SpacedRepetitionCard[] = [
				{
					id: '1',
					interval: 1,
					repetitions: 1,
					easeFactor: 2.5,
					nextReview: new Date('2024-06-15'),
				},
				{
					id: '2',
					interval: 1,
					repetitions: 1,
					easeFactor: 2.5,
					nextReview: new Date('2024-06-16'),
				},
			];
			const due = getCardsDueByDate(cards, targetDate);
			expect(due.length).toBe(1);
			expect(due[0].id).toBe('1');
		});
	});

	describe('calculateMasteryLevel', () => {
		it('should return high mastery for high accuracy', () => {
			const mastery = calculateMasteryLevel(20, 18, 4.5);
			expect(mastery).toBeGreaterThan(70);
		});

		it('should return low mastery for low accuracy', () => {
			const mastery = calculateMasteryLevel(10, 3, 1.5);
			expect(mastery).toBeLessThan(40);
		});

		it('should return 0 for no reviews', () => {
			const mastery = calculateMasteryLevel(0, 0, 0);
			expect(mastery).toBe(0);
		});

		it('should apply recency bonus', () => {
			const mastery = calculateMasteryLevel(10, 7, 3.5);
			expect(mastery).toBeGreaterThan(0);
		});
	});

	describe('getReviewForecast', () => {
		it('should return forecast for upcoming cards', () => {
			const now = new Date();
			const cards: SpacedRepetitionCard[] = [
				{
					id: '1',
					interval: 1,
					repetitions: 1,
					easeFactor: 2.5,
					nextReview: new Date(now.getTime() + 1.5 * 24 * 60 * 60 * 1000),
				},
				{
					id: '2',
					interval: 1,
					repetitions: 1,
					easeFactor: 2.5,
					nextReview: new Date(now.getTime() + 3.5 * 24 * 60 * 60 * 1000),
				},
			];
			const forecast = getReviewForecast(cards, 7);
			expect(forecast[1]).toBe(1);
			expect(forecast[3]).toBe(1);
		});

		it('should return zeros for no cards', () => {
			const forecast = getReviewForecast([], 7);
			expect(forecast).toEqual([0, 0, 0, 0, 0, 0, 0]);
		});
	});

	it('should return zeros for no cards', () => {
		const forecast = getReviewForecast([], 7);
		expect(forecast).toEqual([0, 0, 0, 0, 0, 0, 0]);
	});
});

describe('initializeCard', () => {
	it('should create card with default values', () => {
		const card = initializeCard();
		expect(card.interval).toBe(0);
		expect(card.repetitions).toBe(0);
		expect(card.easeFactor).toBe(2.5);
		expect(card.nextReview).toBeInstanceOf(Date);
	});
});
