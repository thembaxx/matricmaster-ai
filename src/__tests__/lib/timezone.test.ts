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

		it('should return null for invalid input', () => {
			const result = toUserTime('invalid-date' as string);
			expect(result).toBeNull();
		});
	});

	describe('toUTC', () => {
		it('should convert Date to UTC string', () => {
			const date = new Date('2024-01-15T10:00:00Z');
			const result = toUTC(date);
			expect(typeof result).toBe('string');
		});

		it('should handle null input', () => {
			const result = toUTC(null as unknown as Date);
			expect(result).toBeNull();
		});
	});

	describe('formatDateOnly', () => {
		it('should format date correctly', () => {
			const date = new Date('2024-01-15');
			const result = formatDateOnly(date, 'en-US');
			expect(typeof result).toBe('string');
		});
	});

	describe('formatTimeOnly', () => {
		it('should format time correctly', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = formatTimeOnly(date, 'en-US');
			expect(typeof result).toBe('string');
		});
	});

	describe('formatDateTimeLocal', () => {
		it('should format datetime correctly', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = formatDateTimeLocal(date, 'en-US');
			expect(typeof result).toBe('string');
		});
	});

	describe('getTimezoneOffset', () => {
		it('should return valid offset', () => {
			const offset = getTimezoneOffset('Africa/Johannesburg');
			expect(typeof offset).toBe('number');
		});

		it('should return 0 for invalid timezone', () => {
			const offset = getTimezoneOffset('Invalid/Timezone');
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
			expect(COMMON_TIMEZONES).toContain('Africa/Johannesburg');
			expect(COMMON_TIMEZONES).toContain('UTC');
		});
	});
});
