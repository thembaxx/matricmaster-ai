'use server';

import { and, desc, eq, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { studyBuddies, teamGoalMembers, teamGoals, users } from '@/lib/db/schema';

interface BuddyTeamGoal {
	id: string;
	title: string;
	description: string;
	targetScore: number;
	currentProgress: number;
	participants: Array<{
		id: string;
		name: string;
		avatar?: string;
		contribution: number;
	}>;
	deadline: Date;
	subject: string;
}

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return await dbManager.getDb();
}

/**
 * Create a shared team goal with study buddies
 */
export async function createBuddyTeamGoal(
	buddyIds: string[],
	goalData: {
		title: string;
		description: string;
		targetScore: number;
		deadline: Date;
		subject: string;
	}
): Promise<{ success: boolean; goalId?: string }> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) {
		return { success: false };
	}

	const db = await getDb();
	const goalId = crypto.randomUUID();
	const memberId = crypto.randomUUID();

	try {
		// Create team goal with creator
		await db.insert(teamGoals).values({
			id: goalId,
			creatorId: session.user.id,
			title: goalData.title,
			description: goalData.description,
			goalType: 'quiz_score',
			target: goalData.targetScore,
			currentProgress: 0,
			maxMembers: buddyIds.length + 1,
			memberCount: buddyIds.length + 1,
			isActive: true,
			endDate: goalData.deadline,
		});

		// Add creator as first member
		await db.insert(teamGoalMembers).values({
			id: memberId,
			goalId: goalId,
			userId: session.user.id,
			contribution: 0,
		});

		// Add all buddies as members
		const memberEntries = buddyIds.map((buddyId) => ({
			id: crypto.randomUUID(),
			goalId,
			userId: buddyId,
			contribution: 0,
		}));

		if (memberEntries.length > 0) {
			await db.insert(teamGoalMembers).values(memberEntries);
		}

		return { success: true, goalId };
	} catch (error) {
		console.error('Failed to create team goal:', error);
		return { success: false };
	}
}

/**
 * Get team goals that include study buddies
 */
export async function getBuddyTeamGoals(): Promise<BuddyTeamGoal[]> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) return [];

	const db = await getDb();
	const userId = session.user.id;

	// Get goals where user is a member
	const userMemberships = await db.query.teamGoalMembers.findMany({
		where: eq(teamGoalMembers.userId, userId),
	});

	const goalIds = userMemberships.map((m) => m.goalId);
	if (goalIds.length === 0) return [];

	// Get active goals
	const goals = await db.query.teamGoals.findMany({
		where: and(eq(teamGoals.isActive, true), sql`${teamGoals.id} IN ${goalIds}`),
		orderBy: [desc(teamGoals.createdAt)],
		limit: 10,
	});

	const buddyGoals: BuddyTeamGoal[] = [];

	for (const goal of goals) {
		// Get all members for this goal
		const members = await db.query.teamGoalMembers.findMany({
			where: eq(teamGoalMembers.goalId, goal.id),
		});

		// Get participant details
		const participantDetails = await Promise.all(
			members.slice(0, 5).map(async (member) => {
				const user = await db.query.users.findFirst({
					where: eq(users.id, member.userId),
				});
				return {
					id: member.userId,
					name: user?.name || 'Student',
					avatar: user?.image || undefined,
					contribution: member.contribution || 0,
				};
			})
		);

		// Check if any participant is a study buddy
		const hasStudyBuddies = members.some(
			(m) => m.userId !== userId && userMemberships.some((um) => um.goalId === goal.id)
		);

		if (hasStudyBuddies || members.length > 1) {
			buddyGoals.push({
				id: goal.id,
				title: goal.title,
				description: goal.description || '',
				targetScore: goal.target || 100,
				currentProgress: goal.currentProgress || 0,
				participants: participantDetails,
				deadline: new Date(goal.endDate || Date.now()),
				subject: goal.goalType || 'General',
			});
		}
	}

	return buddyGoals;
}

/**
 * Update team goal progress when a buddy completes a session
 */
export async function updateBuddyTeamGoalProgress(
	goalId: string,
	_sessionId: string,
	score: number
): Promise<{ success: boolean; goalCompleted: boolean }> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) return { success: false, goalCompleted: false };

	const db = await getDb();

	const goal = await db.query.teamGoals.findFirst({
		where: eq(teamGoals.id, goalId),
	});

	if (!goal) return { success: false, goalCompleted: false };

	// Verify user is a member of this goal
	const membership = await db.query.teamGoalMembers.findFirst({
		where: and(eq(teamGoalMembers.goalId, goalId), eq(teamGoalMembers.userId, session.user.id)),
	});

	if (!membership) return { success: false, goalCompleted: false };

	// Update member contribution
	await db
		.update(teamGoalMembers)
		.set({
			contribution: (membership.contribution || 0) + score,
		})
		.where(eq(teamGoalMembers.id, membership.id));

	// Update goal progress
	const newProgress = (goal.currentProgress || 0) + score;
	const goalCompleted = newProgress >= (goal.target || 100);

	await db
		.update(teamGoals)
		.set({
			currentProgress: newProgress,
			isActive: !goalCompleted,
			completedAt: goalCompleted ? new Date() : null,
			updatedAt: new Date(),
		})
		.where(eq(teamGoals.id, goalId));

	return { success: true, goalCompleted };
}

/**
 * Get study buddies for team goal invitation
 */
export async function getStudyBuddiesForGoal(): Promise<
	Array<{ id: string; name: string; avatar?: string }>
> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) return [];

	const db = await getDb();

	// Get all study buddies for the current user
	const buddyRelations = await db.query.studyBuddies.findMany({
		where: sql`${studyBuddies.userId1} = ${session.user.id} OR ${studyBuddies.userId2} = ${session.user.id}`,
	});

	const buddyIds = buddyRelations.map((b) =>
		b.userId1 === session.user.id ? b.userId2 : b.userId1
	);

	if (buddyIds.length === 0) return [];

	// Get buddy details
	const buddies = await Promise.all(
		buddyIds.slice(0, 10).map(async (buddyId) => {
			const user = await db.query.users.findFirst({
				where: eq(users.id, buddyId),
			});
			return {
				id: buddyId,
				name: user?.name || 'Student',
				avatar: user?.image || undefined,
			};
		})
	);

	return buddies;
}

/**
 * Get team goal leaderboard
 */
export async function getTeamGoalLeaderboard(goalId: string): Promise<
	Array<{
		userId: string;
		name: string;
		contribution: number;
		rank: number;
	}>
> {
	const db = await getDb();

	const members = await db.query.teamGoalMembers.findMany({
		where: eq(teamGoalMembers.goalId, goalId),
	});

	const enrichedMembers = await Promise.all(
		members.map(async (member) => {
			const user = await db.query.users.findFirst({
				where: eq(users.id, member.userId),
			});
			return {
				userId: member.userId,
				name: user?.name || 'Student',
				contribution: member.contribution || 0,
			};
		})
	);

	// Sort by contribution descending and assign ranks
	return enrichedMembers
		.sort((a, b) => b.contribution - a.contribution)
		.map((member, index) => ({
			...member,
			rank: index + 1,
		}));
}
