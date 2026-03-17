import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { pgManager } from '../postgresql-manager';
import * as schema from '../schema';

export function getPostgresAuthAdapter() {
	const db = pgManager.getDb();
	return drizzleAdapter(db, {
		provider: 'pg',
		schema: schema as never,
	});
}
