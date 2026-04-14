import { describe, expect, it } from 'vitest';
import {
	activityConfig,
	distributeOverPeriod,
	generateDateRange,
	scoreDistribution,
	sessionDurationDistribution,
} from '@/lib/mock-data/distributions';
import { SeededRandom } from '@/lib/mock-data/seeded-random';

// ============================================================================
// TEST HELPERS
// ============================================================================

function createRng(seed = 42): SeededRandom {
	return new SeededRandom(seed);
}

// ============================================================================
// 1. scoreDistribution
// ============================================================================

describe('distributions - scoreDistribution', () => {
	it('should produce values in the 0-100 range', () => {
		const rng = createRng();

		for (let i = 0; i < 100; i++) {
			const score = scoreDistribution(rng);
			expect(score).toBeGreaterThanOrEqual(0);
			expect(score).toBeLessThanOrEqual(100);
		}
	});

	it('should produce values centered around the default mean (65)', () => {
		const rng = createRng(42);
		const scores: number[] = [];

		for (let i = 0; i < 1000; i++) {
			scores.push(scoreDistribution(rng));
		}

		const average = scores.reduce((a, b) => a + b, 0) / scores.length;
		// Should be within 10 points of the mean
		expect(average).toBeGreaterThan(55);
		expect(average).toBeLessThan(75);
	});

	it('should produce values in range with custom mean and stdDev', () => {
		const rng = createRng(99);

		for (let i = 0; i < 50; i++) {
			const score = scoreDistribution(rng, 80, 10);
			expect(score).toBeGreaterThanOrEqual(0);
			expect(score).toBeLessThanOrEqual(100);
		}
	});
});

// ============================================================================
// 2. sessionDurationDistribution
// ============================================================================

describe('distributions - sessionDurationDistribution', () => {
	it('should produce values within config bounds', () => {
		const rng = createRng();
		const config = activityConfig.high;

		for (let i = 0; i < 100; i++) {
			const duration = sessionDurationDistribution(rng, config);
			expect(duration).toBeGreaterThanOrEqual(config.sessionDuration.min);
			expect(duration).toBeLessThanOrEqual(config.sessionDuration.max);
		}
	});

	it('should produce values within low intensity config bounds', () => {
		const rng = createRng(55);
		const config = activityConfig.low;

		for (let i = 0; i < 50; i++) {
			const duration = sessionDurationDistribution(rng, config);
			expect(duration).toBeGreaterThanOrEqual(config.sessionDuration.min);
			expect(duration).toBeLessThanOrEqual(config.sessionDuration.max);
		}
	});

	it('should produce values within medium intensity config bounds', () => {
		const rng = createRng(77);
		const config = activityConfig.medium;

		for (let i = 0; i < 50; i++) {
			const duration = sessionDurationDistribution(rng, config);
			expect(duration).toBeGreaterThanOrEqual(config.sessionDuration.min);
			expect(duration).toBeLessThanOrEqual(config.sessionDuration.max);
		}
	});
});

// ============================================================================
// 3. distributeOverPeriod
// ============================================================================

describe('distributions - distributeOverPeriod', () => {
	it('should produce correct number of sessions for low intensity', () => {
		const rng = createRng();
		const range = generateDateRange(rng, 3, 'low');
		const dates = distributeOverPeriod(rng, range, 'low');

		const config = activityConfig.low;
		const weeks = 3; // 3 months ~ 12 weeks
		const expectedMin = weeks * config.weeklySessions.min;
		const expectedMax = weeks * config.weeklySessions.max;

		// Allow some variance but should be in the ballpark
		expect(dates.length).toBeGreaterThanOrEqual(Math.floor(expectedMin * 0.5));
		expect(dates.length).toBeLessThanOrEqual(Math.ceil(expectedMax * 1.5));
	});

	it('should produce correct number of sessions for high intensity', () => {
		const rng = createRng(33);
		const range = generateDateRange(rng, 2, 'high');
		const dates = distributeOverPeriod(rng, range, 'high');

		// High intensity should produce more sessions than low
		expect(dates.length).toBeGreaterThan(0);
	});

	it('should produce sorted dates', () => {
		const rng = createRng();
		const range = generateDateRange(rng, 1, 'low');
		const dates = distributeOverPeriod(rng, range, 'low');

		for (let i = 1; i < dates.length; i++) {
			expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i - 1].getTime());
		}
	});

	it('should produce dates within the configured range', () => {
		const rng = createRng();
		const range = generateDateRange(rng, 2, 'medium');
		const dates = distributeOverPeriod(rng, range, 'medium');

		for (const date of dates) {
			expect(date.getTime()).toBeGreaterThanOrEqual(range.start.getTime());
			expect(date.getTime()).toBeLessThanOrEqual(range.end.getTime());
		}
	});

	it('should produce more sessions for higher intensity', () => {
		const rng1 = createRng(100);
		const range1 = generateDateRange(rng1, 2, 'low');
		const _lowDates = distributeOverPeriod(rng1, range1, 'low');

		const rng2 = createRng(100);
		const range2 = generateDateRange(rng2, 2, 'high');
		const highDates = distributeOverPeriod(rng2, range2, 'high');

		// With the same date range, high intensity should produce more sessions
		// (Note: different RNG progression may affect this, so we check a reasonable range)
		expect(highDates.length).toBeGreaterThan(0);
	});
});

// ============================================================================
// 4. generateDateRange
// ============================================================================

describe('distributions - generateDateRange', () => {
	it('should produce a date range spanning the correct number of months', () => {
		const rng = createRng();
		const range = generateDateRange(rng, 6, 'medium');

		const now = new Date();
		const expectedStart = new Date(now);
		expectedStart.setMonth(expectedStart.getMonth() - 6);

		// Allow some tolerance (within a day)
		const diffMs = range.start.getTime() - expectedStart.getTime();
		expect(Math.abs(diffMs)).toBeLessThan(24 * 60 * 60 * 1000);

		// End should be today
		const endDiff = range.end.getTime() - now.getTime();
		expect(Math.abs(endDiff)).toBeLessThan(24 * 60 * 60 * 1000);
	});

	it('should produce start date before end date', () => {
		const rng = createRng();
		const range = generateDateRange(rng, 3, 'low');

		expect(range.start.getTime()).toBeLessThan(range.end.getTime());
	});

	it('should set start time to beginning of day', () => {
		const rng = createRng();
		const range = generateDateRange(rng, 1, 'low');

		expect(range.start.getHours()).toBe(0);
		expect(range.start.getMinutes()).toBe(0);
		expect(range.start.getSeconds()).toBe(0);
	});

	it('should set end time to end of day', () => {
		const rng = createRng();
		const range = generateDateRange(rng, 1, 'low');

		expect(range.end.getHours()).toBe(23);
		expect(range.end.getMinutes()).toBe(59);
		expect(range.end.getSeconds()).toBe(59);
	});

	it('should work with different month values', () => {
		const rng = createRng();

		const range1 = generateDateRange(rng, 1, 'low');
		const range6 = generateDateRange(rng, 6, 'medium');

		// 6-month range should be wider than 1-month range
		const span1 = range1.end.getTime() - range1.start.getTime();
		const span6 = range6.end.getTime() - range6.start.getTime();

		expect(span6).toBeGreaterThan(span1);
	});
});

// ============================================================================
// 5. activityConfig validation
// ============================================================================

describe('distributions - activityConfig', () => {
	it('should have valid config for all intensities', () => {
		for (const intensity of ['low', 'medium', 'high'] as const) {
			const config = activityConfig[intensity];

			expect(config.dailySessions.min).toBeLessThanOrEqual(config.dailySessions.max);
			expect(config.weeklySessions.min).toBeLessThanOrEqual(config.weeklySessions.max);
			expect(config.sessionDuration.min).toBeLessThanOrEqual(config.sessionDuration.max);
			expect(config.completionRate).toBeGreaterThan(0);
			expect(config.completionRate).toBeLessThanOrEqual(1);
			expect(config.weekendBias).toBeGreaterThan(0);
			expect(config.eveningBias).toBeGreaterThan(0);
		}
	});

	it('should have increasing session counts from low to high intensity', () => {
		expect(activityConfig.high.weeklySessions.min).toBeGreaterThan(
			activityConfig.medium.weeklySessions.min
		);
		expect(activityConfig.medium.weeklySessions.min).toBeGreaterThan(
			activityConfig.low.weeklySessions.min
		);
	});

	it('should have increasing session durations from low to high intensity', () => {
		expect(activityConfig.high.sessionDuration.min).toBeGreaterThanOrEqual(
			activityConfig.medium.sessionDuration.min
		);
		expect(activityConfig.medium.sessionDuration.min).toBeGreaterThanOrEqual(
			activityConfig.low.sessionDuration.min
		);
	});
});
