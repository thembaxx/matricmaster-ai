#!/usr/bin/env bun

// ============================================================================
// VALIDATE ENRICHMENT - CLI script to validate enriched records in the database
// ============================================================================
// Usage:
//   bun run scripts/validate-enrichment.ts
// ============================================================================

import { resolve } from 'node:path';
import { config } from 'dotenv';
import { dbManagerV2 } from '../src/lib/db/database-manager-v2';
import { syncTableRegistry } from '../src/lib/db/sync/registry';
import { validateRecord } from '../src/lib/enrichment/validator';

// Load environment from .env.local
const envPath = resolve(process.cwd(), '.env.local');
config({ path: envPath });

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

interface ValidationResult {
	totalScanned: number;
	passed: number;
	failed: number;
	quarantined: number;
	errors: string[];
}

async function validateEnrichedRecords(): Promise<ValidationResult> {
	const result: ValidationResult = {
		totalScanned: 0,
		passed: 0,
		failed: 0,
		quarantined: 0,
		errors: [],
	};

	const db = await dbManagerV2.getDbRaw();
	const activeDb = dbManagerV2.getActiveDatabase();

	const getTable = (name: string) => {
		const mapping = syncTableRegistry.find((m: { tableName: string }) => m.tableName === name);
		if (!mapping) throw new Error(`Table mapping not found for: ${name}`);
		return activeDb === 'sqlite' ? mapping.sqliteTable : mapping.pgTable;
	};

	// Query all records with dataSource = 'mock' or 'enriched'
	// We validate across key tables that carry enrichment metadata
	const tablesToValidate = [
		'quiz_results',
		'study_sessions',
		'flashcard_reviews',
		'topic_mastery',
		'user_progress',
	];

	for (const tableName of tablesToValidate) {
		let table: any;
		try {
			table = getTable(tableName);
		} catch {
			result.errors.push(`Table ${tableName} not found, skipping`);
			continue;
		}

		// Fetch enriched records
		let records: any[] = [];
		try {
			const { sql } = await import('drizzle-orm');
			records = await db.select().from(table).where(sql`data_source IN ('mock', 'enriched')`);
		} catch {
			// Table may not have dataSource column; skip gracefully
			continue;
		}

		result.totalScanned += records.length;

		for (const record of records) {
			const validation = validateRecord(record as any);

			if (validation.valid) {
				result.passed++;
			} else {
				result.failed++;
				for (const error of validation.errors.slice(0, 3)) {
					result.errors.push(`${tableName}: ${error}`);
				}
			}

			// Check if record is quarantined
			if (record.quarantined === true || record.quarantineReason) {
				result.quarantined++;
			}
		}
	}

	return result;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
	console.log('========================================');
	console.log('  Enrichment Validation');
	console.log('========================================\n');

	// Initialize database
	console.log('[1/2] Initializing database...');
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

	// Run validation
	console.log('\n[2/2] Scanning and validating enriched records...');
	try {
		const results = await validateEnrichedRecords();

		console.log('\n========================================');
		console.log('  Validation Results');
		console.log('========================================');
		console.log(`  Total scanned:    ${results.totalScanned}`);
		console.log(`  Passed:           ${results.passed}`);
		console.log(`  Failed:           ${results.failed}`);
		console.log(`  Quarantined:      ${results.quarantined}`);

		if (results.errors.length > 0) {
			console.log(`\n  Sample errors (first ${Math.min(10, results.errors.length)}):`);
			for (const error of results.errors.slice(0, 10)) {
				console.log(`    - ${error}`);
			}
			if (results.errors.length > 10) {
				console.log(`    ... and ${results.errors.length - 10} more`);
			}
		}

		console.log('========================================');

		const passRate =
			results.totalScanned > 0 ? ((results.passed / results.totalScanned) * 100).toFixed(1) : '0.0';
		console.log(`  Pass rate: ${passRate}%`);

		if (results.failed > 0) {
			console.log('\n  STATUS: FAIL');
			process.exit(1);
		} else {
			console.log('\n  STATUS: PASS');
			process.exit(0);
		}
	} catch (err) {
		console.error('\nERROR: Validation failed:', err);
		process.exit(1);
	}
}

main().catch((err) => {
	console.error('Unhandled error:', err);
	process.exit(1);
});
