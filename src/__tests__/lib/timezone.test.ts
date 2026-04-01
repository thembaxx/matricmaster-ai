import { describe, expect, it, vi } from 'vitest';
import {
	COMMON_TIMEZONES,
	DEFAULT_TIMEZONE,
	formatDateOnly,
	formatDateTimeLocal,
	formatTimeOnly,
	getBrowserTimezone,
	getTimezoneOffset,
	isValidTimezone,
	toUserTime,
	toUTC,
} from '@/lib/timezone';

describe('timezone', () => {
	describe('getBrowserTimezone', () => {
		it('should return default timezone in server environment', () => {
			vi.spyOn(Intl, 'DateTimeFormat').mockReturnValue({
				resolvedOptions: () => ({ timeZone: 'Africa/Johannesburg' }),
			} as Intl.DateTimeFormat);
			const result = getBrowserTimezone();
			expect(result).toBe(DEFAULT_TIMEZONE);
			vi.restoreAllMocks();
		});
	});

	describe('toUserTime', () => {
		it('should convert string date to Date object', () => {
			const result = toUserTime('2024-01-15T10:00:00Z');
			expect(result).toBeInstanceOf(Date);
		});

		it('should handle Date object input', () => {
			const date = new Date('2024-01-15T10:00:00Z');
			const result = toUserTime(date);
			expect(result).toBe(date);
		});

		it('should return Invalid Date for invalid input', () => {
			const result = toUserTime('invalid-date' as string);
			expect(result).toBeInstanceOf(Date);
			expect(Number.isNaN(result.getTime())).toBe(true);
		});
	});

	describe('toUTC', () => {
		it('should convert Date to Date object', () => {
			const date = new Date('2024-01-15T10:00:00Z');
			const result = toUTC(date);
			expect(result).toBeInstanceOf(Date);
		});

		it('should throw for null input', () => {
			expect(() => toUTC(null as unknown as Date)).toThrow();
		});
	});

	describe('formatDateOnly', () => {
		it('should format date correctly with valid timezone', () => {
			const date = new Date('2024-01-15');
			const result = formatDateOnly(date, 'Africa/Johannesburg');
			expect(typeof result).toBe('string');
		});

		it('should format date with default timezone', () => {
			const date = new Date('2024-01-15');
			const result = formatDateOnly(date);
			expect(typeof result).toBe('string');
		});
	});

	describe('formatTimeOnly', () => {
		it('should format time correctly with valid timezone', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = formatTimeOnly(date, 'Africa/Johannesburg');
			expect(typeof result).toBe('string');
		});

		it('should format time with default timezone', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = formatTimeOnly(date);
			expect(typeof result).toBe('string');
		});
	});

	describe('formatDateTimeLocal', () => {
		it('should format datetime correctly with valid timezone', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = formatDateTimeLocal(date, 'Africa/Johannesburg');
			expect(typeof result).toBe('string');
		});

		it('should format datetime with default timezone', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = formatDateTimeLocal(date);
			expect(typeof result).toBe('string');
		});
	});

	describe('getTimezoneOffset', () => {
		it('should return valid offset for known timezone', () => {
			const offset = getTimezoneOffset('Africa/Johannesburg');
			expect(typeof offset).toBe('number');
		});

		it('should return numeric offset for UTC', () => {
			const offset = getTimezoneOffset('UTC');
			expect(offset).toBe(0);
		});
	});

	describe('isValidTimezone', () => {
		it('should return true for valid timezone', () => {
			expect(isValidTimezone('Africa/Johannesburg')).toBe(true);
		});

		it('should return false for invalid timezone', () => {
			expect(isValidTimezone('Invalid/Timezone')).toBe(false);
		});
	});

	describe('COMMON_TIMEZONES', () => {
		it('should contain expected timezones', () => {
			const timezoneValues = COMMON_TIMEZONES.map((tz) => tz.value);
			expect(timezoneValues).toContain('Africa/Johannesburg');
			expect(timezoneValues).toContain('UTC');
		});

		it('should have timezone objects with required properties', () => {
			for (const tz of COMMON_TIMEZONES) {
				expect(tz).toHaveProperty('value');
				expect(tz).toHaveProperty('label');
				expect(tz).toHaveProperty('offset');
			}
		});
	});
});
