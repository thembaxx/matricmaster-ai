import { sql } from 'drizzle-orm';
import { dbManagerV2 } from '../database-manager-v2';
import { enrichmentTargetTables } from '../schema-enrichment';

// ============================================================================
// ENRICHMENT COLUMNS MIGRATION
// ============================================================================

/**
 * Migration script that adds enrichment columns to existing tables.
 * Handles both "column exists" and "column doesn't exist" cases gracefully.
 *
 * Columns added:
 * - data_source: varchar(20) NOT NULL DEFAULT 'real'
 * - enriched_at: timestamp NULL
 * - data_quality: varchar(10) NOT NULL DEFAULT 'high'
 */

interface ColumnDefinition {
	name: string;
	definition: string;
}

const columnsToAdd: ColumnDefinition[] = [
	{
		name: 'data_source',
		definition: "varchar(20) NOT NULL DEFAULT 'real'",
	},
	{
		name: 'enriched_at',
		definition: 'timestamp',
	},
	{
		name: 'data_quality',
		definition: "varchar(10) NOT NULL DEFAULT 'high'",
	},
];

/**
 * Check if a column exists in a table.
 */
async function columnExists(tableName: string, columnName: string): Promise<boolean> {
	await dbManagerV2.initialize();
	const db = await dbManagerV2.getSmartDb();

	const result = await db.execute(sql`
		SELECT EXISTS (
			SELECT 1
			FROM information_schema.columns
			WHERE table_name = ${tableName}
			AND column_name = ${columnName}
		)
	`);

	// Handle both node-postgres and other driver result formats
	const row = (result as any).rows?.[0] ?? (result as any)[0];
	return row?.exists === true || row?.exists === 't' || row?.exists === '1';
}

/**
 * Add a column to a table if it doesn't already exist.
 */
async function addColumnIfNotExists(
	tableName: string,
	column: ColumnDefinition
): Promise<{ added: boolean; error?: string }> {
	try {
		const exists = await columnExists(tableName, column.name);

		if (exists) {
			return { added: false };
		}

		await dbManagerV2.initialize();
		const db = await dbManagerV2.getSmartDb();
		await db.execute(
			sql.raw(`ALTER TABLE ${tableName} ADD COLUMN ${column.name} ${column.definition}`)
		);

		return { added: true };
	} catch (err) {
		const error = err instanceof Error ? err.message : String(err);
		// Ignore "column already exists" errors (race condition safety)
		if (error.includes('already exists') || error.includes('duplicate column')) {
			return { added: false };
		}
		return { added: false, error };
	}
}

/**
 * Main migration function.
 */
export async function runEnrichmentColumnsMigration(): Promise<{
	success: boolean;
	results: Record<string, { added: string[]; skipped: string[]; errors: string[] }>;
}> {
	const results: Record<string, { added: string[]; skipped: string[]; errors: string[] }> = {};
	let overallSuccess = true;

	for (const tableName of enrichmentTargetTables) {
		const tableResult: { added: string[]; skipped: string[]; errors: string[] } = {
			added: [],
			skipped: [],
			errors: [],
		};

		for (const column of columnsToAdd) {
			const outcome = await addColumnIfNotExists(tableName, column);

			if (outcome.error) {
				tableResult.errors.push(`${column.name}: ${outcome.error}`);
				overallSuccess = false;
			} else if (outcome.added) {
				tableResult.added.push(column.name);
			} else {
				tableResult.skipped.push(column.name);
			}
		}

		results[tableName] = tableResult;
	}

	return {
		success: overallSuccess,
		results,
	};
}

/**
 * Run migration if this file is executed directly.
 */
if (require.main === module) {
	runEnrichmentColumnsMigration()
		.then((result) => {
			console.log('Enrichment columns migration completed:');
			console.log(JSON.stringify(result, null, 2));

			// Summary
			let totalAdded = 0;
			let totalSkipped = 0;
			let totalErrors = 0;

			for (const tableResult of Object.values(result.results)) {
				totalAdded += tableResult.added.length;
				totalSkipped += tableResult.skipped.length;
				totalErrors += tableResult.errors.length;
			}

			console.log(
				`\nSummary: ${totalAdded} columns added, ${totalSkipped} already existed, ${totalErrors} errors`
			);

			if (totalErrors > 0) {
				console.error('\nErrors:');
				for (const [tableName, tableResult] of Object.entries(result.results)) {
					for (const error of tableResult.errors) {
						console.error(`  - ${tableName}: ${error}`);
					}
				}
				process.exit(1);
			}
		})
		.catch((err) => {
			console.error('Migration failed:', err);
			process.exit(1);
		});
}
