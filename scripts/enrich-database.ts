#!/usr/bin/env bun

import { resolve } from 'node:path';
import { config } from 'dotenv';
import { dbManagerV2 } from '../src/lib/db/database-manager-v2';
import { syncTableRegistry } from '../src/lib/db/sync/registry';

const envPath = resolve(process.cwd(), '.env.local');
config({ path: envPath });

interface EnrichmentConfig {
	seed: number;
	userCount: number;
	daysBack: number;
	intensity: 'low' | 'medium' | 'high';
}

interface _GeneratedData {
	users: any[];
	subjects: any[];
	questions: any[];
	questionAttempts: any[];
	studySessions: any[];
	flashcardDecks: any[];
	flashcards: any[];
	flashcardReviews: any[];
	quizResults: any[];
	topicMasteries: any[];
	userProgress: any[];
	achievements: any[];
	calendarEvents: any[];
	notifications: any[];
	studyBuddies: any[];
	aiConversations: any[];
	leaderboardEntries: any[];
}

function seededRandom(seed: number): () => number {
	let state = seed;
	return () => {
		state = (state * 1103515245 + 12345) & 0x7fffffff;
		return state / 0x7fffffff;
	};
}

const random = seededRandom(42);

const southAfricanFirstNames = [
	'Amahle',
	'Lethabo',
	'Noxolo',
	'Thandiwe',
	'Neo',
	'Karabo',
	'Tumelo',
	'Kholifat',
	'Amina',
	'Zanele',
	'Nompumelelo',
	'Nonkululeko',
	'Nomvula',
	'Thembeka',
	'Nothando',
	'Lindiwe',
	'Sibongile',
	'Khethiwe',
	'Nomfundo',
	'Ayanda',
	'Lethabo',
	'Kgoshi',
	'Thabo',
	'Tshepo',
	'Themba',
	'Sibusiso',
	'Mandla',
	'Siyabonga',
	'Bongani',
	'Sethu',
	'Philani',
	'Sizwe',
	'Andile',
	'Mlungisi',
	'Mluleki',
	'Neo',
	'Kagiso',
	'Bandile',
	'Nkosinathi',
	'Lindani',
	'Lerato',
	'Tshiamo',
	'Obakeng',
	'Kamogelo',
	'Retselisitsoe',
];

const southAfricanSurnames = [
	'Mokoena',
	'Nkosi',
	'Dlamini',
	'Ngema',
	'Mthembu',
	'Ndlovu',
	'Sibeko',
	'Mthethwa',
	'Zuma',
	'Buthelezi',
	'Khumalo',
	'Ngcobo',
	'Mhlongo',
	'Nxumalo',
	'Shabalala',
	'Mkhize',
	'Sithole',
	'Chetty',
	'Naidoo',
	'Pillay',
	'Reddy',
	'Govender',
	'Singh',
	'Moodley',
	'Van der Merwe',
	'Smith',
	'Jones',
	'Williams',
	'Brown',
	'Miller',
	'Davies',
	'Wilson',
];

const schools = [
	'Holy Cross College',
	'St. Johns College',
	'African Leadership Academy',
	'Pretoria Boys High School',
	'Parktown Boys High School',
	'Grey High School',
	'St. Andrews College',
	'Westerford High School',
	'Rustenburg Girls High',
	'King Edward VII School',
	'Hydepark High',
	'Roedean School',
	"St. Mary's DSG",
	'Knysna Girls High',
	'Queens College Boys High',
	'King Edward VI School',
	'York High School',
	'Gatesville High',
	'Salt River High',
	'Alexander Road High',
];

const subjects = [
	{ slug: 'mathematics', name: 'Mathematics', id: 1 },
	{ slug: 'physics', name: 'Physical Sciences', id: 2 },
	{ slug: 'life-sciences', name: 'Life Sciences', id: 3 },
	{ slug: 'geography', name: 'Geography', id: 4 },
	{ slug: 'history', name: 'History', id: 5 },
	{ slug: 'english', name: 'English FAL', id: 6 },
	{ slug: 'afrikaans', name: 'Afrikaans', id: 7 },
	{ slug: 'accounting', name: 'Accounting', id: 8 },
	{ slug: 'economics', name: 'Economics', id: 9 },
];

const topicsBySubject: Record<string, string[]> = {
	mathematics: [
		'Algebra',
		'Calculus',
		'Geometry',
		'Trigonometry',
		'Statistics',
		'Probability',
		'Functions',
		'Number Patterns',
	],
	physics: [
		'Newton Laws',
		'Momentum',
		'Waves',
		'Light',
		'Electricity',
		'Magnetism',
		'Heat',
		'Optics',
	],
	'life-sciences': [
		'Cell Biology',
		'Genetics',
		'Evolution',
		'Ecology',
		'Photosynthesis',
		'Human Reproduction',
	],
	geography: ['Map Work', 'Climate', 'Ecosystems', 'Hydrology', 'Geomorphology', 'Urbanization'],
	history: ['World War I', 'World War II', 'Cold War', 'Apartheid', 'Industrial Revolution'],
	english: ['Comprehension', 'Essay Writing', 'Poetry Analysis', 'Language Structures'],
	afrikaans: ['Leesbegrip', 'Opstel', 'Poësie', 'Taalstrukture'],
	accounting: ['Financial Statements', 'Budgeting', 'Inventory', 'Fixed Assets'],
	economics: ['Supply and Demand', 'Market Structures', 'Inflation', 'Unemployment'],
};

function generateUUID(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

function randomDate(daysBack: number): Date {
	const now = new Date();
	const past = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
	return new Date(past.getTime() + random() * (now.getTime() - past.getTime()));
}

function randomItem<T>(arr: T[]): T {
	return arr[Math.floor(random() * arr.length)];
}

function _weightedPick<T>(items: T[], weights: number[]): T {
	const total = weights.reduce((a, b) => a + b, 0);
	let r = random() * total;
	for (let i = 0; i < items.length; i++) {
		r -= weights[i];
		if (r <= 0) return items[i];
	}
	return items[items.length - 1];
}

function generateUsers(count: number): any[] {
	const users: any[] = [];
	const usedEmails = new Set<string>();

	for (let i = 0; i < count; i++) {
		const firstName = randomItem(southAfricanFirstNames);
		const lastName = randomItem(southAfricanSurnames);
		let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@lumni.ai`;

		if (usedEmails.has(email)) {
			email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${random() % 9999}@lumni.ai`;
		}
		usedEmails.add(email);

		const createdAt = randomDate(180);
		const isOnboarded = random() > 0.1;
		const hasCompletedOnboarding = isOnboarded ? random() > 0.2 : false;

		users.push({
			id: generateUUID(),
			name: `${firstName} ${lastName}`,
			email,
			emailVerified: true,
			image: null,
			role: 'user',
			isBlocked: false,
			twoFactorEnabled: false,
			hasCompletedOnboarding: hasCompletedOnboarding ? 1 : 0,
			school: randomItem([...schools, null, null, null]),
			avatarId: null,
			deletedAt: null,
			createdAt: createdAt.toISOString(),
			updatedAt: new Date().toISOString(),
			lastModifiedAt: new Date().toISOString(),
			localUpdatedAt: new Date().toISOString(),
			syncStatus: 'synced',
		});
	}

	return users;
}

function generateQuestionAttempts(userIds: string[], subjectIds: number[]): any[] {
	const attempts: any[] = [];

	for (const userId of userIds) {
		const numAttempts = Math.floor(random() * 150) + 20;

		for (let i = 0; i < numAttempts; i++) {
			const subjectId = randomItem(subjectIds);
			const subjectSlug = subjects.find((s) => s.id === subjectId)?.slug || 'mathematics';
			const topic = randomItem(topicsBySubject[subjectSlug] || ['General']);
			const isCorrect = random() > 0.35;

			attempts.push({
				id: generateUUID(),
				userId,
				questionId: generateUUID(),
				topic,
				isCorrect: isCorrect ? 1 : 0,
				responseTimeMs: Math.floor(random() * 60000) + 10000,
				nextReviewAt: randomDate(30).toISOString(),
				intervalDays: Math.floor(random() * 14) + 1,
				easeFactor: (2.1 + random() * 1.2).toFixed(2),
				attemptedAt: randomDate(90).toISOString(),
				syncVersion: 1,
				lastModifiedAt: new Date().toISOString(),
				localUpdatedAt: new Date().toISOString(),
				syncStatus: 'synced',
			});
		}
	}

	return attempts;
}

function generateStudySessions(userIds: string[], subjectIds: number[]): any[] {
	const sessions: any[] = [];

	for (const userId of userIds) {
		const numSessions = Math.floor(random() * 40) + 10;

		for (let i = 0; i < numSessions; i++) {
			const subjectId = randomItem(subjectIds);
			const subjectSlug = subjects.find((s) => s.id === subjectId)?.slug || 'mathematics';
			const topic = randomItem(topicsBySubject[subjectSlug] || ['General']);
			const duration = Math.floor(random() * 90) + 15;
			const questionsAttempted = Math.floor(random() * 25) + 5;
			const correctAnswers = Math.floor(questionsAttempted * (0.5 + random() * 0.45));

			const startedAt = randomDate(90);
			const completedAt = new Date(startedAt.getTime() + duration * 60000);
			const completed = random() > 0.1;

			sessions.push({
				id: generateUUID(),
				userId,
				subjectId,
				sessionType: randomItem(['quiz', 'flashcard', 'past-paper', 'ai-tutor']),
				topic,
				durationMinutes: duration,
				questionsAttempted: completed ? questionsAttempted : 0,
				correctAnswers: completed ? correctAnswers : 0,
				marksEarned: completed ? correctAnswers * 2 : 0,
				startedAt: startedAt.toISOString(),
				completedAt: completed ? completedAt.toISOString() : null,
				syncVersion: 1,
				lastModifiedAt: new Date().toISOString(),
				localUpdatedAt: new Date().toISOString(),
				syncStatus: 'synced',
			});
		}
	}

	return sessions;
}

function generateFlashcardDecks(userIds: string[], subjectIds: number[]): any[] {
	const decks: any[] = [];

	for (const userId of userIds.slice(0, Math.floor(userIds.length * 0.7))) {
		const numDecks = Math.floor(random() * 6) + 1;

		for (let i = 0; i < numDecks; i++) {
			const subjectId = randomItem(subjectIds);
			const subjectSlug = subjects.find((s) => s.id === subjectId)?.slug || 'mathematics';

			decks.push({
				id: generateUUID(),
				userId,
				name: `${randomItem(topicsBySubject[subjectSlug] || ['General'])} Flashcards`,
				description: `Study notes for ${subjectSlug}`,
				subjectId,
				cardCount: Math.floor(random() * 40) + 10,
				isPublic: random() > 0.9 ? 1 : 0,
				createdAt: randomDate(60).toISOString(),
				updatedAt: new Date().toISOString(),
				syncVersion: 1,
				lastModifiedAt: new Date().toISOString(),
				localUpdatedAt: new Date().toISOString(),
				syncStatus: 'synced',
			});
		}
	}

	return decks;
}

function generateFlashcardReviews(userIds: string[], _deckIds: string[]): any[] {
	const reviews: any[] = [];

	for (const userId of userIds.slice(0, Math.floor(userIds.length * 0.5))) {
		const numReviews = Math.floor(random() * 30) + 5;

		for (let i = 0; i < numReviews; i++) {
			const rating = Math.floor(random() * 5) + 1;

			reviews.push({
				id: generateUUID(),
				userId,
				flashcardId: generateUUID(),
				rating,
				intervalBefore: Math.floor(random() * 10) + 1,
				intervalAfter: rating >= 3 ? Math.floor(rating * 2.5) + 1 : 1,
				easeFactorBefore: (2.1 + random() * 0.8).toFixed(2),
				easeFactorAfter: (2.1 + random() * 0.8 + rating * 0.1).toFixed(2),
				reviewedAt: randomDate(30).toISOString(),
				syncVersion: 1,
				lastModifiedAt: new Date().toISOString(),
				localUpdatedAt: new Date().toISOString(),
				syncStatus: 'synced',
			});
		}
	}

	return reviews;
}

function generateQuizResults(userIds: string[], subjectIds: number[]): any[] {
	const results: any[] = [];

	for (const userId of userIds) {
		const numResults = Math.floor(random() * 25) + 5;

		for (let i = 0; i < numResults; i++) {
			const subjectId = randomItem(subjectIds);
			const subjectSlug = subjects.find((s) => s.id === subjectId)?.slug || 'mathematics';
			const topic = randomItem(topicsBySubject[subjectSlug] || ['General']);
			const totalQuestions = randomItem([10, 15, 20, 25, 30]);
			const percentage = Math.floor(random() * 60) + 40;
			const score = Math.floor((totalQuestions * percentage) / 100);

			results.push({
				id: generateUUID(),
				userId,
				quizId: `${subjectSlug}-${Math.floor(random() * 9000) + 1000}`,
				subjectId,
				topic,
				score,
				totalQuestions,
				percentage: percentage.toString(),
				timeTaken: totalQuestions * (30 + Math.floor(random() * 60)),
				completedAt: randomDate(60).toISOString(),
				syncVersion: 1,
				lastModifiedAt: new Date().toISOString(),
				localUpdatedAt: new Date().toISOString(),
				syncStatus: 'synced',
			});
		}
	}

	return results;
}

function generateTopicMasteries(userIds: string[], subjectIds: number[]): any[] {
	const masteries: any[] = [];

	for (const userId of userIds) {
		for (const subjectId of subjectIds) {
			const subjectSlug = subjects.find((s) => s.id === subjectId)?.slug || 'mathematics';
			const topics = topicsBySubject[subjectSlug] || ['General'];
			const numTopics = Math.floor(random() * 8) + 3;
			const selectedTopics = [...topics].sort(() => random() - 0.5).slice(0, numTopics);

			for (const topic of selectedTopics) {
				const questionsAttempted = Math.floor(random() * 50) + 10;
				const questionsCorrect = Math.floor(questionsAttempted * (0.4 + random() * 0.55));
				const masteryLevel = Math.floor((questionsCorrect / questionsAttempted) * 100).toString();

				masteries.push({
					id: generateUUID(),
					userId,
					subjectId,
					topic,
					masteryLevel,
					questionsAttempted,
					questionsCorrect,
					averageTimeSeconds: Math.floor(random() * 120) + 30,
					lastPracticed: randomDate(30).toISOString(),
					nextReview: randomDate(14).toISOString(),
					consecutiveCorrect: Math.floor(random() * 10),
					createdAt: randomDate(90).toISOString(),
					updatedAt: new Date().toISOString(),
					syncVersion: 1,
					lastModifiedAt: new Date().toISOString(),
					localUpdatedAt: new Date().toISOString(),
					syncStatus: 'synced',
				});
			}
		}
	}

	return masteries;
}

function generateUserProgress(userIds: string[], subjectIds: number[]): any[] {
	const progress: any[] = [];

	for (const userId of userIds) {
		const subjectId = randomItem(subjectIds);
		const totalQuestionsAttempted = Math.floor(random() * 1000) + 100;
		const totalCorrect = Math.floor(totalQuestionsAttempted * (0.5 + random() * 0.4));
		const streakDays = Math.floor(random() * 30);
		const bestStreak = Math.max(streakDays, Math.floor(random() * 45));
		const consecutiveLoginDays = Math.floor(random() * 20);

		progress.push({
			id: generateUUID(),
			userId,
			subjectId,
			topic: null,
			totalQuestionsAttempted,
			totalCorrect,
			totalMarksEarned: totalCorrect * 2,
			streakDays,
			bestStreak,
			streakFreezes: Math.floor(random() * 3),
			lastLoginBonusAt: randomDate(7).toISOString(),
			consecutiveLoginDays,
			totalLoginBonusesClaimed: consecutiveLoginDays,
			lastActivityAt: randomDate(3).toISOString(),
			createdAt: randomDate(120).toISOString(),
			updatedAt: new Date().toISOString(),
			syncVersion: 1,
			lastModifiedAt: new Date().toISOString(),
			localUpdatedAt: new Date().toISOString(),
			syncStatus: 'synced',
		});
	}

	return progress;
}

function generateAchievements(userIds: string[]): any[] {
	const achievementTemplates = [
		{ id: 'first-perfect-score', title: 'Perfect Score', icon: 'award' },
		{ id: 'streak-7', title: 'Week Warrior', icon: 'flame' },
		{ id: 'streak-30', title: 'Month Master', icon: 'crown' },
		{ id: 'topics-10', title: 'Topic Explorer', icon: 'compass' },
		{ id: 'questions-100', title: 'Century Club', icon: 'trophy' },
		{ id: 'questions-500', title: 'Quiz Pro', icon: 'star' },
		{ id: 'questions-1000', title: 'Quiz Master', icon: 'medal' },
		{ id: 'accuracy-80', title: 'Sharp Shooter', icon: 'target' },
		{ id: 'first-buddy', title: 'Social Butterfly', icon: 'users' },
		{ id: 'flashcard-50', title: 'Flashcard Fanatic', icon: 'cards' },
	];

	const achievements: any[] = [];

	for (const userId of userIds) {
		const numAchievements = Math.floor(random() * 6) + 2;
		const shuffled = [...achievementTemplates].sort(() => random() - 0.5);

		for (let i = 0; i < numAchievements && i < shuffled.length; i++) {
			const template = shuffled[i];

			achievements.push({
				id: generateUUID(),
				userId,
				achievementId: template.id,
				title: template.title,
				description: `Earned achievement: ${template.title}`,
				icon: template.icon,
				unlockedAt: randomDate(60).toISOString(),
				syncVersion: 1,
				lastModifiedAt: new Date().toISOString(),
				localUpdatedAt: new Date().toISOString(),
				syncStatus: 'synced',
			});
		}
	}

	return achievements;
}

function generateCalendarEvents(userIds: string[]): any[] {
	const events: any[] = [];
	const eventTypes = ['study', 'exam', 'reminder', 'milestone'];

	for (const userId of userIds) {
		const numEvents = Math.floor(random() * 15) + 3;

		for (let i = 0; i < numEvents; i++) {
			const eventType = randomItem(eventTypes);
			const startTime = randomDate(30);
			const duration = randomItem([30, 60, 90, 120]);
			const endTime = new Date(startTime.getTime() + duration * 60000);

			events.push({
				id: generateUUID(),
				userId,
				title: `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} Session`,
				description: `Scheduled ${eventType} activity`,
				eventType,
				subjectId: Math.floor(random() * 9) + 1,
				startTime: startTime.toISOString(),
				endTime: endTime.toISOString(),
				isAllDay: random() > 0.8 ? 1 : 0,
				location: null,
				reminderMinutes: random() > 0.5 ? '15' : null,
				recurrenceRule: null,
				examId: eventType === 'exam' ? generateUUID() : null,
				lessonId: null,
				studyPlanId: null,
				isCompleted: random() > 0.4 ? 1 : 0,
				createdAt: randomDate(60).toISOString(),
				updatedAt: new Date().toISOString(),
				syncVersion: 1,
				lastModifiedAt: new Date().toISOString(),
				localUpdatedAt: new Date().toISOString(),
				syncStatus: 'synced',
			});
		}
	}

	return events;
}

function generateNotifications(userIds: string[]): any[] {
	const notifications: any[] = [];
	const types = ['achievement', 'study_reminder', 'social', 'system'];

	for (const userId of userIds) {
		const numNotifications = Math.floor(random() * 20) + 5;

		for (let i = 0; i < numNotifications; i++) {
			const type = randomItem(types);

			notifications.push({
				id: generateUUID(),
				userId,
				type,
				title:
					type === 'achievement'
						? 'Achievement Unlocked!'
						: type === 'study_reminder'
							? 'Time to Study!'
							: type === 'social'
								? 'New Activity'
								: 'System Update',
				message: `Notification message ${i + 1}`,
				data: null,
				isRead: random() > 0.4 ? 1 : 0,
				readAt: random() > 0.4 ? randomDate(7).toISOString() : null,
				createdAt: randomDate(14).toISOString(),
				syncVersion: 1,
				lastModifiedAt: new Date().toISOString(),
				localUpdatedAt: new Date().toISOString(),
				syncStatus: 'synced',
			});
		}
	}

	return notifications;
}

function generateStudyBuddies(userIds: string[]): any[] {
	const buddies: any[] = [];
	const usedPairs = new Set<string>();

	for (const userId of userIds) {
		const numBuddies = Math.floor(random() * 4);

		for (let i = 0; i < numBuddies; i++) {
			const otherUserId = randomItem(userIds.filter((id) => id !== userId));
			const pairKey = [userId, otherUserId].sort().join('-');

			if (!usedPairs.has(pairKey)) {
				usedPairs.add(pairKey);
				buddies.push({
					id: generateUUID(),
					userId1: userId,
					userId2: otherUserId,
					createdAt: randomDate(45).toISOString(),
					syncVersion: 1,
					lastModifiedAt: new Date().toISOString(),
					localUpdatedAt: new Date().toISOString(),
					syncStatus: 'synced',
				});
			}
		}
	}

	return buddies;
}

function generateAIConversations(userIds: string[]): any[] {
	const conversations: any[] = [];
	const topics = ['mathematics', 'physics', 'chemistry', 'biology', 'history', 'geography'];

	for (const userId of userIds.slice(0, Math.floor(userIds.length * 0.6))) {
		const numConversations = Math.floor(random() * 8) + 1;

		for (let i = 0; i < numConversations; i++) {
			const subject = randomItem(topics);
			const messageCount = Math.floor(random() * 10) + 3;
			const messages = JSON.stringify([
				{
					role: 'user',
					content: `Help me understand ${subject}`,
					timestamp: randomDate(30).toISOString(),
				},
				{
					role: 'assistant',
					content: `Here's an explanation of ${subject}...`,
					timestamp: randomDate(30).toISOString(),
				},
			]);

			conversations.push({
				id: generateUUID(),
				userId,
				title: `${subject} tutoring session`,
				subject,
				messages,
				messageCount,
				createdAt: randomDate(45).toISOString(),
				updatedAt: new Date().toISOString(),
				syncVersion: 1,
				lastModifiedAt: new Date().toISOString(),
				localUpdatedAt: new Date().toISOString(),
				syncStatus: 'synced',
			});
		}
	}

	return conversations;
}

function generateLeaderboardEntries(userIds: string[]): any[] {
	const entries: any[] = [];
	const periods = ['daily', 'weekly', 'monthly'];
	const now = new Date();

	for (const period of periods) {
		const periodStart = new Date(now);
		if (period === 'daily') periodStart.setHours(0, 0, 0, 0);
		else if (period === 'weekly') periodStart.setDate(periodStart.getDate() - periodStart.getDay());
		else periodStart.setDate(1);

		const shuffledUsers = [...userIds].sort(() => random() - 0.5);
		const topCount = Math.min(50, shuffledUsers.length);

		for (let rank = 0; rank < topCount; rank++) {
			const userId = shuffledUsers[rank];

			entries.push({
				id: generateUUID(),
				userId,
				periodType: period,
				periodStart: periodStart.toISOString(),
				totalPoints: Math.floor((topCount - rank) * 10 + random() * 50),
				rank: rank + 1,
				questionsCompleted: Math.floor(random() * 50) + 10,
				accuracyPercentage: Math.floor(random() * 40) + 60,
				updatedAt: new Date().toISOString(),
				syncVersion: 1,
				lastModifiedAt: new Date().toISOString(),
				localUpdatedAt: new Date().toISOString(),
				syncStatus: 'synced',
			});
		}
	}

	return entries;
}

async function enrichDatabase(config: EnrichmentConfig) {
	console.log('🚀 Starting enriched database generation...\n');
	console.log('Configuration:');
	console.log(`  - Users: ${config.userCount}`);
	console.log(`  - Days: ${config.daysBack}`);
	console.log(`  - Intensity: ${config.intensity}`);
	console.log('');

	await dbManagerV2.initialize();
	const activeDb = dbManagerV2.getActiveDatabase();
	const db = (await dbManagerV2.getDbRaw()) as any;

	console.log(`📡 Active Database: ${activeDb}`);

	const getTable = (name: string) => {
		const mapping = syncTableRegistry.find((m: { tableName: string }) => m.tableName === name);
		if (!mapping) throw new Error(`Table mapping not found for: ${name}`);
		return activeDb === 'sqlite' ? mapping.sqliteTable : mapping.pgTable;
	};

	const _subjectsTable = getTable('subjects');
	const usersTable = getTable('users');
	const questionAttemptsTable = getTable('question_attempts');
	const studySessionsTable = getTable('study_sessions');
	const flashcardDecksTable = getTable('flashcard_decks');
	const _flashcardsTable = getTable('flashcards');
	const flashcardReviewsTable = getTable('flashcard_reviews');
	const quizResultsTable = getTable('quiz_results');
	const topicMasteryTable = getTable('topic_mastery');
	const userProgressTable = getTable('user_progress');
	const userAchievementsTable = getTable('user_achievements');
	const calendarEventsTable = getTable('calendar_events');
	const notificationsTable = getTable('notifications');
	const studyBuddiesTable = getTable('study_buddies');
	const aiConversationsTable = getTable('ai_conversations');
	const leaderboardEntriesTable = getTable('leaderboard_entries');

	try {
		console.log('📊 Generating mock data...');

		const users = generateUsers(config.userCount);
		console.log(`  - Generated ${users.length} users`);

		const subjectIds = subjects.map((s) => s.id);

		const questionAttempts = generateQuestionAttempts(
			users.map((u) => u.id),
			subjectIds
		);
		console.log(`  - Generated ${questionAttempts.length} question attempts`);

		const studySessions = generateStudySessions(
			users.map((u) => u.id),
			subjectIds
		);
		console.log(`  - Generated ${studySessions.length} study sessions`);

		const flashcardDecks = generateFlashcardDecks(
			users.map((u) => u.id),
			subjectIds
		);
		console.log(`  - Generated ${flashcardDecks.length} flashcard decks`);

		const flashcardReviews = generateFlashcardReviews(
			users.map((u) => u.id),
			flashcardDecks.map((d) => d.id)
		);
		console.log(`  - Generated ${flashcardReviews.length} flashcard reviews`);

		const quizResults = generateQuizResults(
			users.map((u) => u.id),
			subjectIds
		);
		console.log(`  - Generated ${quizResults.length} quiz results`);

		const topicMasteries = generateTopicMasteries(
			users.map((u) => u.id),
			subjectIds
		);
		console.log(`  - Generated ${topicMasteries.length} topic masteries`);

		const userProgress = generateUserProgress(
			users.map((u) => u.id),
			subjectIds
		);
		console.log(`  - Generated ${userProgress.length} user progress records`);

		const achievements = generateAchievements(users.map((u) => u.id));
		console.log(`  - Generated ${achievements.length} achievements`);

		const calendarEvents = generateCalendarEvents(users.map((u) => u.id));
		console.log(`  - Generated ${calendarEvents.length} calendar events`);

		const notifications = generateNotifications(users.map((u) => u.id));
		console.log(`  - Generated ${notifications.length} notifications`);

		const studyBuddies = generateStudyBuddies(users.map((u) => u.id));
		console.log(`  - Generated ${studyBuddies.length} study buddy connections`);

		const aiConversations = generateAIConversations(users.map((u) => u.id));
		console.log(`  - Generated ${aiConversations.length} AI conversations`);

		const leaderboardEntries = generateLeaderboardEntries(users.map((u) => u.id));
		console.log(`  - Generated ${leaderboardEntries.length} leaderboard entries`);

		const BATCH_SIZE = 1000;

		async function insertInBatches(table: any, data: any[], tableName: string) {
			const total = data.length;
			let inserted = 0;
			for (let i = 0; i < total; i += BATCH_SIZE) {
				const batch = data.slice(i, i + BATCH_SIZE);
				await db.insert(table).values(batch).onConflictDoNothing();
				inserted += batch.length;
				console.log(`    ${tableName}: ${inserted}/${total}`);
			}
		}

		console.log('\n💾 Writing to database...');

		console.log('  - Inserting users...');
		await insertInBatches(usersTable, users, 'users');

		console.log('  - Inserting question attempts...');
		await insertInBatches(questionAttemptsTable, questionAttempts, 'attempts');

		console.log('  - Inserting study sessions...');
		await insertInBatches(studySessionsTable, studySessions, 'sessions');

		console.log('  - Inserting flashcard decks...');
		await insertInBatches(flashcardDecksTable, flashcardDecks, 'decks');

		console.log('  - Inserting flashcard reviews...');
		await insertInBatches(flashcardReviewsTable, flashcardReviews, 'reviews');

		console.log('  - Inserting quiz results...');
		await insertInBatches(quizResultsTable, quizResults, 'quizResults');

		console.log('  - Inserting topic masteries...');
		await insertInBatches(topicMasteryTable, topicMasteries, 'masteries');

		console.log('  - Inserting user progress...');
		await insertInBatches(userProgressTable, userProgress, 'progress');

		console.log('  - Inserting achievements...');
		await insertInBatches(userAchievementsTable, achievements, 'achievements');

		console.log('  - Inserting calendar events...');
		await insertInBatches(calendarEventsTable, calendarEvents, 'events');

		console.log('  - Inserting notifications...');
		await insertInBatches(notificationsTable, notifications, 'notifications');

		console.log('  - Inserting study buddies...');
		await insertInBatches(studyBuddiesTable, studyBuddies, 'buddies');

		console.log('  - Inserting AI conversations...');
		await insertInBatches(aiConversationsTable, aiConversations, 'conversations');

		console.log('  - Inserting leaderboard entries...');
		await insertInBatches(leaderboardEntriesTable, leaderboardEntries, 'leaderboard');

		console.log('\n✅ Database enrichment completed successfully!');

		const totalRecords =
			users.length +
			questionAttempts.length +
			studySessions.length +
			flashcardDecks.length +
			flashcardReviews.length +
			quizResults.length +
			topicMasteries.length +
			userProgress.length +
			achievements.length +
			calendarEvents.length +
			notifications.length +
			studyBuddies.length +
			aiConversations.length +
			leaderboardEntries.length;

		console.log(`\n📈 Total records inserted: ${totalRecords.toLocaleString()}`);
	} catch (error) {
		console.error('❌ Error during enrichment:', error);
		throw error;
	}
}

async function main() {
	const config: EnrichmentConfig = {
		seed: 42,
		userCount: 500,
		daysBack: 180,
		intensity: 'high',
	};

	await enrichDatabase(config);
}

main().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
