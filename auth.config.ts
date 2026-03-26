import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { twoFactor } from 'better-auth/plugins';
import { dbManager } from './src/lib/db';
import * as schema from './src/lib/db/schema';

await dbManager.ensureConnected();

export const auth = betterAuth({
	baseURL:
		process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
	secret: process.env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(dbManager.getDb(), {
		provider: 'pg',
		schema,
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: process.env.NODE_ENV === 'production',
	},
	socialProviders: {
		...(process.env.GOOGLE_CLIENT_ID && (process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET_KEY) ? {
			google: {
				clientId: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_SECRET_KEY ?? '',
			},
		} : {}),
		...(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET ? {
			twitter: {
				clientId: process.env.TWITTER_CLIENT_ID,
				clientSecret: process.env.TWITTER_CLIENT_SECRET,
			},
		} : {}),
		...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET ? {
			facebook: {
				clientId: process.env.FACEBOOK_CLIENT_ID,
				clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
			},
		} : {}),
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
	user: {
		additionalFields: {
			role: {
				type: 'string',
				required: false,
				defaultValue: 'user',
				input: false,
			},
			isBlocked: {
				type: 'boolean',
				required: false,
				defaultValue: false,
				input: false,
			},
			deletedAt: {
				type: 'date',
				required: false,
				input: false,
			},
			twoFactorEnabled: {
				type: 'boolean',
				required: false,
				defaultValue: false,
				input: false,
			},
		},
	},
	trustedOrigins: [
		process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
		process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
	].filter(Boolean),
	rateLimit: {
		enabled: true,
		window: 60,
		max: 10,
	},
	advanced: {
		useSecureCookies: process.env.NODE_ENV === 'production',
		crossSubDomainCookies: {
			enabled: process.env.NODE_ENV === 'production',
		},
	},
	plugins: [
		twoFactor({
			issuer: 'MatricMaster AI',
			totpOptions: {
				digits: 6,
				period: 30,
			},
			backupCodeOptions: {
				amount: 10,
				length: 10,
				storeBackupCodes: 'encrypted',
			},
			twoFactorCookieMaxAge: 600,
			trustDeviceMaxAge: 30 * 24 * 60 * 60,
		}),
	],
});

export default auth;
