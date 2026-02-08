import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Configure for serverless (Neon) with connection pooling
export const client = postgres(connectionString, {
	prepare: false, // Required for better-auth compatibility
	max: 10, // Connection pool size
	idle_timeout: 20,
	connect_timeout: 10,
});

export const db = drizzle(client, { schema });

// Graceful shutdown
process.on('beforeExit', async () => {
	await client.end();
});

// Helper function to close connection (useful for scripts)
export async function closeConnection() {
	await client.end();
}
