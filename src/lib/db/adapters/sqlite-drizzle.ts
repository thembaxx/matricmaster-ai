import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { sqliteManager } from '../sqlite-manager';
import * as sqliteSchema from '../sqlite-schema';

export async function getSQLiteAuthAdapter() {
	const db = await sqliteManager.getDb();
	return drizzleAdapter(db, {
		provider: 'sqlite',
		schema: {
			user: sqliteSchema.sqliteUsers,
			session: sqliteSchema.sqliteSessions,
			account: sqliteSchema.sqliteAccounts,
			verification: sqliteSchema.sqliteVerifications,
		},
	});
}
