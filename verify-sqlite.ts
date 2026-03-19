import { eq } from 'drizzle-orm';
import { dbManagerV2 } from './src/lib/db/database-manager-v2';
import * as sqliteSchema from './src/lib/db/sqlite-schema';

async function verify() {
	console.log('--- Starting SQLite Verification ---');

	// 1. Initialize
	await dbManagerV2.initialize();
	console.log('Initial active database:', dbManagerV2.getActiveDatabase());

	// 2. Force failover to SQLite
	dbManagerV2.forceFailover();
	console.log('Forced failover. Active database:', dbManagerV2.getActiveDatabase());

	// Explicitly connect to SQLite
	const { sqliteManager } = await import('./src/lib/db/sqlite-manager');
	await sqliteManager.connect();

	const sqliteDb = dbManagerV2.getSqliteDb();
	const testId = `test-user-${Date.now()}`;

	try {
		// 3. Insert test data
		console.log('Inserting test user:', testId);
		await sqliteDb.insert(sqliteSchema.sqliteUsers).values({
			id: testId,
			name: 'Test User',
			email: `${testId}@example.com`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		// 4. Select test data
		console.log('Selecting test user...');
		const users = await sqliteDb
			.select()
			.from(sqliteSchema.sqliteUsers)
			.where(eq(sqliteSchema.sqliteUsers.id, testId));

		if (users.length > 0 && users[0].id === testId) {
			console.log('✅ SQLite Insert/Select successful!');
		} else {
			console.error('❌ SQLite verification failed: User not found or ID mismatch');
		}

		// 5. Clean up
		console.log('Cleaning up test user...');
		await sqliteDb.delete(sqliteSchema.sqliteUsers).where(eq(sqliteSchema.sqliteUsers.id, testId));
		console.log('Cleanup complete.');
	} catch (error) {
		console.error('❌ SQLite verification error:', error);
	}

	console.log('--- SQLite Verification Complete ---');
}

verify().catch(console.error);
