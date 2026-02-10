import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous } from 'better-auth/plugins';
import { db, dbManager } from './db';
import * as schema from './db/schema';

// Simple auth configuration that works with PostgreSQL
const isConnected = dbManager.isConnectedToDatabase();

console.log(
	'🔐 Configuring Better Auth with database:',
	isConnected ? 'PostgreSQL' : 'None (fallback mode)'
);

export const auth = betterAuth({
	// Database adapter for PostgreSQL only
	database: isConnected
		? drizzleAdapter(db, {
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
