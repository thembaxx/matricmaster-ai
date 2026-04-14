#!/usr/bin/env bun

// ============================================================================
// GENERATE MOCK DATA - CLI script to generate and insert mock data
// ============================================================================
// Usage:
//   bun run scripts/generate-mock-data.ts
//   bun run scripts/generate-mock-data.ts --seed=42 --users=100 --months=6 --intensity=high
//   bun run scripts/generate-mock-data.ts --dry-run
//   bun run scripts/generate-mock-data.ts --export=./mock-data/output.json
// ============================================================================

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { dbManagerV2 } from '../src/lib/db/database-manager-v2';
import { syncTableRegistry } from '../src/lib/db/sync/registry';
import { MockDataGeneratorV2 } from '../src/lib/mock-data/generator-v2';

// Load environment from .env.local
const envPath = resolve(process.cwd(), '.env.local');
config({ path: envPath });

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

interface CLIOptions {
	seed: number;
	users: number;
	months: number;
	intensity: 'low' | 'medium' | 'high';
	exportPath?: string;
	dryRun: boolean;
}

function parseArgs(): CLIOptions {
	const args = process.argv.slice(2);
	const options: CLIOptions = {
		seed: 42,
		users: 100,
		months: 6,
		intensity: 'high',
		dryRun: false,
	};

	for (const arg of args) {
		if (arg.startsWith('--seed=')) {
			options.seed = Number.parseInt(arg.split('=')[1], 10);
		} else if (arg.startsWith('--users=')) {
			options.users = Number.parseInt(arg.split('=')[1], 10);
		} else if (arg.startsWith('--months=')) {
			options.months = Number.parseInt(arg.split('=')[1], 10);
		} else if (arg.startsWith('--intensity=')) {
			const val = arg.split('=')[1] as 'low' | 'medium' | 'high';
			if (['low', 'medium', 'high'].includes(val)) {
				options.intensity = val;
			}
		} else if (arg.startsWith('--export=')) {
			options.exportPath = arg.split('=')[1];
		} else if (arg === '--dry-run') {
			options.dryRun = true;
		} else if (arg === '--help' || arg === '-h') {
			printHelp();
			process.exit(0);
		}
	}

	return options;
}

function printHelp(): void {
	console.log(`
Usage: bun run scripts/generate-mock-data.ts [options]

Options:
  --seed=<n>              Random seed for reproducibility (default: 42)
  --users=<n>             Number of users to generate (default: 100)
  --months=<n>            Months of activity to generate (default: 6)
  --intensity=<level>     Activity intensity: low, medium, high (default: high)
  --export=<path>         Export generated data as JSON to this path
  --dry-run               Generate data without inserting into database
  --help, -h              Show this help message

Examples:
  bun run scripts/generate-mock-data.ts
  bun run scripts/generate-mock-data.ts --seed=123 --users=50 --months=3 --intensity=medium
  bun run scripts/generate-mock-data.ts --dry-run --export=./output/mock-data.json
`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
	const options = parseArgs();

	console.log('========================================');
	console.log('  Mock Data Generator');
	console.log('========================================\n');

	console.log('Configuration:');
	console.log(`  Seed:      ${options.seed}`);
	console.log(`  Users:     ${options.users}`);
	console.log(`  Months:    ${options.months}`);
	console.log(`  Intensity: ${options.intensity}`);
	console.log(`  Dry run:   ${options.dryRun}`);
	if (options.exportPath) {
		console.log(`  Export:    ${options.exportPath}`);
	}
	console.log('');

	// Initialize generator
	console.log('[1/4] Initializing mock data generator...');
	const generator = new MockDataGeneratorV2(undefined, {
		seed: options.seed,
		userCount: options.users,
		monthsBack: options.months * 30,
		intensity: options.intensity,
	});

	// Generate data
	console.log('\n[2/4] Generating mock data...');
	const generated = generator.generateAllWithFlag();

	const stats = {
		users: generated.users.length,
		quizResults: generated.quizResults?.length ?? 0,
		studySessions: generated.studySessions?.length ?? 0,
		flashcardDecks: generated.flashcardDecks?.length ?? 0,
		flashcardReviews: generated.flashcardReviews?.length ?? 0,
		achievements: generated.achievements?.length ?? 0,
		topicMasteries: generated.topicMasteries?.length ?? 0,
	};

	console.log('  Generated:');
	console.log(`    Users:            ${stats.users}`);
	console.log(`    Quiz results:     ${stats.quizResults}`);
	console.log(`    Study sessions:   ${stats.studySessions}`);
	console.log(`    Flashcard decks:  ${stats.flashcardDecks}`);
	console.log(`    Flashcard reviews:${stats.flashcardReviews}`);
	console.log(`    Achievements:     ${stats.achievements}`);
	console.log(`    Topic masteries:  ${stats.topicMasteries}`);

	// Export if requested
	if (options.exportPath) {
		console.log(`\n[3/4] Exporting data to ${options.exportPath}...`);
		const exportData = {
			config: {
				seed: options.seed,
				users: options.users,
				months: options.months,
				intensity: options.intensity,
			},
			generatedAt: new Date().toISOString(),
			data: generated,
		};

		const dir = options.exportPath.substring(0, options.exportPath.lastIndexOf('/'));
		if (dir && !existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}

		writeFileSync(options.exportPath, JSON.stringify(exportData, null, 2));
		console.log(`  Exported ${Object.keys(exportData.data).length} collections`);
	}

	// Skip DB insertion if dry run
	if (options.dryRun) {
		console.log('\n[Dry run] Skipping database insertion.');
		console.log('========================================');
		console.log('  Generation complete (dry run)');
		console.log('========================================');
		return;
	}

	// Initialize database
	console.log(`\n${options.exportPath ? '[4/4]' : '[3/4]'} Initializing database...`);
	try {
		await dbManagerV2.initialize();
		const connected = await dbManagerV2.ensureConnected();
		if (!connected) {
			console.error('ERROR: Could not connect to database.');
			console.error('Check DATABASE_URL in .env.local');
			process.exit(1);
		}
		console.log(`  Connected to: ${dbManagerV2.getActiveDatabase()}`);
	} catch (err) {
		console.error('ERROR: Database initialization failed:', err);
		process.exit(1);
	}

	// Insert data
	console.log('\nInserting data into database...');
	const db = (await dbManagerV2.getDbRaw()) as any;
	const BATCH_SIZE = 1000;

	const getTable = (name: string) => {
		const mapping = syncTableRegistry.find((m: { tableName: string }) => m.tableName === name);
		if (!mapping) throw new Error(`Table mapping not found for: ${name}`);
		const activeDb = dbManagerV2.getActiveDatabase();
		return activeDb === 'sqlite' ? mapping.sqliteTable : mapping.pgTable;
	};

	async function insertInBatches(table: any, data: any[], tableName: string): Promise<number> {
		if (!data || data.length === 0) {
			console.log(`    ${tableName}: 0 records (skipped)`);
			return 0;
		}
		const total = data.length;
		let inserted = 0;
		for (let i = 0; i < total; i += BATCH_SIZE) {
			const batch = data.slice(i, i + BATCH_SIZE);
			await db.insert(table).values(batch).onConflictDoNothing();
			inserted += batch.length;
			console.log(`    ${tableName}: ${inserted}/${total}`);
		}
		return inserted;
	}

	let totalInserted = 0;

	try {
		const usersTable = getTable('users');
		console.log('  Inserting users...');
		totalInserted += await insertInBatches(usersTable, generated.users, 'users');

		const quizResultsTable = getTable('quiz_results');
		if (generated.quizResults?.length) {
			console.log('  Inserting quiz results...');
			totalInserted += await insertInBatches(
				quizResultsTable,
				generated.quizResults,
				'quizResults'
			);
		}

		const studySessionsTable = getTable('study_sessions');
		if (generated.studySessions?.length) {
			console.log('  Inserting study sessions...');
			totalInserted += await insertInBatches(
				studySessionsTable,
				generated.studySessions,
				'studySessions'
			);
		}

		const flashcardDecksTable = getTable('flashcard_decks');
		if (generated.flashcardDecks?.length) {
			console.log('  Inserting flashcard decks...');
			totalInserted += await insertInBatches(
				flashcardDecksTable,
				generated.flashcardDecks,
				'flashcardDecks'
			);
		}

		const flashcardReviewsTable = getTable('flashcard_reviews');
		if (generated.flashcardReviews?.length) {
			console.log('  Inserting flashcard reviews...');
			totalInserted += await insertInBatches(
				flashcardReviewsTable,
				generated.flashcardReviews,
				'flashcardReviews'
			);
		}

		const topicMasteryTable = getTable('topic_mastery');
		if (generated.topicMasteries?.length) {
			console.log('  Inserting topic masteries...');
			totalInserted += await insertInBatches(
				topicMasteryTable,
				generated.topicMasteries,
				'topicMasteries'
			);
		}

		const userAchievementsTable = getTable('user_achievements');
		if (generated.achievements?.length) {
			console.log('  Inserting achievements...');
			totalInserted += await insertInBatches(
				userAchievementsTable,
				generated.achievements,
				'achievements'
			);
		}
	} catch (err) {
		console.error('\nERROR: Database insertion failed:', err);
		process.exit(1);
	}

	// Summary
	console.log('\n========================================');
	console.log('  Results Summary');
	console.log('========================================');
	console.log(`  Total records inserted: ${totalInserted.toLocaleString()}`);
	console.log('========================================');
}

main().catch((err) => {
	console.error('Unhandled error:', err);
	process.exit(1);
});
