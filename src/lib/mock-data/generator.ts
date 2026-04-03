import {
	type ActivityIntensity,
	activityConfig,
	type DateRange,
	distributeOverPeriod,
	generateDateRange,
	scoreDistribution,
	sessionDurationDistribution,
	timePerQuestionDistribution,
} from './distributions';
import {
	achievementTemplates,
	femaleFirstNames,
	maleFirstNames,
	neutralFirstNames,
	subjects,
	topicsBySubject,
} from './name-pools';
import { SeededRandom } from './seeded-random';

export interface MockDataConfig {
	seed: number;
	userCount: number;
	monthsBack: number;
	intensity: ActivityIntensity;
}

export interface GeneratedUser {
	id: string;
	email: string;
	name: string;
	createdAt: Date;
}

export interface GeneratedQuizResult {
	id: string;
	userId: string;
	quizId: string;
	subjectId: number;
	subjectSlug: string;
	topic: string;
	score: number;
	totalQuestions: number;
	percentage: number;
	timeTaken: number;
	completedAt: Date;
	source: 'quiz' | 'past-paper' | 'flashcard';
	isReviewMode: boolean;
}

export interface GeneratedStudySession {
	id: string;
	userId: string;
	subjectId: number;
	sessionType: string;
	topic?: string;
	durationMinutes: number;
	questionsAttempted: number;
	correctAnswers: number;
	marksEarned: number;
	startedAt: Date;
	completedAt: Date;
}

export interface GeneratedUserProgress {
	id: string;
	userId: string;
	subjectId: number;
	topic: string;
	totalQuestionsAttempted: number;
	totalCorrect: number;
	streakDays: number;
	bestStreak: number;
	lastActivityAt: Date;
}

export interface GeneratedTopicMastery {
	id: string;
	userId: string;
	subjectId: number;
	topic: string;
	masteryLevel: number;
	questionsAttempted: number;
	questionsCorrect: number;
	consecutiveCorrect: number;
	lastPracticed: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface GeneratedAchievement {
	id: string;
	userId: string;
	achievementId: string;
	title: string;
	description: string;
	icon: string;
	unlockedAt: Date;
}

export class MockDataGenerator {
	private rng: SeededRandom;
	private config: MockDataConfig;
	private dateRange: DateRange;
	private activityDates: Map<string, Date[]> = new Map();
	private userIds: string[] = [];
	private subjectIds: Map<string, number> = new Map();

	constructor(config: Partial<MockDataConfig> = {}) {
		this.config = {
			seed: config.seed ?? Math.floor(Math.random() * 999999),
			userCount: config.userCount ?? 100,
			monthsBack: config.monthsBack ?? 6,
			intensity: config.intensity ?? 'high',
		};
		this.rng = new SeededRandom(this.config.seed);
		this.dateRange = generateDateRange(this.rng, this.config.monthsBack, this.config.intensity);
	}

	getConfig(): MockDataConfig {
		return { ...this.config };
	}

	setSubjectIds(ids: Map<string, number>): void {
		this.subjectIds = ids;
	}

	generateUsers(count?: number): GeneratedUser[] {
		const targetCount = count ?? this.config.userCount;
		const users: GeneratedUser[] = [];

		const _allFirstNames = [...maleFirstNames, ...femaleFirstNames, ...neutralFirstNames];

		for (let i = 0; i < targetCount; i++) {
			const genderRand = this.rng.next();
			let firstName: string;
			if (genderRand < 0.48) {
				firstName = this.rng.pick(maleFirstNames);
			} else if (genderRand < 0.95) {
				firstName = this.rng.pick(femaleFirstNames);
			} else {
				firstName = this.rng.pick(neutralFirstNames);
			}

			const lastName = this.rng.pick(surnames);
			const name = `${firstName} ${lastName}`;
			const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@lumni.ai`;

			const createdAtOffset = this.rng.next() * this.config.monthsBack * 25;
			const createdAt = new Date(this.dateRange.start);
			createdAt.setDate(createdAt.getDate() + Math.floor(createdAtOffset));

			users.push({
				id: this.rng.uuid(),
				email,
				name,
				createdAt,
			});
		}

		this.userIds = users.map((u) => u.id);
		return users;
	}

	generateQuizResults(userId: string, subjectCount: number): GeneratedQuizResult[] {
		if (!this.activityDates.has(userId)) {
			this.activityDates.set(
				userId,
				distributeOverPeriod(this.rng, this.dateRange, this.config.intensity)
			);
		}

		const dates = this.activityDates.get(userId)!;
		const results: GeneratedQuizResult[] = [];

		const subjectList = subjects.slice(0, subjectCount);
		const subjectWeights = subjectList.map((s) => s.weight);

		const questionCounts = [10, 15, 20, 25, 30];

		for (let i = 0; i < dates.length; i++) {
			const date = dates[i];
			const subject = this.rng.pickWeighted(subjectList, subjectWeights);
			const subjectSlug = subject.slug;
			const availableTopics = topicsBySubject[subjectSlug] ?? topics;

			const result: GeneratedQuizResult = {
				id: this.rng.uuid(),
				userId,
				quizId: `${subjectSlug}-${this.rng.nextInt(1000, 9999)}`,
				subjectId: this.subjectIds.get(subjectSlug) ?? 1,
				subjectSlug,
				topic: this.rng.pick(availableTopics),
				score: 0,
				totalQuestions: this.rng.pick(questionCounts),
				percentage: 0,
				timeTaken: 0,
				completedAt: date,
				source: this.rng.pickWeighted(
					['quiz', 'past-paper', 'flashcard'] as const,
					[0.7, 0.2, 0.1]
				),
				isReviewMode: this.rng.boolean(0.1),
			};

			const scoreResult = scoreDistribution(this.rng);
			result.percentage = scoreResult;
			result.score = Math.round((result.totalQuestions * scoreResult) / 100);

			const totalTime = result.totalQuestions * timePerQuestionDistribution(this.rng);
			result.timeTaken = totalTime + this.rng.nextInt(-60, 60);

			results.push(result);
		}

		return results;
	}

	generateStudySession(userId: string): GeneratedStudySession {
		const subjectList = subjects.slice(0, 6);
		const subjectWeights = subjectList.map((s) => s.weight);

		const sessionType = this.rng.pickWeighted(
			sessionTypes as unknown as string[],
			sessionTypeWeights
		) as string;

		const subject = this.rng.pickWeighted(subjectList, subjectWeights);
		const subjectSlug = subject.slug;
		const availableTopics = topicsBySubject[subjectSlug] ?? topics;

		const config = activityConfig[this.config.intensity];
		const duration = sessionDurationDistribution(this.rng, config);

		const questionsAttempted = this.rng.nextInt(5, 30);
		const accuracy = scoreDistribution(this.rng, 65, 20) / 100;
		const correctAnswers = Math.round(questionsAttempted * accuracy);

		const startedAt = new Date();
		startedAt.setTime(
			this.dateRange.start.getTime() +
				this.rng.next() * (this.dateRange.end.getTime() - this.dateRange.start.getTime())
		);
		startedAt.setMinutes(startedAt.getMinutes() - duration);

		const completedAt = new Date(startedAt);
		completedAt.setMinutes(completedAt.getMinutes() + duration);

		const completed = this.rng.next() < config.completionRate;

		return {
			id: this.rng.uuid(),
			userId,
			subjectId: this.subjectIds.get(subjectSlug) ?? 1,
			sessionType,
			topic: this.rng.pick(availableTopics),
			durationMinutes: duration,
			questionsAttempted: completed ? questionsAttempted : 0,
			correctAnswers: completed ? correctAnswers : 0,
			marksEarned: completed ? correctAnswers * 2 : 0,
			startedAt,
			completedAt: completed ? completedAt : null!,
		};
	}

	generateTopicMastery(
		userId: string,
		subjectId: number,
		subjectSlug: string
	): GeneratedTopicMastery[] {
		const availableTopics = topicsBySubject[subjectSlug] ?? topics;
		const topicMasteries: GeneratedTopicMastery[] = [];

		const sampleTopics = this.rng.shuffle(availableTopics).slice(0, 8);

		for (const topic of sampleTopics) {
			const masteryLevel = this.rng.nextFloat(10, 95);
			const questionsAttempted = this.rng.nextInt(10, 50);
			const questionsCorrect = Math.round(questionsAttempted * (masteryLevel / 100));
			const consecutiveCorrect = Math.round(masteryLevel / 20);

			const lastPracticed = new Date();
			lastPracticed.setTime(
				this.dateRange.start.getTime() +
					this.rng.next() * (this.dateRange.end.getTime() - this.dateRange.start.getTime())
			);

			topicMasteries.push({
				id: this.rng.uuid(),
				userId,
				subjectId,
				topic,
				masteryLevel: Math.round(masteryLevel * 100) / 100,
				questionsAttempted,
				questionsCorrect,
				consecutiveCorrect,
				lastPracticed,
				createdAt: new Date(this.dateRange.start),
				updatedAt: lastPracticed,
			});
		}

		return topicMasteries;
	}

	generateAchievements(userId: string): GeneratedAchievement[] {
		const achievements: GeneratedAchievement[] = [];
		const shuffled = this.rng.shuffle([...achievementTemplates]);
		const count = this.rng.nextInt(3, 8);

		for (let i = 0; i < count && i < shuffled.length; i++) {
			const template = shuffled[i];
			const datePercent = this.rng.next();
			const date = new Date(this.dateRange.start);
			date.setTime(
				date.getTime() +
					datePercent * (this.dateRange.end.getTime() - this.dateRange.start.getTime())
			);

			achievements.push({
				id: this.rng.uuid(),
				userId,
				achievementId: template.id,
				title: template.title,
				description: template.description,
				icon: template.icon,
				unlockedAt: date,
			});
		}

		return achievements;
	}

	getUserIds(): string[] {
		return this.userIds;
	}

	reset(seed?: number): void {
		if (seed !== undefined) {
			this.config.seed = seed;
		}
		this.rng = new SeededRandom(this.config.seed);
		this.dateRange = generateDateRange(this.rng, this.config.monthsBack, this.config.intensity);
		this.activityDates.clear();
		this.userIds = [];
	}
}

export const createMockDataGenerator = (config?: Partial<MockDataConfig>): MockDataGenerator => {
	return new MockDataGenerator(config);
};

export const generateAllMockData = async (
	config?: Partial<MockDataConfig>
): Promise<{
	users: GeneratedUser[];
	quizResults: GeneratedQuizResult[];
	studySessions: GeneratedStudySession[];
	topicMasteries: GeneratedTopicMastery[];
	achievements: GeneratedAchievement[];
}> => {
	const generator = createMockDataGenerator(config);
	const result: ReturnType<typeof generateAllMockData> = {
		users: [],
		quizResults: [],
		studySessions: [],
		topicMasteries: [],
		achievements: [],
	};

	result.users = generator.generateUsers();
	const userIds = generator.getUserIds();

	for (const userId of userIds) {
		const quizResults = generator.generateQuizResults(userId, 6);
		result.quizResults.push(...quizResults);

		const sessionCount = Math.floor(
			activityConfig[config?.intensity ?? 'high'].weeklySessions.min / 4
		);
		for (let i = 0; i < sessionCount; i++) {
			result.studySessions.push(generator.generateStudySession(userId));
		}

		const topicMasteries = generator.generateTopicMastery(userId, 1, 'mathematics');
		result.topicMasteries.push(...topicMasteries);

		result.achievements.push(...generator.generateAchievements(userId));
	}

	return result;
};
