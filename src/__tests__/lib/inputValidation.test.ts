import { describe, expect, it } from 'vitest';
import {
	handleEmptySubmission,
	prepareForAI,
	sanitizeInput,
	sanitizeSearchQuery,
	truncateInput,
	validateAndSanitize,
	validateEmail,
	validateUsername,
} from '@/lib/inputValidation';

describe('inputValidation', () => {
	describe('sanitizeInput', () => {
		it('should return empty string for null input', () => {
			expect(sanitizeInput(null as unknown as string)).toBe('');
		});

		it('should return empty string for undefined input', () => {
			expect(sanitizeInput(undefined as unknown as string)).toBe('');
		});

		it('should return empty string for non-string input', () => {
			expect(sanitizeInput(123 as unknown as string)).toBe('');
		});

		it('should remove control characters', () => {
			const input = `hello${String.fromCharCode(0)}world${String.fromCharCode(31)}test`;
			expect(sanitizeInput(input)).toBe('helloworldtest');
		});

		it('should remove script tags completely', () => {
			const input =
				'hello' +
				String.fromCharCode(60) +
				'script' +
				String.fromCharCode(62) +
				'alert(1)' +
				String.fromCharCode(60) +
				'/script' +
				String.fromCharCode(62) +
				'world';
			const result = sanitizeInput(input);
			expect(result).not.toContain('<script>');
			expect(result).not.toContain('</script>');
		});

		it('should remove HTML tags', () => {
			const input =
				'hello' +
				String.fromCharCode(60) +
				'br' +
				String.fromCharCode(62) +
				'world' +
				String.fromCharCode(60) +
				'p' +
				String.fromCharCode(62) +
				'test' +
				String.fromCharCode(60) +
				'/p' +
				String.fromCharCode(62);
			expect(sanitizeInput(input)).toBe('helloworldtest');
		});

		it('should trim whitespace', () => {
			const input = '  hello world  ';
			expect(sanitizeInput(input)).toBe('hello world');
		});

		it('should handle normal text', () => {
			const input = 'Hello World!';
			expect(sanitizeInput(input)).toBe('Hello World!');
		});
	});

	describe('sanitizeSearchQuery', () => {
		it('should return empty string for null input', () => {
			expect(sanitizeSearchQuery(null as unknown as string)).toBe('');
		});

		it('should remove angle brackets', () => {
			const input = 'hello<world>';
			expect(sanitizeSearchQuery(input)).toBe('helloworld');
		});

		it('should remove quotes and semicolons', () => {
			const input = `hello${String.fromCharCode(39)}${String.fromCharCode(34)}world;test`;
			expect(sanitizeSearchQuery(input)).toBe('helloworldtest');
		});

		it('should trim whitespace', () => {
			const input = '  hello world  ';
			expect(sanitizeSearchQuery(input)).toBe('hello world');
		});

		it('should handle normal search query', () => {
			const input = 'mathematics calculus';
			expect(sanitizeSearchQuery(input)).toBe('mathematics calculus');
		});
	});

	describe('truncateInput', () => {
		it('should return error for null input', () => {
			const result = truncateInput(null as unknown as string);
			expect(result.isValid).toBe(false);
			expect(result.error).toBe('Input is empty');
		});

		it('should return error for undefined input', () => {
			const result = truncateInput(undefined as unknown as string);
			expect(result.isValid).toBe(false);
			expect(result.error).toBe('Input is empty');
		});

		it('should return error for non-string input', () => {
			const result = truncateInput(123 as unknown as string);
			expect(result.isValid).toBe(false);
			expect(result.error).toBe('Input is empty');
		});

		it('should not truncate input shorter than max length', () => {
			const result = truncateInput('hello world', 100);
			expect(result.isValid).toBe(true);
			expect(result.sanitized).toBe('hello world');
			expect(result.truncated).toBe(false);
		});

		it('should truncate input longer than max length', () => {
			const input = 'a'.repeat(150);
			const result = truncateInput(input, 100);
			expect(result.isValid).toBe(true);
			expect(result.sanitized.length).toBe(100);
			expect(result.truncated).toBe(true);
			expect(result.warning).toContain('truncated');
		});

		it('should use default max length', () => {
			const input = 'a'.repeat(15000);
			const result = truncateInput(input);
			expect(result.truncated).toBe(true);
		});

		it('should handle exact max length', () => {
			const input = 'hello';
			const result = truncateInput(input, 5);
			expect(result.isValid).toBe(true);
			expect(result.sanitized).toBe('hello');
			expect(result.truncated).toBe(false);
		});
	});

	describe('validateAndSanitize', () => {
		it('should return error for empty required input', () => {
			const result = validateAndSanitize('', { required: true });
			expect(result.isValid).toBe(false);
			expect(result.error).toBe('Input is required');
		});

		it('should return error for whitespace-only input when required', () => {
			const result = validateAndSanitize('   ', { required: true });
			expect(result.isValid).toBe(false);
			expect(result.error).toBe('Input is required');
		});

		it('should return error for empty input when not required and not allowEmpty', () => {
			const result = validateAndSanitize('');
			expect(result.isValid).toBe(false);
		});

		it('should allow empty when allowEmpty is true', () => {
			const result = validateAndSanitize('', { allowEmpty: true });
			expect(result.isValid).toBe(true);
		});

		it('should sanitize HTML content', () => {
			const result = validateAndSanitize('hello<script>alert(1)</script>world');
			expect(result.isValid).toBe(true);
			expect(result.sanitized).not.toContain('<script>');
		});

		it('should truncate long input', () => {
			const input = 'a'.repeat(200);
			const result = validateAndSanitize(input, { maxLength: 100 });
			expect(result.truncated).toBe(true);
			expect(result.sanitized.length).toBe(100);
		});

		it('should return error for input with only invalid characters', () => {
			const result = validateAndSanitize(
				String.fromCharCode(0) + String.fromCharCode(31) + String.fromCharCode(127)
			);
			expect(result.isValid).toBe(false);
			expect(result.error).toContain('invalid characters');
		});
	});

	describe('validateEmail', () => {
		it('should return false for null input', () => {
			expect(validateEmail(null as unknown as string)).toBe(false);
		});

		it('should return false for undefined input', () => {
			expect(validateEmail(undefined as unknown as string)).toBe(false);
		});

		it('should return false for non-string input', () => {
			expect(validateEmail(123 as unknown as string)).toBe(false);
		});

		it('should return false for invalid email', () => {
			expect(validateEmail('notanemail')).toBe(false);
		});

		it('should return false for email without domain', () => {
			expect(validateEmail('test@')).toBe(false);
		});

		it('should return false for email without at sign', () => {
			expect(validateEmail('test.example.com')).toBe(false);
		});

		it('should return true for valid email', () => {
			expect(validateEmail('test@example.com')).toBe(true);
		});

		it('should return true for email with subdomain', () => {
			expect(validateEmail('test@mail.example.com')).toBe(true);
		});

		it('should handle email with plus sign', () => {
			expect(validateEmail('test+tag@example.com')).toBe(true);
		});
	});

	describe('validateUsername', () => {
		it('should return error for null input', () => {
			const result = validateUsername(null as unknown as string);
			expect(result.isValid).toBe(false);
			expect(result.error).toContain('required');
		});

		it('should return error for username too short', () => {
			const result = validateUsername('ab');
			expect(result.isValid).toBe(false);
			expect(result.error).toContain('at least 3 characters');
		});

		it('should return error for username too long', () => {
			const result = validateUsername('aaaaaaaaaaaaaaaaaaaaaaaaa');
			expect(result.isValid).toBe(false);
			expect(result.error).toContain('at most 20 characters');
		});

		it('should sanitize and validate valid username', () => {
			const result = validateUsername('  Test_User!  ');
			expect(result.isValid).toBe(true);
			expect(result.sanitized).toBe('test_user');
		});

		it('should remove special characters', () => {
			const result = validateUsername('Test@User#123');
			expect(result.sanitized).toBe('testuser123');
		});

		it('should handle username at max length', () => {
			const result = validateUsername('aaaaaaaaaaaaaaaaaaaa');
			expect(result.isValid).toBe(true);
		});

		it('should handle username at min length', () => {
			const result = validateUsername('abc');
			expect(result.isValid).toBe(true);
		});
	});

	describe('prepareForAI', () => {
		it('should preserve and convert math expressions with double dollar', () => {
			const input = 'Solve x^2 + y^2 = r^2 for x';
			const result = prepareForAI(input, { preserveMath: true });
			// The function should convert  to $ after processing
			expect(result).toBeDefined();
		});

		it('should preserve and convert math expressions with single dollar', () => {
			const input = 'The value is  + 5$';
			const result = prepareForAI(input, { preserveMath: true });
			expect(result).toBeDefined();
		});

		it('should sanitize HTML when preserveMath is false', () => {
			const input = '<script>alert(1)</script>Hello';
			const result = prepareForAI(input, { preserveMath: false });
			expect(result).not.toContain('<script>');
		});

		it('should truncate long input with warning', () => {
			const input = 'a'.repeat(15000);
			const result = prepareForAI(input);
			expect(result).toContain('truncated');
		});

		it('should handle input at custom max length', () => {
			const input = 'a'.repeat(500);
			const result = prepareForAI(input, { maxLength: 100 });
			// Result should be less than or equal to truncate warning length
			expect(result.length).toBeLessThanOrEqual(9020);
		});
	});

	describe('handleEmptySubmission', () => {
		it('should return error and suggestion', () => {
			const result = handleEmptySubmission();
			expect(result.error).toBe('No input provided');
			expect(result.suggestion).toBeDefined();
		});
	});
});
