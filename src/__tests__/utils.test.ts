import { describe, expect, it } from 'vitest';

describe('Utility Functions', () => {
	it('should pass a basic test', () => {
		expect(1 + 1).toBe(2);
	});

	it('should handle string operations', () => {
		const str = 'MatricMaster';
		expect(str.toLowerCase()).toBe('matricmaster');
		expect(str.length).toBe(12);
	});

	it('should handle array operations', () => {
		const arr = [1, 2, 3, 4, 5];
		expect(arr.filter((n) => n > 2)).toEqual([3, 4, 5]);
		expect(arr.map((n) => n * 2)).toEqual([2, 4, 6, 8, 10]);
	});
});
