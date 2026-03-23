import {
	bigint,
	boolean,
	integer,
	numeric,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { integer as sqliteInteger, sqliteTable, text as sqliteText } from 'drizzle-orm/sqlite-core';

export interface ColumnDefinition {
	name: string;
	type: 'uuid' | 'text' | 'integer' | 'boolean' | 'timestamp' | 'varchar' | 'bigint' | 'numeric';
	primaryKey?: boolean;
	notNull?: boolean;
	default?: any;
	length?: number;
}

export function createUnifiedTable(tableName: string, columns: Record<string, ColumnDefinition>) {
	// PostgreSQL Table
	const pgCols: any = {};
	for (const [key, col] of Object.entries(columns)) {
		let pgCol: any;
		switch (col.type) {
			case 'uuid':
				pgCol = uuid(col.name);
				break;
			case 'text':
				pgCol = text(col.name);
				break;
			case 'integer':
				pgCol = integer(col.name);
				break;
			case 'boolean':
				pgCol = boolean(col.name);
				break;
			case 'timestamp':
				pgCol = timestamp(col.name);
				break;
			case 'varchar':
				pgCol = varchar(col.name, { length: col.length || 255 });
				break;
			case 'bigint':
				pgCol = bigint(col.name, { mode: 'number' });
				break;
			case 'numeric':
				pgCol = numeric(col.name);
				break;
			default:
				pgCol = text(col.name);
		}

		if (col.primaryKey) pgCol = pgCol.primaryKey();
		if (col.notNull) pgCol = pgCol.notNull();
		if (col.default !== undefined) pgCol = pgCol.default(col.default);

		pgCols[key] = pgCol;
	}
	const pg = pgTable(tableName, pgCols);

	// SQLite Table with Sync Columns
	const sqliteCols: any = {};
	for (const [key, col] of Object.entries(columns)) {
		let sqliteCol: any;
		switch (col.type) {
			case 'integer':
			case 'boolean':
			case 'bigint':
				sqliteCol = sqliteInteger(col.name);
				break;
			default:
				sqliteCol = sqliteText(col.name);
		}

		if (col.primaryKey) sqliteCol = sqliteCol.primaryKey();
		if (col.notNull) sqliteCol = sqliteCol.notNull();
		// SQLite defaults are handled carefully in sync

		sqliteCols[key] = sqliteCol;
	}

	// Add Sync Metadata Columns
	sqliteCols.syncVersion = sqliteInteger('sync_version').notNull().default(1);
	sqliteCols.lastModifiedAt = sqliteText('last_modified_at').notNull();
	sqliteCols.localUpdatedAt = sqliteText('local_updated_at').notNull();
	sqliteCols.syncStatus = sqliteText('sync_status').notNull().default('synced');

	const sqlite = sqliteTable(tableName, sqliteCols);

	return { pg, sqlite };
}
