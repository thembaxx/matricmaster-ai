import * as z from 'zod';

export const signUpSchema = z.object({
	name: z.string().min(2, 'name must be at least 2 characters'),
	email: z.string().email('invalid email address'),
	password: z
		.string()
		.min(8, 'password must be at least 8 characters')
		.regex(/[A-Z]/, 'password must contain at least one uppercase letter')
		.regex(/[a-z]/, 'password must contain at least one lowercase letter')
		.regex(/[0-9]/, 'password must contain at least one number'),
});

export type SignUpValues = z.infer<typeof signUpSchema>;
