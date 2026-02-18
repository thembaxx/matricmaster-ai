import { z } from 'zod';

const envSchema = z.object({
	DATABASE_URL: z.string().url().optional(),
	NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
	BETTER_AUTH_SECRET: z.string().min(32).optional(),
	GOOGLE_CLIENT_ID: z.string().optional(),
	GOOGLE_SECRET_KEY: z.string().optional(),
	TWITTER_CLIENT_ID: z.string().optional(),
	TWITTER_CLIENT_SECRET: z.string().optional(),
	GEMINI_API_KEY: z.string().optional(),
	RESEND_API_KEY: z.string().optional(),
	FROM_EMAIL: z.string().email().optional(),
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

export function validateEnv(): Env {
	if (validatedEnv) return validatedEnv;

	const result = envSchema.safeParse(process.env);

	if (!result.success) {
		console.error('❌ Invalid environment variables:');
		result.error.issues.forEach((issue) => {
			console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
		});

		if (process.env.NODE_ENV === 'production') {
			throw new Error('Invalid environment variables');
		}

		console.warn('⚠️ Using default values for missing environment variables in development');
		validatedEnv = envSchema.parse({
			...process.env,
			NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
			NODE_ENV: process.env.NODE_ENV || 'development',
		});
		return validatedEnv;
	}

	validatedEnv = result.data;
	return validatedEnv;
}

export function requireEnv(key: keyof Env): string {
	const env = validateEnv();
	const value = env[key];

	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}

	return value;
}

export function getEnv(key: keyof Env): string | undefined {
	const env = validateEnv();
	return env[key];
}
