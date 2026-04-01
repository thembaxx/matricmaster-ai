#!/usr/bin/env bun

import { resolve } from 'node:path';
import { config } from 'dotenv';

// Load environment variables explicitly to avoid authentication issues
const envPath = resolve(process.cwd(), '.env.local');
const result = config({ path: envPath });

if (result.error) {
	console.debug('❌ Failed to load .env.local:', result.error);
	process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log('DATABASE_URL available:', !!process.env.DATABASE_URL);
console.log('POSTGRES_URL available:', !!process.env.POSTGRES_URL);

// Import after environment variables are loaded
async function runSeed() {
	const { seedDatabase } = await import('../src/lib/db/seed/index');
	return seedDatabase();
}

async function main() {
	console.log('🚀 Starting Lumni Database Seeding...\n');

	try {
		await runSeed();
		console.log('\n🎉 Seeding completed successfully!');
		process.exit(0);
	} catch (error) {
		console.debug('\n💥 Seeding failed with error:');
		console.debug(error instanceof Error ? error.message : error);
		console.log('\n💡 Troubleshooting tips:');
		console.log('1. Ensure your DATABASE_URL environment variable is set correctly');
		console.log('2. Make sure PostgreSQL is running and accessible');
		console.log('3. Check that your database schema is up to date');
		console.log('4. Verify that your .env.local file exists and contains the correct credentials');
		process.exit(1);
	}
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
	console.debug('❌ Unhandled promise rejection:', error);
	process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
	console.debug('❌ Uncaught exception:', error);
	process.exit(1);
});

// Run the seeding process
main();
