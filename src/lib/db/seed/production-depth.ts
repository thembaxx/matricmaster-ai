import { eq } from 'drizzle-orm';
import { dbManager } from '../index';
import {
	buddyRequests,
	conceptStruggles,
	leaderboardEntries,
	topicConfidence,
	topicMastery,
	universityTargets,
	userProgress,
	users,
	wellnessCheckIns,
} from '../schema';

export async function seedProductionDepth() {
	const db = await dbManager.getDb();

	// 1. Ghost Users for Leaderboard & Discovery
	const ghostUsers = [
		{ name: 'naledi molefe', email: 'naledi@ghost.ai', xp: 82500, streak: 15 },
		{ name: 'jabu dlamini', email: 'jabu@ghost.ai', xp: 64200, streak: 8 },
		{ name: 'sarah smit', email: 'sarah@ghost.ai', xp: 91000, streak: 21 },
		{ name: 'thabo mokoena', email: 'thabo@ghost.ai', xp: 75300, streak: 12 },
		{ name: 'lerato khumalo', email: 'lerato@ghost.ai', xp: 58900, streak: 5 },
		{ name: 'siyabonga nkosi', email: 'siya@ghost.ai', xp: 42100, streak: 3 },
		{ name: 'anika van wyk', email: 'anika@ghost.ai', xp: 98400, streak: 45 },
		{ name: 'sipho maduna', email: 'sipho@ghost.ai', xp: 33200, streak: 1 },
		{ name: 'zanele abrahams', email: 'zanele@ghost.ai', xp: 67800, streak: 10 },
		{ name: 'kevin pillay', email: 'kevin@ghost.ai', xp: 51200, streak: 6 },
	];

	console.log('👥 seeding ghost users...');

	const createdGhostIds: string[] = [];

	for (const ghost of ghostUsers) {
		const existing = await db.query.users.findFirst({
			where: eq(users.email, ghost.email),
		});

		let userId = existing?.id;
		if (!existing) {
			userId = crypto.randomUUID();
			await db.insert(users).values({
				id: userId,
				name: ghost.name,
				email: ghost.email,
				emailVerified: true,
				image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${ghost.name.replace(' ', '')}`,
				role: 'user',
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}
		createdGhostIds.push(userId!);

		// Update ghost progress
		await db
			.insert(userProgress)
			.values({
				userId: userId!,
				streakDays: ghost.streak,
				lastActivityAt: new Date(),
			})
			.onConflictDoUpdate({
				target: userProgress.userId,
				set: {
					streakDays: ghost.streak,
				},
			});

		// Add leaderboard entry
		const periodStart = new Date();
		periodStart.setDate(1); // Start of month
		periodStart.setHours(0, 0, 0, 0);

		await db
			.insert(leaderboardEntries)
			.values({
				userId: userId!,
				periodType: 'monthly',
				periodStart: periodStart,
				totalPoints: ghost.xp % 10000,
				rank: 0, // rank is usually calculated by view but we seed points
				questionsCompleted: Math.floor(ghost.xp / 50),
				accuracyPercentage: 70 + Math.floor(Math.random() * 25),
			})
			.onConflictDoUpdate({
				target: [
					leaderboardEntries.userId,
					leaderboardEntries.periodType,
					leaderboardEntries.periodStart,
				],
				set: { totalPoints: ghost.xp % 10000 },
			});
	}

	// 2. Social Connections for Kagiso
	const kagisoEmail = 'student@lumni.ai';
	const kagiso = await db.query.users.findFirst({ where: eq(users.email, kagisoEmail) });

	if (kagiso) {
		console.log('🤝 seeding buddy requests for kagiso...');

		// Accepted buddies
		for (let i = 0; i < 3; i++) {
			await db
				.insert(buddyRequests)
				.values({
					fromUserId: createdGhostIds[i],
					toUserId: kagiso.id,
					status: 'accepted',
					message: "hey! let's study physics together.",
					createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
					respondedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
				})
				.onConflictDoNothing();
		}

		// Pending incoming
		await db
			.insert(buddyRequests)
			.values({
				fromUserId: createdGhostIds[4],
				toUserId: kagiso.id,
				status: 'pending',
				message: 'saw you on the leaderboard, great work!',
				createdAt: new Date(),
			})
			.onConflictDoNothing();

		// 3. University Targets
		console.log('🎓 seeding university targets...');
		await db
			.insert(universityTargets)
			.values({
				userId: kagiso.id,
				universityName: 'university of cape town',
				faculty: 'engineering & the built environment',
				targetAps: 42,
				isActive: true,
				createdAt: new Date(),
			})
			.onConflictDoUpdate({
				target: universityTargets.id,
				set: { universityName: 'university of cape town', targetAps: 42 },
			});

		// 4. Wellness Check-ins
		console.log('🧠 seeding wellness history...');
		for (let i = 0; i < 7; i++) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			await db.insert(wellnessCheckIns).values({
				userId: kagiso.id,
				moodBefore: Math.floor(3 + Math.random() * 2),
				sessionDuration: Math.floor(30 + Math.random() * 90),
				createdAt: date,
			});
		}

		// 5. Concept Struggles & Confidence
		console.log('📉 seeding struggles and confidence...');
		// Actually search by slug
		const subjects = await db.query.subjects.findMany();
		const mathSub = subjects.find((s) => s.slug === 'mathematics');
		const physSub = subjects.find((s) => s.slug === 'physics');

		if (mathSub && physSub) {
			// Struggles
			await db.insert(conceptStruggles).values({
				userId: kagiso.id,
				concept: 'calculus limits - understanding why 1/0 is undefined but limits exist',
				struggleCount: 3,
				isResolved: false,
				createdAt: new Date(),
			});

			await db.insert(conceptStruggles).values({
				userId: kagiso.id,
				concept: 'work-energy theorem - kinetic vs potential energy conservation',
				struggleCount: 5,
				isResolved: false,
				createdAt: new Date(),
			});

			// Confidence levels
			const topics = [
				{ topic: 'calculus', sub: mathSub, conf: 3.2 },
				{ topic: 'trigonometry', sub: mathSub, conf: 4.5 },
				{ topic: 'mechanics', sub: physSub, conf: 2.8 },
				{ topic: 'electricity', sub: physSub, conf: 3.9 },
			];

			for (const t of topics) {
				await db
					.insert(topicConfidence)
					.values({
						userId: kagiso.id,
						subject: t.sub.slug!,
						topic: t.topic,
						confidenceScore: t.conf.toString(),
						updatedAt: new Date(),
					})
					.onConflictDoUpdate({
						target: [topicConfidence.userId, topicConfidence.topic, topicConfidence.subject],
						set: { confidenceScore: t.conf.toString() },
					});

				await db
					.insert(topicMastery)
					.values({
						userId: kagiso.id,
						subjectId: t.sub.id,
						topic: t.topic,
						masteryLevel: (t.conf / 5).toString(),
					})
					.onConflictDoUpdate({
						target: [topicMastery.userId, topicMastery.topic, topicMastery.subjectId],
						set: { masteryLevel: (t.conf / 5).toString() },
					});
			}
		}
	}

	console.log('✅ production depth seeding complete');
}
