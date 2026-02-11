import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous } from 'better-auth/plugins';
import { dbManager } from './db';
import * as schema from './db/schema';

// Better Auth requires a database for storing user sessions and auth data
// We use a placeholder that will be replaced after DB connection
let authInstance: ReturnType<typeof betterAuth> | null = null;

function createAuth() {
	const isConnected = dbManager.isConnectedToDatabase();

	console.log(
		'🔐 Configuring Better Auth with database:',
		isConnected ? 'PostgreSQL' : 'None (fallback mode)'
	);

	return betterAuth({
		// Database adapter for PostgreSQL only
		database: isConnected
			? drizzleAdapter(dbManager.getDb(), {
					provider: 'pg',
					schema,
				})
			: undefined,

		// Core auth configuration
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
		},
		socialProviders: {
			google: {
				clientId: process.env.GOOGLE_CLIENT_ID!,
				clientSecret: process.env.GOOGLE_SECRET_KEY!,
			},
			twitter: {
				clientId: process.env.TWITTER_CLIENT_ID!,
				clientSecret: process.env.TWITTER_CLIENT_SECRET!,
			},
		},
		plugins: [anonymous()],

		// Session configuration
		session: {
			expiresIn: 60 * 60 * 24 * 7, // 7 days
			updateAge: 60 * 60 * 24, // 1 day
		},
	});
}

// Create initial auth instance (may be in fallback mode)
authInstance = createAuth();

// Export the auth instance
export const auth = authInstance;

// Function to reconfigure auth after database connection
export async function reconfigureAuthAfterDbConnection(): Promise<boolean> {
	if (dbManager.isConnectedToDatabase()) {
		console.log('🔄 Reconfiguring Better Auth with database connection...');
		authInstance = createAuth();
		console.log('✅ Better Auth reconfigured with PostgreSQL');
		return true;
	}
	console.log('⚠️ Database not connected, Better Auth remains in fallback mode');
	return false;
}
