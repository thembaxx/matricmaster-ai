import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { pgManager } from '../postgresql-manager';
import * as schema from '../schema';

export async function getPostgresAuthAdapter() {
	const db = pgManager.getDb();
	return drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			user: schema.users,
			session: schema.session,
			account: schema.account,
			verification: schema.verification,
		},
	});
}
