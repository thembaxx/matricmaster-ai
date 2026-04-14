import { describe, expect, it } from 'vitest';
import { createSeededRandom, SeededRandom } from '@/lib/mock-data/seeded-random';

// ============================================================================
// 1. DETERMINISM / REPRODUCIBILITY
// ============================================================================

describe('SeededRandom - Determinism', () => {
	it('should produce the same sequence with the same seed', () => {
		const rng1 = new SeededRandom(12345);
		const rng2 = new SeededRandom(12345);

		for (let i = 0; i < 100; i++) {
			expect(rng1.next()).toBe(rng2.next());
		}
	});

	it('should produce different sequences with different seeds', () => {
		const rng1 = new SeededRandom(111);
		const rng2 = new SeededRandom(222);

		const sequences: number[][] = [[], []];
		for (let i = 0; i < 10; i++) {
			sequences[0].push(rng1.next());
			sequences[1].push(rng2.next());
		}

		// At least some values should differ
		const allSame = sequences[0].every((v, i) => v === sequences[1][i]);
		expect(allSame).toBe(false);
	});
});

// ============================================================================
// 2. next()
// ============================================================================

describe('SeededRandom - next()', () => {
	it('should return values in [0, 1)', () => {
		const rng = new SeededRandom(42);

		for (let i = 0; i < 1000; i++) {
			const value = rng.next();
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThan(1);
		}
	});

	it('should return a sequence of pseudo-random numbers', () => {
		const rng = new SeededRandom(42);
		const values: number[] = [];

		for (let i = 0; i < 100; i++) {
			values.push(rng.next());
		}

		// Not all values should be the same
		const allSame = values.every((v) => v === values[0]);
		expect(allSame).toBe(false);
	});
});

// ============================================================================
// 3. nextInt()
// ============================================================================

describe('SeededRandom - nextInt()', () => {
	it('should return integers within the specified range (inclusive)', () => {
		const rng = new SeededRandom(42);

		for (let i = 0; i < 100; i++) {
			const value = rng.nextInt(5, 15);
			expect(value).toBeGreaterThanOrEqual(5);
			expect(value).toBeLessThanOrEqual(15);
			expect(Number.isInteger(value)).toBe(true);
		}
	});

	it('should return the min value when min equals max', () => {
		const rng = new SeededRandom(42);
		const value = rng.nextInt(7, 7);
		expect(value).toBe(7);
	});

	it('should return either 0 or 1 for nextInt(0, 1)', () => {
		const rng = new SeededRandom(42);

		for (let i = 0; i < 50; i++) {
			const value = rng.nextInt(0, 1);
			expect([0, 1]).toContain(value);
		}
	});
});

// ============================================================================
// 4. nextFloat()
// ============================================================================

describe('SeededRandom - nextFloat()', () => {
	it('should return floats within the specified range', () => {
		const rng = new SeededRandom(42);

		for (let i = 0; i < 100; i++) {
			const value = rng.nextFloat(2.5, 7.5);
			expect(value).toBeGreaterThanOrEqual(2.5);
			expect(value).toBeLessThanOrEqual(7.5);
		}
	});

	it('should return values across the full range', () => {
		const rng = new SeededRandom(42);
		const values: number[] = [];

		for (let i = 0; i < 100; i++) {
			values.push(rng.nextFloat(0, 100));
		}

		const min = Math.min(...values);
		const max = Math.max(...values);

		// Should cover most of the range
		expect(min).toBeLessThan(50);
		expect(max).toBeGreaterThan(50);
	});
});

// ============================================================================
// 5. boolean()
// ============================================================================

describe('SeededRandom - boolean()', () => {
	it('should return boolean values', () => {
		const rng = new SeededRandom(42);

		for (let i = 0; i < 50; i++) {
			const value = rng.boolean();
			expect(typeof value).toBe('boolean');
		}
	});

	it('should respect probability (approximately)', () => {
		const rng = new SeededRandom(42);
		let trueCount = 0;
		const iterations = 1000;

		for (let i = 0; i < iterations; i++) {
			if (rng.boolean(0.3)) trueCount++;
		}

		const ratio = trueCount / iterations;
		// Should be within 15% of the expected probability
		expect(ratio).toBeGreaterThan(0.15);
		expect(ratio).toBeLessThan(0.45);
	});
});

// ============================================================================
// 6. pick()
// ============================================================================

describe('SeededRandom - pick()', () => {
	it('should return an item from the array', () => {
		const rng = new SeededRandom(42);
		const array = ['a', 'b', 'c', 'd', 'e'];

		for (let i = 0; i < 50; i++) {
			const picked = rng.pick(array);
			expect(array).toContain(picked);
		}
	});

	it('should return the only element from a single-element array', () => {
		const rng = new SeededRandom(42);
		const array = ['only-item'];
		expect(rng.pick(array)).toBe('only-item');
	});

	it('should pick different items over time (not always the same)', () => {
		const rng = new SeededRandom(42);
		const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const picks = new Set<number>();

		for (let i = 0; i < 100; i++) {
			picks.add(rng.pick(array));
		}

		// Should pick at least 3 different items
		expect(picks.size).toBeGreaterThan(3);
	});
});

// ============================================================================
// 7. pickWeighted()
// ============================================================================

describe('SeededRandom - pickWeighted()', () => {
	it('should respect weights (high-weight items picked more often)', () => {
		const rng = new SeededRandom(42);
		const items = ['A', 'B', 'C'];
		const weights = [0.1, 0.1, 0.8];
		const counts: Record<string, number> = { A: 0, B: 0, C: 0 };

		for (let i = 0; i < 1000; i++) {
			const picked = rng.pickWeighted(items, weights);
			counts[picked]++;
		}

		// C (weight 0.8) should be picked significantly more than A or B
		expect(counts.C).toBeGreaterThan(counts.A);
		expect(counts.C).toBeGreaterThan(counts.B);
	});

	it('should return an item from the array', () => {
		const rng = new SeededRandom(42);
		const items = ['x', 'y', 'z'];
		const weights = [1, 1, 1];

		for (let i = 0; i < 20; i++) {
			const picked = rng.pickWeighted(items, weights);
			expect(items).toContain(picked);
		}
	});

	it('should return the only item when array has one element', () => {
		const rng = new SeededRandom(42);
		expect(rng.pickWeighted(['only'], [1])).toBe('only');
	});
});

// ============================================================================
// 8. shuffle()
// ============================================================================

describe('SeededRandom - shuffle()', () => {
	it('should return an array with the same elements', () => {
		const rng = new SeededRandom(42);
		const original = [1, 2, 3, 4, 5];
		const shuffled = rng.shuffle(original);

		expect(shuffled.sort()).toEqual([...original].sort());
	});

	it('should not modify the original array', () => {
		const rng = new SeededRandom(42);
		const original = [1, 2, 3, 4, 5];
		const originalCopy = [...original];

		rng.shuffle(original);
		expect(original).toEqual(originalCopy);
	});

	it('should produce the same shuffle with the same seed', () => {
		const rng1 = new SeededRandom(42);
		const rng2 = new SeededRandom(42);
		const array = [1, 2, 3, 4, 5];

		const shuffled1 = rng1.shuffle(array);
		const shuffled2 = rng2.shuffle([...array]);

		expect(shuffled1).toEqual(shuffled2);
	});
});

// ============================================================================
// 9. uuid()
// ============================================================================

describe('SeededRandom - uuid()', () => {
	it('should produce valid UUID format (xxxxxxxx-xxxx-4xxx-[89ab]xxx-xxxxxxxxxxxx)', () => {
		const rng = new SeededRandom(42);
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

		for (let i = 0; i < 50; i++) {
			const uuid = rng.uuid();
			expect(uuid).toMatch(uuidRegex);
		}
	});

	it('should produce unique UUIDs', () => {
		const rng = new SeededRandom(42);
		const uuids = new Set<string>();

		for (let i = 0; i < 100; i++) {
			const uuid = rng.uuid();
			expect(uuids.has(uuid)).toBe(false);
			uuids.add(uuid);
		}
	});

	it('should be 36 characters long (including hyphens)', () => {
		const rng = new SeededRandom(42);
		const uuid = rng.uuid();
		expect(uuid.length).toBe(36);
	});

	it('should have version 4 at position 14', () => {
		const rng = new SeededRandom(42);
		const uuid = rng.uuid();
		expect(uuid[14]).toBe('4');
	});
});

// ============================================================================
// 10. normal()
// ============================================================================

describe('SeededRandom - normal()', () => {
	it('should produce values around the mean', () => {
		const rng = new SeededRandom(42);
		const values: number[] = [];

		for (let i = 0; i < 1000; i++) {
			values.push(rng.normal(50, 5));
		}

		const average = values.reduce((a, b) => a + b, 0) / values.length;
		// Average should be close to mean
		expect(average).toBeGreaterThan(47);
		expect(average).toBeLessThan(53);
	});

	it('should produce values with approximately the correct spread', () => {
		const rng = new SeededRandom(42);
		const values: number[] = [];

		for (let i = 0; i < 1000; i++) {
			values.push(rng.normal(0, 1));
		}

		// Most values (99.7%) should be within 3 standard deviations
		const within3Sigma = values.filter((v) => Math.abs(v) <= 3).length;
		expect(within3Sigma).toBeGreaterThan(900);
	});
});

// ============================================================================
// 11. logNormal()
// ============================================================================

describe('SeededRandom - logNormal()', () => {
	it('should produce positive values', () => {
		const rng = new SeededRandom(42);

		for (let i = 0; i < 100; i++) {
			const value = rng.logNormal(0, 1);
			expect(value).toBeGreaterThan(0);
		}
	});
});

// ============================================================================
// 12. repeat()
// ============================================================================

describe('SeededRandom - repeat()', () => {
	it('should call the generator function count times', () => {
		const rng = new SeededRandom(42);
		let callCount = 0;

		const result = rng.repeat(10, (index) => {
			callCount++;
			return index * 2;
		});

		expect(callCount).toBe(10);
		expect(result).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
	});

	it('should return an array of the correct length', () => {
		const rng = new SeededRandom(42);
		const result = rng.repeat(5, () => 'x');
		expect(result).toEqual(['x', 'x', 'x', 'x', 'x']);
	});
});

// ============================================================================
// 13. createSeededRandom factory
// ============================================================================

describe('createSeededRandom', () => {
	it('should create a SeededRandom instance with the provided seed', () => {
		const rng = createSeededRandom(123);
		expect(rng).toBeInstanceOf(SeededRandom);
	});

	it('should create a SeededRandom instance with a random seed if none provided', () => {
		const rng = createSeededRandom();
		expect(rng).toBeInstanceOf(SeededRandom);

		// Should still produce valid random numbers
		const value = rng.next();
		expect(value).toBeGreaterThanOrEqual(0);
		expect(value).toBeLessThan(1);
	});
});
