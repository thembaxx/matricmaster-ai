import { resolve } from 'node:path';
import { addDays, startOfDay, subDays, subMonths } from 'date-fns';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';

// Load environment variables IMMEDIATELY
const envPath = resolve(process.cwd(), '.env.local');
config({ path: envPath });

async function main() {
	console.log('🚀 Starting Production-Ready Data Seeding (6-Month History)...');

	try {
		// Dynamic import to ensure process.env is populated before managers initialize
		const { dbManagerV2 } = await import('../src/lib/db/database-manager-v2');
		const { syncTableRegistry } = await import('../src/lib/db/sync/registry');

		await dbManagerV2.initialize();
		const activeDb = dbManagerV2.getActiveDatabase();
		const db = await dbManagerV2.getDbRaw();

		console.log(`📡 Active Database: ${activeDb}`);

		const getT = (name: string) => {
			const mapping = syncTableRegistry.find((m) => m.tableName === name);
			if (!mapping) throw new Error(`Table mapping not found for: ${name}`);
			return activeDb === 'sqlite' ? mapping.sqliteTable : mapping.pgTable;
		};

		const formatDate = (date: Date) => (activeDb === 'sqlite' ? date.toISOString() : date);

		// 1. DEFINE TABLES
		const tUsers = getT('users');
		const tSubjects = getT('subjects');
		const tQuizResults = getT('quiz_results');
		const tUserProgress = getT('user_progress');
		const tStudySessions = getT('study_sessions');
		const tUniversityTargets = getT('university_targets');
		const tFlashcardDecks = getT('flashcard_decks');
		const tFlashcards = getT('flashcards');
		const tFlashcardReviews = getT('flashcard_reviews');
		const tChannels = getT('channels');
		const tChannelMembers = getT('channel_members');
		const tComments = getT('comments');
		const tLeaderboardEntries = getT('leaderboard_entries');

		// 2. DEFINE SEED USERS (PERSONAS)
		const personas = [
			{
				id: 'user_sipho_001',
				name: 'Sipho Mokoena',
				email: 'sipho.mokoena@matricmaster.ai',
				school: 'King Edward VII School',
				role: 'user',
				avatarId: 'avatar_1',
				hasCompletedOnboarding: true,
			},
			{
				id: 'user_lerato_002',
				name: 'Lerato Zulu',
				email: 'lerato.zulu@matricmaster.ai',
				school: 'Pretoria High School for Girls',
				role: 'user',
				avatarId: 'avatar_2',
				hasCompletedOnboarding: true,
			},
			{
				id: 'user_johannes_003',
				name: 'Johannes van der Merwe',
				email: 'johannes.vdm@matricmaster.ai',
				school: 'Afrikaanse Hoër Seunskool',
				role: 'user',
				avatarId: 'avatar_3',
				hasCompletedOnboarding: true,
			},
			{
				id: 'user_fatima_004',
				name: 'Fatima Omar',
				email: 'fatima.omar@matricmaster.ai',
				school: 'Rylands High School',
				role: 'user',
				avatarId: 'avatar_4',
				hasCompletedOnboarding: true,
			},
			{
				id: 'user_zanele_005',
				name: 'Zanele Gumede',
				email: 'zanele.gumede@matricmaster.ai',
				school: 'Westville Girls High',
				role: 'user',
				avatarId: 'avatar_5',
				hasCompletedOnboarding: true,
			},
		];

		console.log('👥 Seeding User Personas...');
		for (const persona of personas) {
			const existing = await db
				.select()
				.from(tUsers)
				.where(eq(tUsers.email, persona.email))
				.limit(1);
			if (existing.length === 0) {
				const userValues: any = {
					...persona,
					emailVerified: true,
					createdAt: formatDate(subMonths(new Date(), 6)),
					updatedAt: formatDate(subMonths(new Date(), 6)),
					lastModifiedAt: formatDate(subMonths(new Date(), 6)),
					localUpdatedAt: formatDate(subMonths(new Date(), 6)),
				};

				if (activeDb === 'sqlite') {
					userValues.isBlocked = false;
					userValues.twoFactorEnabled = false;
				} else {
					userValues.is_blocked = false;
					userValues.twoFactorEnabled = false;
				}

				await db.insert(tUsers).values(userValues);
			}
		}

		// Get Subjects
		const allSubjects = await db.select().from(tSubjects);
		const math = allSubjects.find((s) => s.slug === 'mathematics');

		if (!math) {
			console.error('❌ Subjects not found. Please run the base seed first.');
			process.exit(1);
		}

		// 3. SEED ACTIVITY HISTORY
		console.log('📈 Seeding Activity History (6 Months)...');

		for (const persona of personas) {
			const userId = persona.id;

			for (let m = 0; m < 6; m++) {
				const monthDate = subMonths(new Date(), m);
				const sessionCount = 5 + Math.floor(Math.random() * 5);

				for (let s = 0; s < sessionCount; s++) {
					const dayOffset = Math.floor(Math.random() * 28);
					const sessionDate = subDays(monthDate, dayOffset);
					const subject = allSubjects[Math.floor(Math.random() * allSubjects.length)];
					const duration = 20 + Math.floor(Math.random() * 60);

					await db.insert(tStudySessions).values({
						id: crypto.randomUUID(),
						userId,
						subjectId: subject.id,
						sessionType: 'deep_work',
						topic: 'Exam Preparation',
						durationMinutes: duration,
						questionsAttempted: Math.floor(duration / 5),
						correctAnswers: Math.floor(duration / 7),
						startedAt: formatDate(sessionDate),
						completedAt: formatDate(sessionDate),
						lastModifiedAt: formatDate(new Date()),
						localUpdatedAt: formatDate(new Date()),
					});

					if (Math.random() > 0.4) {
						const score = 5 + Math.floor(Math.random() * 10);
						const total = 15;
						await db.insert(tQuizResults).values({
							id: crypto.randomUUID(),
							userId,
							quizId: `quiz_${persona.id}_${m}_${s}`,
							score,
							totalQuestions: total,
							percentage: ((score / total) * 100).toFixed(2),
							timeTaken: duration * 60,
							completedAt: formatDate(sessionDate),
							lastModifiedAt: formatDate(new Date()),
							localUpdatedAt: formatDate(new Date()),
						});
					}
				}
			}

			// 4. PROGRESS & TARGETS
			console.log(`📊 Seeding Stats for ${persona.name}...`);
			await db.insert(tUserProgress).values({
				id: crypto.randomUUID(),
				userId,
				subjectId: math.id,
				totalQuestionsAttempted: 100 + Math.floor(Math.random() * 50),
				totalCorrect: 80 + Math.floor(Math.random() * 40),
				streakDays: 7,
				bestStreak: 21,
				lastActivityAt: formatDate(new Date()),
				createdAt: formatDate(subMonths(new Date(), 6)),
				updatedAt: formatDate(new Date()),
				lastModifiedAt: formatDate(new Date()),
				localUpdatedAt: formatDate(new Date()),
			});

			await db.insert(tUniversityTargets).values({
				id: crypto.randomUUID(),
				userId,
				universityName: 'University of Johannesburg',
				faculty: 'Engineering',
				targetAps: 38,
				isActive: true,
				createdAt: formatDate(subMonths(new Date(), 5)),
				updatedAt: formatDate(subMonths(new Date(), 5)),
				lastModifiedAt: formatDate(new Date()),
				localUpdatedAt: formatDate(new Date()),
			});

			// 5. FLASHCARDS
			console.log(`🗂️ Seeding Flashcards for ${persona.name}...`);
			const [deck] = await db
				.insert(tFlashcardDecks)
				.values({
					id: crypto.randomUUID(),
					userId,
					name: `${math.name} Basics`,
					subjectId: math.id,
					cardCount: 5,
					isPublic: true,
					createdAt: formatDate(subMonths(new Date(), 4)),
					updatedAt: formatDate(subMonths(new Date(), 4)),
					lastModifiedAt: formatDate(new Date()),
					localUpdatedAt: formatDate(new Date()),
				})
				.returning();

			for (let i = 0; i < 5; i++) {
				const [card] = await db
					.insert(tFlashcards)
					.values({
						id: crypto.randomUUID(),
						deckId: deck.id,
						front: `Concept ${i + 1}`,
						back: `Answer ${i + 1}`,
						timesReviewed: 10,
						timesCorrect: 8,
						nextReview: formatDate(addDays(new Date(), 3)),
						createdAt: formatDate(subMonths(new Date(), 4)),
						updatedAt: formatDate(new Date()),
						lastModifiedAt: formatDate(new Date()),
						localUpdatedAt: formatDate(new Date()),
					})
					.returning();

				await db.insert(tFlashcardReviews).values({
					id: crypto.randomUUID(),
					userId,
					flashcardId: card.id,
					rating: 4,
					intervalAfter: 4,
					easeFactorAfter: '2.5',
					reviewedAt: formatDate(subDays(new Date(), 1)),
					lastModifiedAt: formatDate(new Date()),
					localUpdatedAt: formatDate(new Date()),
				});
			}
		}

		// 6. SOCIAL & LEADERBOARD
		console.log('💬 Seeding Social & Leaderboard...');
		const [channel] = await db
			.insert(tChannels)
			.values({
				id: crypto.randomUUID(),
				name: 'Matric 2026 Study Group',
				description: 'Main study group for this year.',
				createdBy: personas[0].id,
				memberCount: personas.length,
				createdAt: formatDate(subMonths(new Date(), 5)),
				lastModifiedAt: formatDate(new Date()),
				localUpdatedAt: formatDate(new Date()),
			})
			.returning();

		for (const persona of personas) {
			await db.insert(tChannelMembers).values({
				channelId: channel.id,
				userId: persona.id,
				joinedAt: formatDate(subMonths(new Date(), 5)),
				lastModifiedAt: formatDate(new Date()),
				localUpdatedAt: formatDate(new Date()),
			});

			await db.insert(tComments).values({
				id: crypto.randomUUID(),
				userId: persona.id,
				content: "Let's crush these exams! 🚀",
				resourceType: 'channel',
				resourceId: channel.id,
				createdAt: formatDate(subDays(new Date(), 2)),
				updatedAt: formatDate(subDays(new Date(), 2)),
				lastModifiedAt: formatDate(new Date()),
				localUpdatedAt: formatDate(new Date()),
			});

			await db.insert(tLeaderboardEntries).values({
				id: crypto.randomUUID(),
				userId: persona.id,
				periodType: 'weekly',
				periodStart: formatDate(startOfDay(subDays(new Date(), 3))),
				totalPoints: 2000 + Math.floor(Math.random() * 500),
				rank: 0,
				questionsCompleted: 50,
				updatedAt: formatDate(new Date()),
				lastModifiedAt: formatDate(new Date()),
				localUpdatedAt: formatDate(new Date()),
			});
		}

		console.log('\n✅ Production-Ready Seeding Completed Successfully!');
		process.exit(0);
	} catch (error) {
		console.error('❌ Seeding failed:', error);
		process.exit(1);
	}
}

main();
