import { type NextRequest, NextResponse } from 'next/server';
import { dbManagerV2 } from '@/lib/db/database-manager-v2';
import {
	aiConversations,
	calendarEvents,
	channelMembers,
	channels,
	notifications,
	quizResults,
	studySessions,
	subjects,
	topicMastery,
	userAchievements,
	users,
} from '@/lib/db/schema';
import { generateDateRange } from '@/lib/mock-data/distributions';
import { createMockDataGenerator } from '@/lib/mock-data/generator';
import { SocialGenerator } from '@/lib/mock-data/social-generator';

async function getDb() {
	await dbManagerV2.initialize();
	return dbManagerV2.getSmartDb();
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { userCount = 100, monthsBack = 6, intensity = 'high', seed } = body;

		await dbManagerV2.initialize();
		const db = await getDb();
		const activeDb = dbManagerV2.getActiveDatabase();

		const formatDate = (date: Date) => (activeDb === 'sqlite' ? date.toISOString() : date);

		console.log('🔄 Starting mock data generation...');
		console.log(`   Users: ${userCount}, Months: ${monthsBack}, Intensity: ${intensity}`);

		const generator = createMockDataGenerator({
			seed,
			userCount,
			monthsBack,
			intensity: intensity as 'low' | 'medium' | 'high',
		});

		const dateRange = generateDateRange(
			generator['rng'] as never,
			monthsBack,
			intensity as 'low' | 'medium' | 'high'
		);

		const existingSubjects = await db.select().from(subjects).limit(10);
		const subjectIdMap = new Map<string, number>();
		for (const subject of existingSubjects) {
			subjectIdMap.set(subject.slug as string, subject.id as number);
		}
		generator.setSubjectIds(subjectIdMap);

		const generatedUsers = generator.generateUsers(userCount);
		console.log(`👤 Generated ${generatedUsers.length} users`);

		const insertedUserIds: string[] = [];
		for (const user of generatedUsers) {
			try {
				await db.insert(users).values({
					id: user.id,
					email: user.email,
					name: user.name,
					emailVerified: true,
					createdAt: formatDate(user.createdAt),
					updatedAt: formatDate(new Date()),
				});
				insertedUserIds.push(user.id);
			} catch (e) {
				console.log(`   User already exists: ${user.email}`);
				insertedUserIds.push(user.id);
			}
		}

		const records = {
			quizResults: 0,
			studySessions: 0,
			topicMasteries: 0,
			achievements: 0,
			channels: 0,
			notifications: 0,
			calendarEvents: 0,
			aiConversations: 0,
		};

		const socialGen = new SocialGenerator(generator['rng'] as never, dateRange as never);

		for (const userId of insertedUserIds) {
			try {
				const quizResultsData = generator.generateQuizResults(userId, 6);
				for (const result of quizResultsData) {
					await db.insert(quizResults).values({
						id: result.id,
						userId: result.userId,
						quizId: result.quizId,
						subjectId: result.subjectId,
						topic: result.topic,
						score: result.score,
						totalQuestions: result.totalQuestions,
						percentage: String(result.percentage),
						timeTaken: result.timeTaken,
						completedAt: formatDate(result.completedAt),
						source: result.source,
						isReviewMode: result.isReviewMode,
					});
					records.quizResults++;
				}

				const sessionCount = intensity === 'high' ? 25 : intensity === 'medium' ? 15 : 8;
				for (let i = 0; i < sessionCount; i++) {
					const session = generator.generateStudySession(userId);
					await db.insert(studySessions).values({
						id: session.id,
						userId: session.userId,
						subjectId: session.subjectId,
						sessionType: session.sessionType,
						topic: session.topic,
						durationMinutes: session.durationMinutes,
						questionsAttempted: session.questionsAttempted,
						correctAnswers: session.correctAnswers,
						marksEarned: session.marksEarned,
						startedAt: formatDate(session.startedAt),
						completedAt: formatDate(session.completedAt),
					});
					records.studySessions++;
				}

				const subjectSlugs = Array.from(subjectIdMap.keys()).slice(0, 4);
				for (const slug of subjectSlugs) {
					const masteries = generator.generateTopicMastery(
						userId,
						subjectIdMap.get(slug) ?? 1,
						slug
					);
					for (const mastery of masteries) {
						await db.insert(topicMastery).values({
							id: mastery.id,
							userId: mastery.userId,
							subjectId: mastery.subjectId,
							topic: mastery.topic,
							masteryLevel: String(mastery.masteryLevel),
							questionsAttempted: mastery.questionsAttempted,
							questionsCorrect: mastery.questionsCorrect,
							consecutiveCorrect: mastery.consecutiveCorrect,
							lastPracticed: formatDate(mastery.lastPracticed),
							createdAt: formatDate(mastery.createdAt),
							updatedAt: formatDate(mastery.updatedAt),
						});
						records.topicMasteries++;
					}
				}

				const achievements = generator.generateAchievements(userId);
				for (const achievement of achievements) {
					await db.insert(userAchievements).values({
						id: achievement.id,
						userId: achievement.userId,
						achievementId: achievement.achievementId,
						title: achievement.title,
						description: achievement.description,
						icon: achievement.icon,
						unlockedAt: formatDate(achievement.unlockedAt),
					});
					records.achievements++;
				}
			} catch (e) {
				console.log(`   Error generating data for user: ${userId}`);
			}
		}

		const channelCount = 10;
		for (let i = 0; i < channelCount; i++) {
			const channel = socialGen.generateChannel(insertedUserIds, subjectIdMap);
			try {
				await db.insert(channels).values({
					id: channel.id,
					name: channel.name,
					description: channel.description,
					subjectId: channel.subjectId,
					createdBy: channel.createdBy,
					isPublic: channel.isPublic,
					memberCount: channel.memberCount,
					createdAt: formatDate(channel.createdAt),
				});

				const members = socialGen.generateChannelMembers(channel.id, insertedUserIds);
				for (const member of members) {
					await db.insert(channelMembers).values({
						channelId: member.channelId,
						userId: member.userId,
						role: member.role,
						joinedAt: formatDate(member.joinedAt),
					});
				}
				records.channels++;
			} catch (e) {
				console.log('   Error creating channel');
			}
		}

		const sampleUsers = insertedUserIds.slice(0, 20);
		for (const userId of sampleUsers) {
			try {
				const calendarEventsData = socialGen.generateCalendarEvents(userId, subjectIdMap);
				for (const event of calendarEventsData) {
					await db.insert(calendarEvents).values({
						id: event.id,
						userId: event.userId,
						title: event.title,
						description: event.description,
						eventType: event.eventType,
						subjectId: event.subjectId,
						startTime: formatDate(event.startTime),
						endTime: formatDate(event.endTime),
						isAllDay: event.isAllDay,
						isCompleted: event.isCompleted,
						createdAt: formatDate(event.createdAt),
					});
					records.calendarEvents++;
				}

				const notificationsData = socialGen.generateNotifications(userId);
				for (const notif of notificationsData) {
					await db.insert(notifications).values({
						id: notif.id,
						userId: notif.userId,
						type: notif.type,
						title: notif.title,
						message: notif.message,
						isRead: notif.isRead,
						createdAt: formatDate(notif.createdAt),
					});
					records.notifications++;
				}

				if (Math.random() < 0.3) {
					const conv = socialGen.generateAIConversation(userId);
					await db.insert(aiConversations).values({
						id: conv.id,
						userId: conv.userId,
						title: conv.title,
						subject: conv.subject,
						messageCount: conv.messageCount,
						messages: '[]',
						createdAt: formatDate(conv.createdAt),
						updatedAt: formatDate(conv.updatedAt),
					});
					records.aiConversations++;
				}
			} catch (e) {
				console.log('   Error generating social data');
			}
		}

		console.log('\n✅ Mock data generation complete!');
		console.log(`   Users: ${insertedUserIds.length}`);
		console.log(`   Quiz Results: ${records.quizResults}`);
		console.log(`   Study Sessions: ${records.studySessions}`);
		console.log(`   Topic Masteries: ${records.topicMasteries}`);
		console.log(`   Achievements: ${records.achievements}`);
		console.log(`   Channels: ${records.channels}`);
		console.log(`   Notifications: ${records.notifications}`);
		console.log(`   Calendar Events: ${records.calendarEvents}`);
		console.log(`   AI Conversations: ${records.aiConversations}`);

		return NextResponse.json({
			success: true,
			usersGenerated: insertedUserIds.length,
			records,
			config: { userCount, monthsBack, intensity, seed: generator.getConfig().seed },
		});
	} catch (error) {
		console.error('❌ Mock data generation failed:', error);
		return NextResponse.json(
			{ error: 'Generation failed', details: String(error) },
			{ status: 500 }
		);
	}
}

export async function GET() {
	return NextResponse.json({
		status: 'Mock data API ready',
		methods: ['POST'],
		options: {
			userCount: 'Number of users to generate (default: 100)',
			monthsBack: 'Months of activity (default: 6)',
			intensity: 'low | medium | high (default: high)',
			seed: 'Random seed for reproducibility',
		},
	});
}
