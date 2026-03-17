import { eq } from 'drizzle-orm';
import { users } from '../src/lib/db/better-auth-schema';
import { dbManager } from '../src/lib/db/index';

async function makeAdmin() {
	await dbManager.initialize();
	const db = dbManager.getDb();

	// Find all users and make them admins for testing purposes
	const allUsers = await db.select().from(users);
	for (const user of allUsers) {
		console.log(`Making user ${user.email} an admin...`);
		await db.update(users).set({ role: 'admin' }).where(eq(users.id, user.id));
	}

	console.log('Done!');
	process.exit(0);
}

makeAdmin().catch((err) => {
	console.debug(err);
	process.exit(1);
});
