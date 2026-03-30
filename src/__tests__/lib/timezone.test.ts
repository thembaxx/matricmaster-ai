import { describe, expect, it } from 'vitest';
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
			const result = getBrowserTimezone();
			expect(result).toBe(DEFAULT_TIMEZONE);
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
			expect(result).toBeInstanceOf(Date);
		});
	});

	describe('toUTC', () => {
		it('should convert string date to UTC', () => {
			const result = toUTC('2024-01-15T10:00:00Z');
			expect(result).toBeInstanceOf(Date);
		});

		it('should handle Date object input', () => {
			const date = new Date('2024-01-15T10:00:00Z');
			const result = toUTC(date);
			expect(result).toBeInstanceOf(Date);
		});
	});

	describe('formatDateTimeLocal', () => {
		it('should format date with default options', () => {
			const result = formatDateTimeLocal('2024-01-15T10:00:00Z');
			expect(result).toBeDefined();
			expect(typeof result).toBe('string');
		});

		it('should accept custom timezone', () => {
			const result = formatDateTimeLocal('2024-01-15T10:00:00Z', 'America/New_York');
			expect(result).toBeDefined();
		});

		it('should accept custom format options', () => {
			const result = formatDateTimeLocal('2024-01-15T10:00:00Z', undefined, {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			});
			expect(result).toContain('2024');
		});
	});

	describe('formatTimeOnly', () => {
		it('should format time only', () => {
			const result = formatTimeOnly('2024-01-15T10:30:00Z');
			expect(result).toBeDefined();
			expect(typeof result).toBe('string');
		});

		it('should accept custom timezone', () => {
			const result = formatTimeOnly('2024-01-15T10:30:00Z', 'America/New_York');
			expect(result).toBeDefined();
		});
	});

	describe('formatDateOnly', () => {
		it('should format date only', () => {
			const result = formatDateOnly('2024-01-15T10:30:00Z');
			expect(result).toBeDefined();
			expect(typeof result).toBe('string');
		});

		it('should accept custom timezone', () => {
			const result = formatDateOnly('2024-01-15T10:30:00Z', 'America/New_York');
			expect(result).toBeDefined();
		});
	});

	describe('getTimezoneOffset', () => {
		it('should return numeric offset for valid timezone', () => {
			const result = getTimezoneOffset('Africa/Johannesburg');
			expect(typeof result).toBe('number');
			expect(result).toBe(2);
		});

		it('should return offset for UTC', () => {
			const result = getTimezoneOffset('UTC');
			expect(result).toBe(0);
		});

		it('should return offset for US timezones', () => {
			const result = getTimezoneOffset('America/New_York');
			expect(typeof result).toBe('number');
		});
	});

	describe('isValidTimezone', () => {
		it('should return true for valid timezone', () => {
			expect(isValidTimezone('Africa/Johannesburg')).toBe(true);
		});

		it('should return true for UTC', () => {
			expect(isValidTimezone('UTC')).toBe(true);
		});

		it('should return true for America/New_York', () => {
			expect(isValidTimezone('America/New_York')).toBe(true);
		});

		it('should return false for invalid timezone', () => {
			expect(isValidTimezone('Invalid/Timezone')).toBe(false);
		});

		it('should return false for random string', () => {
			expect(isValidTimezone('not_a_timezone')).toBe(false);
		});
	});

	describe('COMMON_TIMEZONES', () => {
		it('should have South Africa as first option', () => {
			expect(COMMON_TIMEZONES[0].value).toBe('Africa/Johannesburg');
			expect(COMMON_TIMEZONES[0].offset).toBe(2);
		});

		it('should have multiple timezone options', () => {
			expect(COMMON_TIMEZONES.length).toBeGreaterThan(5);
		});

		it('should have valid offset values', () => {
			COMMON_TIMEZONES.forEach((tz) => {
				expect(typeof tz.offset).toBe('number');
				expect(tz.value).toBeDefined();
				expect(tz.label).toBeDefined();
			});
		});
	});
});
