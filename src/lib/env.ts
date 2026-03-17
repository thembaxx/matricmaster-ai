import { z } from 'zod';

// const envSchema = z.object({
// 	DATABASE_URL: z.string().url().optional(),
// 	NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
// 	BETTER_AUTH_SECRET: z.string().min(32).optional(),
// 	GOOGLE_CLIENT_ID: z.string().optional(),
// 	GOOGLE_SECRET_KEY: z.string().optional(),
// 	TWITTER_CLIENT_ID: z.string().optional(),
// 	TWITTER_CLIENT_SECRET: z.string().optional(),
// 	GEMINI_API_KEY: z.string().optional(),
// 	RESEND_API_KEY: z.string().optional(),
// 	FROM_EMAIL: z.string().email().optional(),
// 	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
// });

// Build schema based on environment - require critical vars in production
const getEnvSchema = () => {
	const isProduction = process.env.NODE_ENV === 'production';

	const baseSchema = {
		DATABASE_URL: isProduction ? z.url('DATABASE_URL must be a valid URL') : z.url().optional(),
		NEXT_PUBLIC_APP_URL: z.url().default('http://localhost:3000'),
		BETTER_AUTH_SECRET: isProduction
			? z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters in production')
			: z.string().min(32).optional(),
		GOOGLE_CLIENT_ID: z.string().optional(),
		GOOGLE_SECRET_KEY: z.string().optional(),
		TWITTER_CLIENT_ID: z.string().optional(),
		TWITTER_CLIENT_SECRET: z.string().optional(),
		GEMINI_API_KEY: z.string().optional(),
		RESEND_API_KEY: z.string().optional(),
		POSTHOG_API_KEY: z.string().optional(),
		POSTHOG_PROJECT_ID: z.string().optional(),
		NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
		PAYSTACK_PUBLIC_KEY: z.string().optional(),
		PAYSTACK_SECRET_KEY: z.string().optional(),
		DAILY_API_KEY: z.string().optional(),
		DAILY_DOMAIN: z.string().optional(),
		NEXT_PUBLIC_VAPID_KEY: z.string().optional(),
		VAPID_PRIVATE_KEY: z.string().optional(),
		ABLY_API_KEY: z.string().optional(),
		NEXT_PUBLIC_ABLY_KEY: z.string().optional(),
		FROM_EMAIL: z.email().optional(),
		NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	};

	return z.object(baseSchema);
};

export type Env = z.infer<ReturnType<typeof getEnvSchema>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any

let validatedEnv: any = null;

export function validateEnv(): Env {
	if (validatedEnv) return validatedEnv as Env;

	const schema = getEnvSchema();
	const result = schema.safeParse(process.env);

	if (!result.success) {
		console.debug('❌ Invalid environment variables:');
		result.error.issues.forEach((issue) => {
			console.debug(`  - ${issue.path.join('.')}: ${issue.message}`);
		});

		// if (process.env.NODE_ENV === 'production') {
		// 	throw new Error('Invalid environment variables');
		// }

		console.warn('⚠️ Using default values for missing environment variables in development');
		// In development, use fallback schema that makes everything optional
		const devSchema = z.object({
			DATABASE_URL: z.string().url().optional(),
			NEXT_PUBLIC_APP_URL: z.url().default('http://localhost:3000'),
			BETTER_AUTH_SECRET: z.string().min(32).optional(),
			GOOGLE_CLIENT_ID: z.string().optional(),
			GOOGLE_SECRET_KEY: z.string().optional(),
			TWITTER_CLIENT_ID: z.string().optional(),
			TWITTER_CLIENT_SECRET: z.string().optional(),
			GEMINI_API_KEY: z.string().optional(),
			RESEND_API_KEY: z.string().optional(),
			POSTHOG_API_KEY: z.string().optional(),
			POSTHOG_PROJECT_ID: z.string().optional(),
			NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
			PAYSTACK_PUBLIC_KEY: z.string().optional(),
			PAYSTACK_SECRET_KEY: z.string().optional(),
			DAILY_API_KEY: z.string().optional(),
			DAILY_DOMAIN: z.string().optional(),
			NEXT_PUBLIC_VAPID_KEY: z.string().optional(),
			VAPID_PRIVATE_KEY: z.string().optional(),
			ABLY_API_KEY: z.string().optional(),
			NEXT_PUBLIC_ABLY_KEY: z.string().optional(),
			FROM_EMAIL: z.email().optional(),
			NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
		});
		validatedEnv = devSchema.parse({
			...process.env,
			NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
			NODE_ENV: process.env.NODE_ENV || 'development',
		});
		return validatedEnv as Env;
	}

	validatedEnv = result.data;
	return validatedEnv as Env;
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
