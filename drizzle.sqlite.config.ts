import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env.local', debug: true, override: true });

export default defineConfig({
	out: './drizzle-sqlite',
	schema: './src/lib/db/sqlite-schema.ts',
	dialect: 'sqlite',
	dbCredentials: {
		url: process.env.SQLITE_DB_PATH || './data/sqlite.db',
	},
	verbose: true,
	forceConsistentCasing: true,
});
