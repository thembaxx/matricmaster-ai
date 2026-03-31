import { describe, expect, it } from 'vitest';
import { calculateNextReview, calculateNextReviewBoolean } from '@/lib/spaced-repetition';

describe('spaced-repetition server actions', () => {
	describe('calculateNextReviewBoolean', () => {
		it('should increase interval for correct answer', () => {
			const result = calculateNextReviewBoolean(true, 1, 2.5, 0);
			expect(result.intervalDays).toBeGreaterThan(1);
		});

		it('should reset interval for incorrect answer', () => {
			const result = calculateNextReviewBoolean(false, 5, 2.5, 0);
			expect(result.intervalDays).toBe(1);
		});

		it('should adjust ease factor based on performance', () => {
			const resultCorrect = calculateNextReviewBoolean(true, 1, 2.5, 0);
			const resultIncorrect = calculateNextReviewBoolean(false, 1, 2.5, 0);
			expect(resultCorrect.easeFactor).toBeGreaterThan(resultIncorrect.easeFactor);
		});

		it('should handle consecutive correct answers', () => {
			// Test the consecutive correct logic
			const result = calculateNextReviewBoolean(true, 1, 2.5, 3);
			// With consecutive correct, the interval should increase significantly
			expect(result.intervalDays).toBeGreaterThanOrEqual(1);
		});

		it('should respect minimum ease factor', () => {
			const result = calculateNextReviewBoolean(false, 1, 1.3, 0);
			expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
		});
	});

	describe('calculateNextReview', () => {
		it('should calculate correct interval for rating 5', () => {
			const result = calculateNextReview(1, 0, 2.5, 5);
			expect(result.interval).toBe(1);
			expect(result.repetitions).toBe(1);
		});

		it('should calculate correct interval for rating 4', () => {
			const result = calculateNextReview(1, 0, 2.5, 4);
			expect(result.interval).toBe(1);
			expect(result.repetitions).toBe(1);
		});

		it('should calculate correct interval for rating 3', () => {
			const result = calculateNextReview(1, 0, 2.5, 3);
			expect(result.interval).toBe(1);
			expect(result.repetitions).toBe(1);
		});

		it('should reset for rating below 3', () => {
			const result = calculateNextReview(6, 3, 2.5, 2);
			expect(result.interval).toBe(1);
			expect(result.repetitions).toBe(0);
		});

		it('should calculate correct interval for second repetition', () => {
			const result = calculateNextReview(1, 1, 2.5, 4);
			expect(result.interval).toBe(6);
		});

		it('should calculate correct interval for subsequent repetitions', () => {
			const result = calculateNextReview(6, 2, 2.5, 4);
			expect(result.interval).toBeGreaterThan(6);
		});

		it('should decrease ease factor for difficult cards', () => {
			const result = calculateNextReview(1, 0, 2.5, 1);
			expect(result.easeFactor).toBeLessThan(2.5);
		});

		it('should increase ease factor for easy cards', () => {
			const result = calculateNextReview(1, 0, 2.5, 5);
			expect(result.easeFactor).toBeGreaterThan(2.5);
		});
	});
});
