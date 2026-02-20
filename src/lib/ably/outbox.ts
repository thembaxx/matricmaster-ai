import { dbManager } from '../db/index';
import { outbox } from '../db/schema-chat';

const getDb = () => dbManager.getDb();

type OutboxOperation = 'insert' | 'update' | 'delete';

interface OutboxEntry {
	mutationId: string;
	channel: string;
	name: OutboxOperation;
	data: Record<string, unknown>;
}

export async function writeToOutbox(entries: OutboxEntry[]): Promise<void> {
	const db = getDb();

	await db.insert(outbox).values(
		entries.map((entry) => ({
			mutationId: entry.mutationId,
			channel: entry.channel,
			name: entry.name,
			data: JSON.stringify(entry.data),
			rejected: false,
		}))
	);
}

export async function writeSingleOutbox(
	channel: string,
	operation: OutboxOperation,
	data: Record<string, unknown>
): Promise<void> {
	await writeToOutbox([
		{
			mutationId: crypto.randomUUID(),
			channel,
			name: operation,
			data,
		},
	]);
}

export function generateMutationId(): string {
	return `${Date.now()}-${crypto.randomUUID()}`;
}

export async function writeTransactionalOutbox<T>(
	channel: string,
	operation: OutboxOperation,
	data: Record<string, unknown>,
	callback: () => Promise<T>
): Promise<T> {
	const mutationId = generateMutationId();
	const db = getDb();

	try {
		const result = await db.transaction(async (tx) => {
			await tx.insert(outbox).values({
				mutationId,
				channel,
				name: operation,
				data: JSON.stringify(data),
				rejected: false,
			});

			return callback();
		});

		return result;
	} catch (error) {
		console.error('[Outbox] Transaction failed:', error);
		throw error;
	}
}
