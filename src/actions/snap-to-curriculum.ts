'use server';

import { and, eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { conceptStruggles, topicConfidence } from '@/lib/db/schema';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export interface SnapResult {
	topic: string;
	subject: string;
	mappedToCurriculum: boolean;
	previousStatus?: string;
	newStatus: string;
}

export async function mapSnapToCurriculum(
	identifiedTopic: string,
	identifiedSubject: string,
	userStruggled = false
): Promise<SnapResult> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');

	const db = await getDb();

	const existingConfidence = await db.query.topicConfidence.findFirst({
		where: and(
			eq(topicConfidence.userId, session.user.id),
			eq(topicConfidence.topic, identifiedTopic),
			eq(topicConfidence.subject, identifiedSubject)
		),
	});

	let previousStatus = 'not-started';
	let newStatus = 'in-progress';

	if (existingConfidence) {
		const score = Number(existingConfidence.confidenceScore);
		if (score >= 0.7) {
			previousStatus = 'mastered';
			newStatus = userStruggled ? 'in-progress' : 'mastered';
		} else if (score >= 0.4) {
			previousStatus = 'in-progress';
			newStatus = userStruggled ? 'weak' : 'in-progress';
		} else {
			previousStatus = 'weak';
			newStatus = 'weak';
		}
	}

	if (userStruggled) {
		const currentScore = existingConfidence ? Number(existingConfidence.confidenceScore) : 0.5;
		const newScore = Math.max(0, currentScore - 0.2);
		const scoreStr = newScore.toFixed(2);

		if (existingConfidence) {
			await db
				.update(topicConfidence)
				.set({
					confidenceScore: scoreStr as unknown as typeof topicConfidence.confidenceScore,
					lastAttemptAt: new Date(),
				})
				.where(eq(topicConfidence.id, existingConfidence.id));
		} else {
			await db.insert(topicConfidence).values({
				userId: session.user.id,
				topic: identifiedTopic,
				subject: identifiedSubject,
				timesAttempted: 1,
				timesCorrect: 0,
			});
		}

		const existingStruggle = await db.query.conceptStruggles.findFirst({
			where: and(
				eq(conceptStruggles.userId, session.user.id),
				eq(conceptStruggles.concept, identifiedTopic)
			),
		});

		if (existingStruggle) {
			await db
				.update(conceptStruggles)
				.set({
					struggleCount: existingStruggle.struggleCount + 1,
					updatedAt: new Date(),
				})
				.where(eq(conceptStruggles.id, existingStruggle.id));
		} else {
			await db.insert(conceptStruggles).values({
				userId: session.user.id,
				concept: identifiedTopic,
				struggleCount: 1,
				isResolved: false,
			});
		}
	}

	return {
		topic: identifiedTopic,
		subject: identifiedSubject,
		mappedToCurriculum: true,
		previousStatus,
		newStatus,
	};
}

export async function extractTopicFromSolution(
	solutionText: string
): Promise<{ topic: string; subject: string } | null> {
	const topicPatterns: Record<string, RegExp> = {
		Calculus: /calculus|differentiation|integration|derivative|limit/i,
		'Euclidean Geometry': /geometry|triangle|circle|angle|congruent|similar/i,
		Algebra: /equation|simplify|factor|expand|quadratic/i,
		Probability: /probability|outcome|event|random|combination/i,
		Statistics: /mean|median|mode|standard deviation|variance/i,
		'Chemical Equilibrium': /equilibrium|reversible|shift|le chatelier/i,
		Electrostatics: /charge|electric field|coulomb|potential/i,
		Momentum: /momentum|impulse|conservation|collision/i,
		'Work, Energy & Power': /work|energy|power|force/i,
		'DNA & Genetics': /dna|rna|gene|genetics|heredity/i,
		Evolution: /evolution|natural selection|species/i,
		'Electric Circuits': /circuit|resistance|voltage|current|ohm/i,
	};

	for (const [topic, pattern] of Object.entries(topicPatterns)) {
		if (pattern.test(solutionText)) {
			const mathTopics = ['Calculus', 'Euclidean Geometry', 'Algebra', 'Probability', 'Statistics'];
			const subject = mathTopics.includes(topic) ? 'Mathematics' : 'Physical Sciences';
			return { topic, subject };
		}
	}

	return null;
}
