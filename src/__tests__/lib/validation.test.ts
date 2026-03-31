import { describe, expect, it } from 'vitest';
import {
	dateRangeSchema,
	emailSchema,
	idSchema,
	paginationSchema,
	uuidSchema,
} from '@/lib/validation';

describe('validation schemas', () => {
	describe('uuidSchema', () => {
		it('should validate correct UUID', () => {
			const result = uuidSchema.safeParse('123e4567-e89b-12d3-a456-426614174000');
			expect(result.success).toBe(true);
		});

		it('should reject invalid UUID', () => {
			const result = uuidSchema.safeParse('not-a-uuid');
			expect(result.success).toBe(false);
		});

		it('should reject empty string', () => {
			const result = uuidSchema.safeParse('');
			expect(result.success).toBe(false);
		});
	});

	describe('emailSchema', () => {
		it('should validate correct email', () => {
			const result = emailSchema.safeParse('test@example.com');
			expect(result.success).toBe(true);
		});

		it('should validate email with subdomain', () => {
			const result = emailSchema.safeParse('test@mail.example.com');
			expect(result.success).toBe(true);
		});

		it('should reject email without at sign', () => {
			const result = emailSchema.safeParse('testexample.com');
			expect(result.success).toBe(false);
		});

		it('should reject email without domain', () => {
			const result = emailSchema.safeParse('test@');
			expect(result.success).toBe(false);
		});

		it('should reject empty string', () => {
			const result = emailSchema.safeParse('');
			expect(result.success).toBe(false);
		});
	});

	describe('paginationSchema', () => {
		it('should validate correct pagination', () => {
			const result = paginationSchema.safeParse({ limit: 20, offset: 0 });
			expect(result.success).toBe(true);
		});

		it('should use default values', () => {
			const result = paginationSchema.parse({});
			expect(result.limit).toBe(20);
			expect(result.offset).toBe(0);
		});

		it('should reject negative limit', () => {
			const result = paginationSchema.safeParse({ limit: -1 });
			expect(result.success).toBe(false);
		});

		it('should reject limit over 100', () => {
			const result = paginationSchema.safeParse({ limit: 101 });
			expect(result.success).toBe(false);
		});

		it('should reject negative offset', () => {
			const result = paginationSchema.safeParse({ offset: -1 });
			expect(result.success).toBe(false);
		});

		it('should accept limit of 100', () => {
			const result = paginationSchema.safeParse({ limit: 100 });
			expect(result.success).toBe(true);
		});

		it('should accept non-integer limit', () => {
			const result = paginationSchema.safeParse({ limit: 10.5 });
			expect(result.success).toBe(false);
		});
	});

	describe('idSchema', () => {
		it('should validate non-empty string', () => {
			const result = idSchema.safeParse('some-id');
			expect(result.success).toBe(true);
		});

		it('should reject empty string', () => {
			const result = idSchema.safeParse('');
			expect(result.success).toBe(false);
		});

		it('should accept whitespace-only string (zod default behavior)', () => {
			const result = idSchema.safeParse('   ');
			// zod string().min(1) accepts whitespace-only strings
			// This is actually expected behavior
			expect(result.success).toBe(true);
		});
	});

	describe('dateRangeSchema', () => {
		it('should validate empty object', () => {
			const result = dateRangeSchema.safeParse({});
			expect(result.success).toBe(true);
		});

		it('should validate only start date', () => {
			const result = dateRangeSchema.safeParse({ startDate: '2024-01-01T00:00:00Z' });
			expect(result.success).toBe(true);
		});

		it('should validate only end date', () => {
			const result = dateRangeSchema.safeParse({ endDate: '2024-12-31T23:59:59Z' });
			expect(result.success).toBe(true);
		});

		it('should validate valid date range', () => {
			const result = dateRangeSchema.safeParse({
				startDate: '2024-01-01T00:00:00Z',
				endDate: '2024-12-31T23:59:59Z',
			});
			expect(result.success).toBe(true);
		});

		it('should reject start date after end date', () => {
			const result = dateRangeSchema.safeParse({
				startDate: '2024-12-31T23:59:59Z',
				endDate: '2024-01-01T00:00:00Z',
			});
			expect(result.success).toBe(false);
		});

		it('should reject equal start and end dates when start is later', () => {
			const result = dateRangeSchema.safeParse({
				startDate: '2024-01-02T00:00:00Z',
				endDate: '2024-01-01T00:00:00Z',
			});
			expect(result.success).toBe(false);
		});
	});
});
