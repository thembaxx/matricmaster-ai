import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';

import { dbManager } from './db';
import * as schema from './db/schema';

let authInstance: ReturnType<typeof betterAuth> | null = null;

// Check if we're in a build phase where database is not expected to be available
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

function createAuth() {
	const isConnected = dbManager.isConnectedToDatabase();
	let db = null;

	if (isConnected) {
		try {
			db = dbManager.getDb();
		} catch {
			if (!isBuildTime) {
				console.warn('⚠️ Failed to get database connection - Better Auth will not persist sessions');
			}
		}
	} else {
		if (!isBuildTime) {
			console.warn('⚠️ Database not connected - Better Auth will not persist sessions');
		}
	}

	// Validate Twitter OAuth credentials
	const twitterClientId = process.env.TWITTER_CLIENT_ID;
	const twitterClientSecret = process.env.TWITTER_CLIENT_SECRET;

	if (!twitterClientId || !twitterClientSecret) {
		if (!isBuildTime) {
			console.warn(
				'⚠️ Twitter OAuth credentials are not configured. Sign in with Twitter will not be available.'
			);
		}
	}

	const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID ?? '',
			clientSecret: process.env.GOOGLE_SECRET_KEY ?? '',
		},
	};

	// Only add Twitter provider if credentials are available
	if (twitterClientId && twitterClientSecret) {
		socialProviders.twitter = {
			clientId: twitterClientId,
			clientSecret: twitterClientSecret,
		};
	}

	return betterAuth({
		baseURL:
			process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
		secret: process.env.BETTER_AUTH_SECRET,
		database: db
			? drizzleAdapter(db, {
				provider: 'pg',
				schema,
			})
			: undefined,
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
		},
		socialProviders,
		session: {
			expiresIn: 60 * 60 * 24 * 7,
			updateAge: 60 * 60 * 24,
			cookieCache: {
				enabled: true,
				maxAge: 5 * 60,
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
			ipAddress: {
				ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
			},
		},
		databaseHooks: {
			user: {
				create: {
					after: async (user) => {
						console.log(`✅ New user created: ${user.id} (${user.email})`);
					},
				},
				update: {
					before: async (user) => {
						// Check if user is blocked during any update (including sign-in)
						if (user.isBlocked) {
							throw new Error(
								'Your account has been blocked. Please contact support for assistance.'
							);
						}
						return { data: user };
					},
				},
			},
		},
		plugins: [nextCookies()],
	});
}

export async function initAuth(): Promise<ReturnType<typeof betterAuth>> {
	await dbManager.waitForConnection(5, 3000);

	if (!authInstance) {
		authInstance = createAuth();
	}

	return authInstance;
}

export function getAuth(): ReturnType<typeof betterAuth> {
	if (!authInstance) {
		authInstance = createAuth();
	}
	return authInstance;
}

try {
	if (dbManager.isConnectedToDatabase()) {
		authInstance = createAuth();
	}
} catch {
	console.warn('⚠️ Could not initialize auth at startup - will initialize on first request');
}

export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
	get(_target, prop) {
		const currentAuth = getAuth();
		return Reflect.get(currentAuth, prop, currentAuth);
	},
});

export type Auth = ReturnType<typeof betterAuth>;
export type AuthSession = Auth['$Infer']['Session'];
export type AuthUser = Auth['$Infer']['Session']['user'];
