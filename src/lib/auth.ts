import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous } from 'better-auth/plugins';
import { db, dbManager } from './db';
import { sqliteDb, sqliteManager } from './db/sqlite';
import * as schema from './db/schema';

// Simple auth configuration that works with current setup
const isPostgreSQL = dbManager.isPostgreSQLAvailable();
const isConnected = dbManager.isConnectedToDatabase();

console.log('🔐 Configuring Better Auth with database:', 
	isConnected ? (isPostgreSQL ? 'PostgreSQL' : 'SQLite') : 'None (fallback mode)');

export const auth = betterAuth({
	// Database adapter based on availability
	database: isConnected 
		? drizzleAdapter(db, {
				provider: isPostgreSQL ? 'pg' : 'sqlite',
				schema,
			})
		: undefined,
	
	// Fallback logger when no database
	logger: isConnected 
		? undefined 
		: {
				info: (...args) => console.log('[Better Auth]', ...args),
				error: (...args) => console.error('[Better Auth]', ...args),
			},
	
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
	
	// Security settings
	advanced: {
		cors: {
			allowedOrigins: [
				'http://localhost:3000',
				'http://localhost:3001',
				'https://your-domain.vercel.app',
			],
		},
	},
});
