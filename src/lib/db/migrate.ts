import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { closeConnection, db } from './index';

async function runMigrations() {
	console.log('Running migrations...');

	try {
		await migrate(db, { migrationsFolder: './drizzle' });
		console.log('✅ Migrations complete!');
	} catch (error) {
		console.error('❌ Migration failed:', error);
		process.exit(1);
	} finally {
		await closeConnection();
		process.exit(0);
	}
}

runMigrations();
