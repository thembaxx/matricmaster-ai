import { config } from 'dotenv';

config({ path: '.env.local' });

import { pgManager } from '../postgresql-manager';
import { sqliteManager } from '../sqlite-manager';
import { syncEngine } from './engine';

async function main() {
	console.log('🔄 Starting database sync (push + pull)...\n');

	try {
		console.log('📡 Connecting to databases...');

		const pgConnected = await pgManager.waitForConnection(5, 3000);
		if (!pgConnected) {
			console.error('❌ PostgreSQL connection failed');
			process.exit(1);
		}

		await sqliteManager.connect();
		console.log('✅ Both databases connected\n');

		console.log('🔄 Running bidirectional sync...\n');
		const result = await syncEngine.fullSync();

		console.log('\n📊 Sync Results:');
		console.log(`   Tables processed: ${result.tablesProcessed}`);
		console.log(`   Records pushed (local → remote): ${result.recordsPushed}`);
		console.log(`   Records pulled (remote → local): ${result.recordsPulled}`);
		console.log(`   Conflicts: ${result.conflicts}`);
		console.log(`   Duration: ${result.duration}ms`);

		if (result.errors.length > 0) {
			console.warn('\n⚠️ Errors:');
			for (const e of result.errors) {
				console.log(`   - ${e}`);
			}
		}

		console.log('\n✅ Sync complete!');
	} catch (error) {
		console.error('❌ Sync failed:', error);
		process.exit(1);
	} finally {
		await pgManager.disconnect();
		await sqliteManager.disconnect();
	}
}

main();
