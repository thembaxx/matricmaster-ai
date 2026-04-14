#!/usr/bin/env bun

// ============================================================================
// RUN ENRICHMENT - CLI script to run the enrichment pipeline
// ============================================================================
// Usage:
//   bun run scripts/run-enrichment.ts --all
//   bun run scripts/run-enrichment.ts --source=<id>
// ============================================================================

import { resolve } from 'node:path';
import { config } from 'dotenv';
import { dbManagerV2 } from '../src/lib/db/database-manager-v2';
import { defaultEnrichmentConfig } from '../src/lib/enrichment/default-config';
import type { PipelineResult } from '../src/lib/enrichment/pipeline';
import { createEnrichmentPipeline } from '../src/lib/enrichment/pipeline';

// Load environment from .env.local
const envPath = resolve(process.cwd(), '.env.local');
config({ path: envPath });

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

interface CLIOptions {
	mode: 'all' | 'single';
	sourceId?: string;
}

function parseArgs(): CLIOptions {
	const args = process.argv.slice(2);
	const options: CLIOptions = { mode: 'all' };

	for (const arg of args) {
		if (arg === '--all') {
			options.mode = 'all';
		} else if (arg.startsWith('--source=')) {
			options.mode = 'single';
			options.sourceId = arg.split('=')[1];
		} else if (arg === '--help' || arg === '-h') {
			printHelp();
			process.exit(0);
		}
	}

	return options;
}

function printHelp(): void {
	console.log(`
Usage: bun run scripts/run-enrichment.ts [options]

Options:
  --all              Run enrichment for all registered sources
  --source=<id>      Run enrichment for a specific source only
  --help, -h         Show this help message

Examples:
  bun run scripts/run-enrichment.ts --all
  bun run scripts/run-enrichment.ts --source=dbe-past-papers
`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
	const options = parseArgs();

	console.log('========================================');
	console.log('  Enrichment Pipeline Runner');
	console.log('========================================\n');

	// Initialize database
	console.log('[1/3] Initializing database...');
	try {
		await dbManagerV2.initialize();
		const connected = await dbManagerV2.ensureConnected();
		if (!connected) {
			console.error('ERROR: Could not connect to database.');
			console.error('Check DATABASE_URL in .env.local');
			process.exit(1);
		}
		const activeDb = dbManagerV2.getActiveDatabase();
		console.log(`  Connected to: ${activeDb}`);
	} catch (err) {
		console.error('ERROR: Database initialization failed:', err);
		process.exit(1);
	}

	// Run pipeline
	console.log('\n[2/3] Running enrichment pipeline...');
	const pipeline = createEnrichmentPipeline(defaultEnrichmentConfig);

	try {
		let results: PipelineResult[];
		if (options.mode === 'single' && options.sourceId) {
			console.log(`  Source: ${options.sourceId}`);
			results = [await pipeline.runSource(options.sourceId)];
		} else {
			console.log('  Mode: all sources');
			results = await pipeline.runAll();
		}

		// Print results summary
		console.log('\n[3/3] Results Summary');
		console.log('----------------------------------------');

		let totalSuccess = 0;
		let totalFailed = 0;
		let totalRecords = 0;
		let totalQuarantined = 0;

		for (const result of results) {
			const status = result.success ? 'PASS' : 'FAIL';
			const icon = result.success ? '[+]' : '[x]';
			console.log(`  ${icon} ${result.sourceId}: ${status}`);

			if (result.success) {
				totalSuccess++;
				totalRecords += result.recordsProcessed ?? 0;
				totalQuarantined += result.quarantined ?? 0;
			} else {
				totalFailed++;
			}

			if (result.errors && result.errors.length > 0) {
				for (const error of result.errors) {
					console.log(`      Error: ${error}`);
				}
			}
		}

		console.log('----------------------------------------');
		console.log(`  Sources succeeded: ${totalSuccess}`);
		console.log(`  Sources failed:    ${totalFailed}`);
		console.log(`  Records processed: ${totalRecords}`);
		console.log(`  Records quarantined: ${totalQuarantined}`);
		console.log('========================================');

		if (totalFailed > 0) {
			process.exit(1);
		}
	} catch (err) {
		console.error('\nERROR: Pipeline execution failed:', err);
		process.exit(1);
	}
}

main().catch((err) => {
	console.error('Unhandled error:', err);
	process.exit(1);
});
