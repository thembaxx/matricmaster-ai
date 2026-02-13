import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: ".env.local", debug: true, override: true });

export default defineConfig({
	// strict: true,
	out: './drizzle',
	schema: './src/lib/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
	casing: 'snake_case',
});
