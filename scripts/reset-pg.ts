import { config } from 'dotenv';
import postgres from 'postgres';

config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!);

async function reset() {
	console.log('Dropping public schema...');
	await sql`DROP SCHEMA public CASCADE;`;
	await sql`CREATE SCHEMA public;`;

	process.exit(0);
}
reset().catch((e) => {
	console.error(e);
	process.exit(1);
});
