import { config } from 'dotenv';

config({ path: '.env.local' });

import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { closeConnection, type DbType, dbManager } from './index';
import { sqliteManager } from './sqlite-manager';
import { syncEngine } from './sync/engine';

async function runMigrations() {
	console.log('Running migrations...');

	try {
		const isConnected = await dbManager.waitForConnection(5, 3000);

		if (!isConnected) {
			console.debug('❌ Could not establish database connection after retries');
			console.log('💡 Please check your DATABASE_URL environment variable');
			console.log('💡 Ensure your database is accessible and credentials are correct');
			process.exit(1);
		}

		const db = dbManager.getDb() as unknown as DbType;
		await migrate(db, { migrationsFolder: './drizzle' });
		console.log('✅ Migrations complete!');

		console.log('🔄 Syncing to local SQLite database...');

		await sqliteManager.connect();

		console.log('🔄 Running bidirectional sync...');
		const syncResult = await syncEngine.fullSync();

		console.log('\n📊 Sync Results:');
		console.log(`   Tables processed: ${syncResult.tablesProcessed}`);
		console.log(`   Records pushed (local → remote): ${syncResult.recordsPushed}`);
		console.log(`   Records pulled (remote → local): ${syncResult.recordsPulled}`);
		console.log(`   Duration: ${syncResult.duration}ms`);

		if (syncResult.errors.length > 0) {
			console.warn('\n⚠️ Sync warnings:');
			for (const e of syncResult.errors) {
				console.log(`   - ${e}`);
			}
		}

		console.log('\n✅ Migration and sync complete!');
	} catch (error) {
		console.debug('❌ Migration/sync failed:', error);
		const dbError = error as { code?: string };
		if (dbError.code === 'ETIMEDOUT') {
			console.log('💡 Database connection timed out. Please check:');
			console.log('   - Network connectivity to your database');
			console.log('   - Database server status');
			console.log('   - Firewall settings');
		} else if (dbError.code === '28P01') {
			console.log('💡 Authentication failed. Please check your database credentials');
		}
		process.exit(1);
	} finally {
		await closeConnection();
		process.exit(0);
	}
}

process.on('SIGINT', async () => {
	console.log('\n🛑 Migration interrupted');
	await closeConnection();
	process.exit(1);
});

runMigrations();
