import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env.local' });

export default defineConfig({
	strict: true,
	out: './drizzle-sqlite',
	schema: './src/lib/db/schema.ts',
	dialect: 'sqlite',
	dbCredentials: {
		url: './database.db',
	},
	casing: 'snake_case',
});