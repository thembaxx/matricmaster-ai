'use server';

import { and, desc, eq, gte, inArray } from 'drizzle-orm';
import { headers } from 'next/headers';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { teamGoalMembers, teamGoals, user } from '@/lib/db/schema';
import { awardXP } from './xpSystem';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export interface TeamGoalData {
	id: string;
	title: string;
	description: string;
	goalType: string;
	target: number;
	current: number;
	members: { userId: string; name: string; image: string | null; contribution: number }[];
	xpReward: number;
	endDate: Date;
	memberCount: number;
	maxMembers: number;
	isActive: boolean;
	creatorId: string;
	creatorName: string;
	userContribution: number;
	hasJoined: boolean;
	userHasClaimed: boolean;
}

export async function createTeamGoal(
	creatorId: string,
	goal: {
		title: string;
		description?: string;
		goalType: string;
		target: number;
		xpReward?: number;
		endDate: Date;
		maxMembers?: number;
	}
): Promise<TeamGoalData> {
	const db = await getDb();

	const [inserted] = await db
		.insert(teamGoals)
		.values({
			creatorId,
			title: goal.title,
			description: goal.description || '',
			goalType: goal.goalType,
			target: goal.target,
			xpReward: goal.xpReward || 100,
			endDate: goal.endDate,
			maxMembers: goal.maxMembers || 10,
			memberCount: 1,
		})
		.returning();

	await db.insert(teamGoalMembers).values({
		goalId: inserted.id,
		userId: creatorId,
		contribution: 0,
	});

	return mapTeamGoalToInterface(inserted, creatorId, [], true, 0, false);
}

export async function joinTeamGoal(goalId: string): Promise<void> {
	const auth = await getAuth();
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) throw new Error('Unauthorized');
	const userId = session.user.id;

	const db = await getDb();

	const goal = await db.query.teamGoals.findFirst({
		where: eq(teamGoals.id, goalId),
	});

	if (!goal?.isActive) throw new Error('Goal not available or inactive');
	if (goal.memberCount >= goal.maxMembers) throw new Error('Goal is full');

	const existing = await db.query.teamGoalMembers.findFirst({
		where: and(eq(teamGoalMembers.goalId, goalId), eq(teamGoalMembers.userId, userId)),
	});

	if (existing) throw new Error('Already joined');

	await db.insert(teamGoalMembers).values({
		goalId,
		userId,
		contribution: 0,
	});

	await db
		.update(teamGoals)
		.set({
			memberCount: goal.memberCount + 1,
			updatedAt: new Date(),
		})
		.where(eq(teamGoals.id, goalId));
}

export async function updateTeamProgress(
	goalId: string,
	userId: string,
	progressDelta: number
): Promise<void> {
	const db = await getDb();

	const member = await db.query.teamGoalMembers.findFirst({
		where: and(eq(teamGoalMembers.goalId, goalId), eq(teamGoalMembers.userId, userId)),
	});

	if (!member) throw new Error('Not a member of this goal');

	const newContribution = member.contribution + progressDelta;

	await db
		.update(teamGoalMembers)
		.set({ contribution: newContribution })
		.where(eq(teamGoalMembers.id, member.id));

	const allMembers = await db.query.teamGoalMembers.findMany({
		where: eq(teamGoalMembers.goalId, goalId),
	});

	const totalProgress = allMembers.reduce(
		(sum, m) => sum + m.contribution + (m.id === member.id ? progressDelta : 0),
		0
	);
	const adjustedTotal = totalProgress - member.contribution + newContribution;

	await db
		.update(teamGoals)
		.set({
			currentProgress: adjustedTotal,
			updatedAt: new Date(),
		})
		.where(eq(teamGoals.id, goalId));
}

export async function claimTeamGoalReward(
	goalId: string
): Promise<{ xp: number; success: boolean }> {
	const auth = await getAuth();
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) throw new Error('Unauthorized');
	const userId = session.user.id;

	const db = await getDb();

	const goal = await db.query.teamGoals.findFirst({
		where: eq(teamGoals.id, goalId),
	});

	if (!goal) throw new Error('Goal not found');

	const member = await db.query.teamGoalMembers.findFirst({
		where: and(eq(teamGoalMembers.goalId, goalId), eq(teamGoalMembers.userId, userId)),
	});

	if (!member) throw new Error('Not a member');
	if (member.hasClaimedReward) throw new Error('Already claimed');
	if (goal.currentProgress < goal.target) throw new Error('Goal not completed');

	await db
		.update(teamGoalMembers)
		.set({ hasClaimedReward: true })
		.where(eq(teamGoalMembers.id, member.id));

	const xpAmount = Math.floor(goal.xpReward * (member.contribution / Math.max(goal.target, 1)));
	await awardXP(userId, xpAmount, `Team goal: ${goal.title}`);

	return { xp: xpAmount, success: true };
}

export async function getTeamGoals(currentUserId?: string): Promise<TeamGoalData[]> {
	const db = await getDb();

	let userId = currentUserId;
	if (!userId) {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: await headers() });
		userId = session?.user?.id;
	}

	const activeGoals = await db.query.teamGoals.findMany({
		where: and(eq(teamGoals.isActive, true), gte(teamGoals.endDate, new Date())),
		orderBy: [desc(teamGoals.createdAt)],
		limit: 20,
	});

	const goalIds = activeGoals.map((g) => g.id);

	const allMembers =
		goalIds.length > 0
			? await db.query.teamGoalMembers.findMany({
					where: inArray(teamGoalMembers.goalId, goalIds),
				})
			: [];

	const membersByGoal = new Map<string, typeof allMembers>();
	for (const member of allMembers) {
		const existing = membersByGoal.get(member.goalId) || [];
		existing.push(member);
		membersByGoal.set(member.goalId, existing);
	}

	const allUserIds = [...new Set(allMembers.map((m) => m.userId))];
	const creatorIds = activeGoals.map((g) => g.creatorId);
	const uniqueUserIds = [...new Set([...allUserIds, ...creatorIds])];

	const allUsers =
		uniqueUserIds.length > 0
			? await db.select().from(user).where(inArray(user.id, uniqueUserIds))
			: [];

	const userMap = new Map(allUsers.map((u) => [u.id, u]));

	const result: TeamGoalData[] = [];

	for (const goal of activeGoals) {
		const members = membersByGoal.get(goal.id) || [];
		const creatorUser = userMap.get(goal.creatorId);
		const currentUserMember = userId ? members.find((m) => m.userId === userId) : undefined;

		result.push({
			id: goal.id,
			title: goal.title,
			description: goal.description || '',
			goalType: goal.goalType,
			target: goal.target,
			current: goal.currentProgress,
			members: members.map((m) => {
				const u = userMap.get(m.userId);
				return {
					userId: m.userId,
					name: u?.name || 'Unknown',
					image: u?.image || null,
					contribution: m.contribution,
				};
			}),
			xpReward: goal.xpReward,
			endDate: goal.endDate,
			memberCount: goal.memberCount,
			maxMembers: goal.maxMembers,
			isActive: goal.isActive,
			creatorId: goal.creatorId,
			creatorName: creatorUser?.name || 'Unknown',
			userContribution: currentUserMember?.contribution || 0,
			hasJoined: !!currentUserMember,
			userHasClaimed: currentUserMember?.hasClaimedReward || false,
		});
	}

	return result;
}

function mapTeamGoalToInterface(
	goal: typeof teamGoals.$inferSelect,
	_currentUserId: string,
	members: { userId: string; name: string; image: string | null; contribution: number }[],
	hasJoined: boolean,
	userContribution: number,
	userHasClaimed: boolean
): TeamGoalData {
	return {
		id: goal.id,
		title: goal.title,
		description: goal.description || '',
		goalType: goal.goalType,
		target: goal.target,
		current: goal.currentProgress,
		members,
		xpReward: goal.xpReward,
		endDate: goal.endDate,
		memberCount: goal.memberCount,
		maxMembers: goal.maxMembers,
		isActive: goal.isActive,
		creatorId: goal.creatorId,
		creatorName: '',
		userContribution,
		hasJoined,
		userHasClaimed,
	};
}
