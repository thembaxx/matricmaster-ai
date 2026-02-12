import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous } from 'better-auth/plugins';
import { dbManager } from './db';
import * as schema from './db/schema';

let authInstance: ReturnType<typeof betterAuth> | null = null;

function createAuth() {
	const isConnected = dbManager.isConnectedToDatabase();
	let db = null;

	if (isConnected) {
		try {
			db = dbManager.getDb();
		} catch {
			console.warn('⚠️ Failed to get database connection - Better Auth will not persist sessions');
		}
	} else {
		console.warn('⚠️ Database not connected - Better Auth will not persist sessions');
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
		socialProviders: {
			google: {
				clientId: process.env.GOOGLE_CLIENT_ID ?? '',
				clientSecret: process.env.GOOGLE_SECRET_KEY ?? '',
			},
			twitter: {
				clientId: process.env.TWITTER_CLIENT_ID ?? '',
				clientSecret: process.env.TWITTER_CLIENT_SECRET ?? '',
			},
		},
		plugins: [anonymous()],
		session: {
			expiresIn: 60 * 60 * 24 * 7,
			updateAge: 60 * 60 * 24,
		},
		trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'],
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
