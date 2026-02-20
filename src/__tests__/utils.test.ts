import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils';

describe('Utility Functions', () => {
	it('should merge tailwind classes correctly', () => {
		const result = cn('px-2', 'px-4');
		expect(result).toBe('px-4');
	});

	it('should merge conflicting classes with twMerge', () => {
		const result = cn('text-sm', 'text-lg');
		expect(result).toBe('text-lg');
	});

	it('should combine non-conflicting classes', () => {
		const result = cn('p-4', 'rounded-lg');
		expect(result).toContain('p-4');
		expect(result).toContain('rounded-lg');
	});

	it('should handle conditional classes', () => {
		const isActive = true;
		const result = cn('base-class', isActive ? 'active-class' : 'inactive-class');
		expect(result).toContain('base-class');
		expect(result).toContain('active-class');
		expect(result).not.toContain('inactive-class');
	});

	it('should handle empty inputs', () => {
		const result = cn('');
		expect(result).toBe('');
	});

	it('should handle null and undefined inputs', () => {
		const result = cn('p-4', null, undefined, 'rounded');
		expect(result).toContain('p-4');
		expect(result).toContain('rounded');
	});
});
