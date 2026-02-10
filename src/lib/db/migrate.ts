import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { closeConnection, db, dbManager } from './index';

async function runMigrations() {
	console.log('Running migrations...');

	try {
		// Wait for database connection with retries
		const isConnected = await dbManager.waitForConnection(5, 3000);

		if (!isConnected) {
			console.error('❌ Could not establish database connection after retries');
			console.log('💡 Please check your DATABASE_URL environment variable');
			console.log('💡 Ensure your database is accessible and credentials are correct');
			process.exit(1);
		}

		await migrate(db, { migrationsFolder: './drizzle' });
		console.log('✅ Migrations complete!');
	} catch (error) {
		console.error('❌ Migration failed:', error);
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

// Handle graceful shutdown
process.on('SIGINT', async () => {
	console.log('\n🛑 Migration interrupted');
	await closeConnection();
	process.exit(1);
});

runMigrations();
