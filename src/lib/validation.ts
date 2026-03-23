import { z } from 'zod';

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const emailSchema = z.string().email('Invalid email format');

export const paginationSchema = z.object({
	limit: z.number().int().positive().max(100).default(20),
	offset: z.number().int().min(0).default(0),
});

export const idSchema = z.string().min(1, 'ID is required');

export const dateRangeSchema = z
	.object({
		startDate: z.string().datetime().optional(),
		endDate: z.string().datetime().optional(),
	})
	.refine(
		(data) => {
			if (data.startDate && data.endDate) {
				return new Date(data.startDate) <= new Date(data.endDate);
			}
			return true;
		},
		{
			message: 'Start date must be before end date',
		}
	);

export type UuidInput = z.infer<typeof uuidSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
