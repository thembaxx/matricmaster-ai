'use server';

import { and, asc, eq, ne, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { peerEssayGrades, peerEssays } from '@/lib/db/schema';
import { awardXP } from '@/services/xpSystem';

const MAX_PEER_GRADES = 3;
const GRADING_XP = 15;

async function getDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export async function POST(request: Request) {
	const auth = await getAuth();
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json();
	const { id: essayId, clarity, argument, evidence, mechanics, feedback } = body;

	if (!essayId || !clarity || !argument || !evidence || !mechanics) {
		return Response.json({ error: 'All rubric scores required' }, { status: 400 });
	}

	const db = await getDb();

	try {
		// Check essay exists and isn't already graded by this user
		const essay = await db.query.peerEssays.findFirst({
			where: eq(peerEssays.id, essayId),
		});

		if (!essay) {
			return Response.json({ error: 'Essay not found' }, { status: 404 });
		}

		if (essay.userId === session.user.id) {
			return Response.json({ error: 'Cannot grade your own essay' }, { status: 400 });
		}

		// Check if already graded by this user
		const existingGrade = await db.query.peerEssayGrades.findFirst({
			where: and(
				eq(peerEssayGrades.essayId, essayId),
				eq(peerEssayGrades.graderId, session.user.id)
			),
		});

		if (existingGrade) {
			return Response.json({ error: 'Already graded this essay' }, { status: 400 });
		}

		// Insert grade
		const [grade] = await db
			.insert(peerEssayGrades)
			.values({
				essayId,
				graderId: session.user.id,
				clarity,
				argument,
				evidence,
				mechanics,
				feedback: feedback || null,
				isAIGrade: false,
				xpAwarded: 0,
			})
			.returning();

		// Update essay peer grade count
		const newGradeCount = essay.peerGradeCount + 1;
		const newStatus = newGradeCount >= MAX_PEER_GRADES ? 'completed' : 'being_graded';

		await db
			.update(peerEssays)
			.set({
				peerGradeCount: newGradeCount,
				status: newStatus,
			})
			.where(eq(peerEssays.id, essayId));

		// Award XP to grader
		const newTotalXP = await awardXP(session.user.id, GRADING_XP, 'peer_essay_grading');

		// Update XP awarded to grade record
		await db
			.update(peerEssayGrades)
			.set({ xpAwarded: GRADING_XP })
			.where(eq(peerEssayGrades.id, grade.id));

		return Response.json({
			success: true,
			gradeCount: newGradeCount,
			xpEarned: GRADING_XP,
			totalXP: newTotalXP,
		});
	} catch (error) {
		console.error('Error submitting grade:', error);
		return Response.json({ error: 'Failed to submit grade' }, { status: 500 });
	}
}
