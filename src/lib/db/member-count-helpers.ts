import { eq, sql } from 'drizzle-orm';
import { type DbType, dbManager } from '@/lib/db';
import { channelMembers, channels, teamGoalMembers, teamGoals } from './schema';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export async function syncTeamGoalMemberCount(teamGoalId: string): Promise<void> {
	const db = await getDb();
	const count = await db
		.select({ count: sql<number>`count(*)` })
		.from(teamGoalMembers)
		.where(eq(teamGoalMembers.goalId, teamGoalId));

	await db
		.update(teamGoals)
		.set({ memberCount: count[0]?.count || 0, updatedAt: new Date() })
		.where(eq(teamGoals.id, teamGoalId));
}

export async function syncChannelMemberCount(channelId: string): Promise<void> {
	const db = await getDb();
	const count = await db
		.select({ count: sql<number>`count(*)` })
		.from(channelMembers)
		.where(eq(channelMembers.channelId, channelId));

	await db
		.update(channels)
		.set({ memberCount: count[0]?.count || 0 })
		.where(eq(channels.id, channelId));
}
