// ============================================================================
// GENERATOR V2 - Enhanced Mock Data Generator for Enriched App Prototype
// ============================================================================
// Extends the existing MockDataGenerator with:
// 1. Profile-based generation (Diligent, Struggling, etc.)
// 2. Flashcard review generation (SM-2 spaced repetition)
// 3. Activity timeline generation (combined, sorted by date)
// 4. Aging simulation (mastery improves/degrades over time)
// 5. Export/Import config serialization
// 6. Feature flag integration
// 7. Data source tagging on all records
// ============================================================================

import type { DistributionConfig, EnrichmentConfig, UserProfileConfig } from '../enrichment/config';
import { defaultEnrichmentConfig, profileDistribution } from '../enrichment/default-config';
import {
	type GeneratedAchievement,
	type GeneratedQuizResult,
	type GeneratedStudySession,
	type GeneratedTopicMastery,
	type GeneratedUser,
	MockDataGenerator,
} from './generator';
import type { SeededRandom } from './seeded-random';

// ============================================================================
// PROFILE-BASED TYPES
// ============================================================================

export interface ProfileAssignment {
	userId: string;
	profileName: string;
}

export interface ProfileMap {
	[profileName: string]: UserProfileConfig;
}

// ============================================================================
// FLASHCARD REVIEW TYPES (SM-2 Spaced Repetition)
// ============================================================================

export interface FlashcardReview {
	id: string;
	userId: string;
	cardId: string;
	deckId: string;
	rating: 1 | 2 | 3 | 4 | 5; // SM-2: 1=again, 2=hard, 3=good, 4=easy, 5=perfect
	interval: number; // days until next review
	easeFactor: number; // SM-2 ease factor (default 2.5, min 1.3)
	reviewedAt: Date;
	previousInterval: number; // interval before this review
	consecutiveCorrect: number; // lapses counter
}

export interface FlashcardDeck {
	id: string;
	userId: string;
	subject: string;
	title: string;
	cardCount: number;
	newCards: number;
	dueCards: number;
	youngCards: number;
	matureCards: number;
	createdAt: Date;
}

// ============================================================================
// ACTIVITY TIMELINE TYPES
// ============================================================================

export type ActivityType = 'quiz' | 'flashcard' | 'study-session';

export interface TimelineEntry {
	id: string;
	userId: string;
	type: ActivityType;
	date: Date;
	// Common fields
	subject?: string;
	topic?: string;
	durationMinutes?: number;
	// Quiz-specific
	score?: number;
	totalQuestions?: number;
	percentage?: number;
	// Flashcard-specific
	cardsReviewed?: number;
	averageRating?: number;
	// Study session-specific
	questionsAttempted?: number;
	correctAnswers?: number;
	// Metadata
	dataSource: 'mock';
	dataQuality: 'high';
	enrichedAt: Date;
}

// ============================================================================
// AGING SIMULATION TYPES
// ============================================================================

export interface AgingResult {
	masteryLevel: number;
	questionsAttempted: number;
	questionsCorrect: number;
	consecutiveCorrect: number;
	lastPracticed: Date;
	decayFactor: number; // 0-1, how much mastery decayed
}

// ============================================================================
// EXPORT/IMPORT TYPES
// ============================================================================

export interface ExportedConfig {
	version: '2.0';
	generatorConfig: {
		seed: number;
		userCount: number;
		monthsBack: number;
		intensity: string;
	};
	enrichmentConfig: EnrichmentConfig;
	mockDataEnabled: boolean;
	exportedAt: string;
}

// ============================================================================
// DATA SOURCE TAGGING
// ============================================================================

export interface DataSourceTag {
	dataSource: 'mock';
	dataQuality: 'high';
	enrichedAt: Date;
}

/**
 * Apply data source tagging to any generated record.
 */
export function tagDataSource<T extends object>(record: T): T & DataSourceTag {
	return {
		...record,
		dataSource: 'mock' as const,
		dataQuality: 'high' as const,
		enrichedAt: new Date(),
	};
}

// ============================================================================
// ENHANCED GENERATOR V2 CLASS
// ============================================================================

export class MockDataGeneratorV2 extends MockDataGenerator {
	private enrichmentConfig: EnrichmentConfig;
	private profileMap: ProfileMap;
	private profileAssignments: ProfileAssignment[] = [];
	private mockDataEnabled: boolean;

	constructor(
		enrichmentConfig: EnrichmentConfig = defaultEnrichmentConfig,
		generatorConfig: {
			seed?: number;
			userCount?: number;
			monthsBack?: number;
			intensity?: 'low' | 'medium' | 'high';
		} = {}
	) {
		super({
			seed: generatorConfig.seed ?? enrichmentConfig.seed,
			userCount: generatorConfig.userCount ?? enrichmentConfig.userCount,
			monthsBack: generatorConfig.monthsBack ?? enrichmentConfig.monthsOfActivity,
			intensity: generatorConfig.intensity ?? 'high',
		});
		this.enrichmentConfig = enrichmentConfig;
		this.profileMap = this.buildProfileMap(enrichmentConfig.profiles);
		this.mockDataEnabled = process.env.ENABLE_MOCK_DATA !== 'false';
	}

	// ========================================================================
	// 1. PROFILE-BASED GENERATION
	// ========================================================================

	/**
	 * Build a lookup map from profile name to UserProfileConfig.
	 */
	private buildProfileMap(profiles: UserProfileConfig[]): ProfileMap {
		const map: ProfileMap = {};
		for (const profile of profiles) {
			map[profile.name] = profile;
		}
		return map;
	}

	/**
	 * Assign a profile to a user based on profile distribution weights.
	 */
	private assignProfile(): UserProfileConfig {
		const profileNames = Object.keys(profileDistribution);
		const weights = profileNames.map((name) => profileDistribution[name] ?? 0);
		const selectedName = this.getRng().pickWeighted(profileNames, weights);
		return this.profileMap[selectedName] ?? this.profileMap.Average!;
	}

	/**
	 * Generate users with profile assignments. Each user gets assigned a profile
	 * according to the profile distribution weights.
	 */
	generateUsersWithProfiles(count?: number): {
		users: GeneratedUser[];
		assignments: ProfileAssignment[];
	} {
		const users = this.generateUsers(count);
		this.profileAssignments = [];

		for (const user of users) {
			const profile = this.assignProfile();
			this.profileAssignments.push({
				userId: user.id,
				profileName: profile.name,
			});
		}

		return { users, assignments: this.profileAssignments };
	}

	/**
	 * Get the profile assigned to a specific user.
	 */
	getUserProfile(userId: string): UserProfileConfig | undefined {
		const assignment = this.profileAssignments.find((a) => a.userId === userId);
		if (!assignment) return undefined;
		return this.profileMap[assignment.profileName];
	}

	/**
	 * Generate quiz results weighted by the user's assigned profile.
	 * Uses profile's accuracyDistribution and subjectWeights.
	 */
	generateQuizResultsForProfile(userId: string, subjectCount: number): GeneratedQuizResult[] {
		const profile = this.getUserProfile(userId);
		if (!profile) {
			// Fallback to base generator behavior
			return this.generateQuizResults(userId, subjectCount);
		}

		const baseResults = this.generateQuizResults(userId, subjectCount);

		return baseResults.map((result) => {
			// Apply profile's accuracy distribution
			const accuracySample = this.sampleFromDistribution(
				profile.accuracyDistribution,
				this.getRng()
			);
			const adjustedPercentage = Math.round(accuracySample * 100 * 100) / 100;
			const clampedPercentage = Math.max(0, Math.min(100, adjustedPercentage));

			return {
				...result,
				percentage: clampedPercentage,
				score: Math.round((result.totalQuestions * clampedPercentage) / 100),
			};
		});
	}

	/**
	 * Sample a value from a DistributionConfig using the seeded RNG.
	 */
	private sampleFromDistribution(config: DistributionConfig, rng: SeededRandom): number {
		switch (config.type) {
			case 'beta': {
				// Approximate beta sampling using gamma approximation
				const alpha = config.params.alpha ?? 1;
				const beta = config.params.beta ?? 1;
				const x = this.gammaSample(rng, alpha);
				const y = this.gammaSample(rng, beta);
				return x / (x + y);
			}
			case 'normal': {
				const mean = config.params.mean ?? 0;
				const std = config.params.std ?? 1;
				return rng.normal(mean, std);
			}
			case 'lognormal': {
				const mu = config.params.mu ?? 0;
				const sigma = config.params.sigma ?? 1;
				return rng.logNormal(mu, sigma);
			}
			case 'uniform': {
				const min = config.params.min ?? 0;
				const max = config.params.max ?? 1;
				return rng.nextFloat(min, max);
			}
			default:
				return rng.next();
		}
	}

	/**
	 * Approximate gamma distribution sampling using Marsaglia and Tsang's method.
	 */
	private gammaSample(rng: SeededRandom, shape: number): number {
		if (shape < 1) {
			return this.gammaSample(rng, shape + 1) * rng.next() ** (1 / shape);
		}
		const d = shape - 1 / 3;
		const c = 1 / Math.sqrt(9 * d);
		while (true) {
			let x: number;
			let v: number;
			do {
				x = rng.normal(0, 1);
				v = 1 + c * x;
			} while (v <= 0);
			v = v * v * v;
			const u = rng.next();
			if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v;
			if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
		}
	}

	// ========================================================================
	// 2. FLASHCARD REVIEW GENERATION (SM-2 Spaced Repetition)
	// ========================================================================

	/**
	 * Generate flashcard decks for a user.
	 */
	generateFlashcardDecks(userId: string, deckCount: number): FlashcardDeck[] {
		const rng = this.getRng();
		const decks: FlashcardDeck[] = [];

		const subjects = ['mathematics', 'physics', 'english', 'history', 'life-sciences', 'geography'];

		for (let i = 0; i < deckCount; i++) {
			const subject = rng.pick(subjects);
			const cardCount = rng.nextInt(20, 100);
			const newCards = rng.nextInt(5, Math.floor(cardCount * 0.3));
			const dueCards = rng.nextInt(0, Math.floor(cardCount * 0.4));
			const youngCards = rng.nextInt(0, cardCount - newCards - dueCards);
			const matureCards = cardCount - newCards - dueCards - youngCards;

			decks.push({
				id: rng.uuid(),
				userId,
				subject,
				title: `${subject.charAt(0).toUpperCase() + subject.slice(1)} Deck ${i + 1}`,
				cardCount,
				newCards,
				dueCards,
				youngCards,
				matureCards: Math.max(0, matureCards),
				createdAt: this.randomDateInRange(),
			});
		}

		return decks;
	}

	/**
	 * Generate SM-2 spaced repetition flashcard reviews for a user.
	 * Produces realistic review history with evolving intervals and ease factors.
	 */
	generateFlashcardReviews(userId: string, deckCount: number): FlashcardReview[] {
		const rng = this.getRng();
		const decks = this.generateFlashcardDecks(userId, deckCount);
		const reviews: FlashcardReview[] = [];

		const profile = this.getUserProfile(userId);
		const reviewsPerDeck = profile
			? Math.max(10, Math.floor(profile.flashcardFrequency * this.getConfig().monthsBack * 2))
			: 20;

		for (const deck of decks) {
			const cardCount = Math.min(deck.cardCount, 30); // Sample subset for reviews

			for (let c = 0; c < cardCount; c++) {
				const cardId = rng.uuid();
				let interval = 1; // Start with 1 day
				let easeFactor = 2.5; // SM-2 default ease factor
				let consecutiveCorrect = 0;
				let reviewDate = new Date(deck.createdAt);

				const numReviews = rng.nextInt(3, reviewsPerDeck);

				for (let r = 0; r < numReviews; r++) {
					const previousInterval = interval;

					// Generate rating influenced by user profile
					let rating: 1 | 2 | 3 | 4 | 5;
					if (profile) {
						const accuracySample = this.sampleFromDistribution(profile.accuracyDistribution, rng);
						if (accuracySample > 0.8) {
							rating = rng.pickWeighted([1, 2, 3, 4, 5] as const, [0.02, 0.05, 0.15, 0.4, 0.38]);
						} else if (accuracySample > 0.5) {
							rating = rng.pickWeighted([1, 2, 3, 4, 5] as const, [0.05, 0.15, 0.4, 0.25, 0.15]);
						} else {
							rating = rng.pickWeighted([1, 2, 3, 4, 5] as const, [0.2, 0.3, 0.3, 0.12, 0.08]);
						}
					} else {
						rating = rng.pickWeighted([1, 2, 3, 4, 5] as const, [0.1, 0.15, 0.35, 0.25, 0.15]);
					}

					// SM-2 algorithm logic
					if (rating >= 3) {
						// Correct response
						consecutiveCorrect++;
						if (consecutiveCorrect === 1) {
							interval = 1;
						} else if (consecutiveCorrect === 2) {
							interval = 6;
						} else {
							interval = Math.round(interval * easeFactor);
						}
						easeFactor = easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
					} else {
						// Incorrect response - lapse
						consecutiveCorrect = 0;
						interval = 1;
						easeFactor = Math.max(1.3, easeFactor - 0.2);
					}

					easeFactor = Math.max(1.3, Math.round(easeFactor * 100) / 100);
					interval = Math.max(1, interval);

					// Advance review date by interval
					reviewDate = new Date(reviewDate);
					reviewDate.setDate(reviewDate.getDate() + interval);

					// Only include reviews within the configured date range
					const rangeEnd = new Date();
					if (reviewDate <= rangeEnd) {
						reviews.push(
							tagDataSource<FlashcardReview>({
								id: rng.uuid(),
								userId,
								cardId,
								deckId: deck.id,
								rating,
								interval,
								easeFactor,
								reviewedAt: reviewDate,
								previousInterval,
								consecutiveCorrect,
							})
						);
					}
				}
			}
		}

		return reviews.sort((a, b) => a.reviewedAt.getTime() - b.reviewedAt.getTime());
	}

	// ========================================================================
	// 3. ACTIVITY TIMELINE GENERATION
	// ========================================================================

	/**
	 * Generate a combined activity timeline for a user, sorted by date.
	 * Merges quizzes, flashcards, and study sessions into a single timeline.
	 */
	generateActivityTimeline(userId: string, months: number): TimelineEntry[] {
		const rng = this.getRng();
		const timeline: TimelineEntry[] = [];
		const enrichedAt = new Date();

		// Generate quiz results
		const quizResults = this.generateQuizResultsForProfile(userId, 6);
		for (const quiz of quizResults) {
			timeline.push({
				id: quiz.id,
				userId,
				type: 'quiz',
				date: quiz.completedAt,
				subject: quiz.subjectSlug,
				topic: quiz.topic,
				score: quiz.score,
				totalQuestions: quiz.totalQuestions,
				percentage: quiz.percentage,
				durationMinutes: Math.round(quiz.timeTaken / 60),
				dataSource: 'mock',
				dataQuality: 'high',
				enrichedAt,
			});
		}

		// Generate flashcard reviews
		const deckCount = Math.max(1, Math.floor(months / 2));
		const flashcardReviews = this.generateFlashcardReviews(userId, deckCount);

		// Aggregate flashcard reviews by date
		const flashcardByDate = new Map<string, FlashcardReview[]>();
		for (const review of flashcardReviews) {
			const dateKey = review.reviewedAt.toISOString().split('T')[0];
			if (!flashcardByDate.has(dateKey)) {
				flashcardByDate.set(dateKey, []);
			}
			flashcardByDate.get(dateKey)!.push(review);
		}

		for (const [_dateKey, dayReviews] of flashcardByDate.entries()) {
			const avgRating = dayReviews.reduce((sum, r) => sum + r.rating, 0) / dayReviews.length;

			timeline.push({
				id: rng.uuid(),
				userId,
				type: 'flashcard',
				date: dayReviews[0].reviewedAt,
				cardsReviewed: dayReviews.length,
				averageRating: Math.round(avgRating * 100) / 100,
				dataSource: 'mock',
				dataQuality: 'high',
				enrichedAt,
			});
		}

		// Generate study sessions
		const sessionCount = Math.floor(months * 4); // ~4 sessions per month
		for (let i = 0; i < sessionCount; i++) {
			const session = this.generateStudySession(userId);
			timeline.push({
				id: session.id,
				userId,
				type: 'study-session',
				date: session.startedAt,
				durationMinutes: session.durationMinutes,
				questionsAttempted: session.questionsAttempted,
				correctAnswers: session.correctAnswers,
				dataSource: 'mock',
				dataQuality: 'high',
				enrichedAt,
			});
		}

		// Sort by date descending (most recent first)
		return timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
	}

	// ========================================================================
	// 4. AGING SIMULATION
	// ========================================================================

	/**
	 * Apply aging to topic mastery based on months since last practice.
	 * - Mastery improves slightly for recently practiced topics (<= 1 month)
	 * - Mastery degrades for neglected topics (> 1 month)
	 * - Degradation accelerates with longer neglect periods
	 */
	applyAging(topicMastery: GeneratedTopicMastery, monthsSinceLastPractice: number): AgingResult {
		const rng = this.getRng();
		let newMasteryLevel = topicMastery.masteryLevel;
		let decayFactor = 1.0;

		if (monthsSinceLastPractice <= 0) {
			// Recent practice - slight improvement (consolidation effect)
			const improvement = rng.nextFloat(0, 2);
			newMasteryLevel = Math.min(100, newMasteryLevel + improvement);
		} else if (monthsSinceLastPractice <= 1) {
			// Within 1 month - minimal decay
			decayFactor = 0.98;
			newMasteryLevel = newMasteryLevel * decayFactor;
		} else if (monthsSinceLastPractice <= 3) {
			// 1-3 months - moderate decay (forgetting curve)
			decayFactor = 0.9 - (monthsSinceLastPractice - 1) * 0.05;
			newMasteryLevel = newMasteryLevel * decayFactor;
		} else if (monthsSinceLastPractice <= 6) {
			// 3-6 months - significant decay
			decayFactor = 0.7 - (monthsSinceLastPractice - 3) * 0.05;
			newMasteryLevel = newMasteryLevel * decayFactor;
		} else {
			// 6+ months - heavy decay, approaching baseline
			decayFactor = Math.max(0.2, 0.55 - (monthsSinceLastPractice - 6) * 0.03);
			newMasteryLevel = newMasteryLevel * decayFactor;
		}

		// High mastery topics resist decay better (spacing effect)
		if (topicMastery.masteryLevel > 80) {
			decayFactor = Math.min(1.0, decayFactor + 0.1);
			newMasteryLevel = topicMastery.masteryLevel * decayFactor;
		}

		newMasteryLevel = Math.max(0, Math.min(100, newMasteryLevel));

		// Adjust questions correct/attempted to reflect new mastery
		const newCorrect = Math.round((topicMastery.questionsAttempted * newMasteryLevel) / 100);
		const newConsecutive = Math.max(
			0,
			topicMastery.consecutiveCorrect - Math.floor(monthsSinceLastPractice * 2)
		);

		return {
			masteryLevel: Math.round(newMasteryLevel * 100) / 100,
			questionsAttempted: topicMastery.questionsAttempted,
			questionsCorrect: Math.min(newCorrect, topicMastery.questionsAttempted),
			consecutiveCorrect: newConsecutive,
			lastPracticed: topicMastery.lastPracticed,
			decayFactor: Math.round(decayFactor * 1000) / 1000,
		};
	}

	/**
	 * Apply aging to all topic masteries for a user.
	 */
	applyAgingToAll(
		topicMasteries: GeneratedTopicMastery[],
		monthsSinceLastPractice: number
	): (GeneratedTopicMastery & AgingResult)[] {
		return topicMasteries.map((mastery) => {
			const agingResult = this.applyAging(mastery, monthsSinceLastPractice);
			return {
				...mastery,
				...agingResult,
			};
		});
	}

	// ========================================================================
	// 5. EXPORT / IMPORT
	// ========================================================================

	/**
	 * Export the full configuration as a JSON string.
	 */
	exportConfig(): string {
		const config = this.getConfig();
		const exported: ExportedConfig = {
			version: '2.0',
			generatorConfig: {
				seed: config.seed,
				userCount: config.userCount,
				monthsBack: config.monthsBack,
				intensity: config.intensity,
			},
			enrichmentConfig: this.enrichmentConfig,
			mockDataEnabled: this.mockDataEnabled,
			exportedAt: new Date().toISOString(),
		};
		return JSON.stringify(exported, null, 2);
	}

	/**
	 * Import a configuration from a JSON string and recreate a generator.
	 */
	static importConfig(json: string): MockDataGeneratorV2 {
		const exported = JSON.parse(json) as ExportedConfig;

		if (exported.version !== '2.0') {
			throw new Error(`Unsupported config version: ${exported.version}. Expected "2.0".`);
		}

		const generator = new MockDataGeneratorV2(exported.enrichmentConfig, {
			seed: exported.generatorConfig.seed,
			userCount: exported.generatorConfig.userCount,
			monthsBack: exported.generatorConfig.monthsBack,
			intensity: exported.generatorConfig.intensity as 'low' | 'medium' | 'high',
		});

		generator.setMockDataEnabled(exported.mockDataEnabled);

		return generator;
	}

	// ========================================================================
	// 6. FEATURE FLAG INTEGRATION
	// ========================================================================

	/**
	 * Check if mock data generation is enabled.
	 * Defaults to process.env.ENABLE_MOCK_DATA !== 'false'.
	 */
	isMockDataEnabled(): boolean {
		return this.mockDataEnabled;
	}

	/**
	 * Enable or disable mock data generation.
	 */
	setMockDataEnabled(enabled: boolean): void {
		this.mockDataEnabled = enabled;
	}

	/**
	 * Generate all mock data, respecting the feature flag.
	 * Returns empty arrays if mock data is disabled.
	 */
	generateAllWithFlag(): {
		users: (GeneratedUser & DataSourceTag)[];
		quizResults: (GeneratedQuizResult & DataSourceTag)[];
		studySessions: (GeneratedStudySession & DataSourceTag)[];
		topicMasteries: (GeneratedTopicMastery & DataSourceTag)[];
		achievements: (GeneratedAchievement & DataSourceTag)[];
	} {
		const emptyResult = {
			users: [] as (GeneratedUser & DataSourceTag)[],
			quizResults: [] as (GeneratedQuizResult & DataSourceTag)[],
			studySessions: [] as (GeneratedStudySession & DataSourceTag)[],
			topicMasteries: [] as (GeneratedTopicMastery & DataSourceTag)[],
			achievements: [] as (GeneratedAchievement & DataSourceTag)[],
		};

		if (!this.isMockDataEnabled()) {
			return emptyResult;
		}

		const { users } = this.generateUsersWithProfiles();
		const userIds = this.getUserIds();

		const taggedUsers = users.map((u) => tagDataSource(u));
		const taggedQuizResults: (GeneratedQuizResult & DataSourceTag)[] = [];
		const taggedStudySessions: (GeneratedStudySession & DataSourceTag)[] = [];
		const taggedTopicMasteries: (GeneratedTopicMastery & DataSourceTag)[] = [];
		const taggedAchievements: (GeneratedAchievement & DataSourceTag)[] = [];

		for (const userId of userIds) {
			const quizResults = this.generateQuizResultsForProfile(userId, 6);
			taggedQuizResults.push(...quizResults.map((q) => tagDataSource(q)));

			const sessions = this.generateStudySession(userId);
			taggedStudySessions.push(tagDataSource(sessions));

			const masteries = this.generateTopicMastery(userId, 1, 'mathematics');
			taggedTopicMasteries.push(...masteries.map((m) => tagDataSource(m)));

			const achievements = this.generateAchievements(userId);
			taggedAchievements.push(...achievements.map((a) => tagDataSource(a)));
		}

		return {
			users: taggedUsers,
			quizResults: taggedQuizResults,
			studySessions: taggedStudySessions,
			topicMasteries: taggedTopicMasteries,
			achievements: taggedAchievements,
		};
	}

	// ========================================================================
	// HELPER: Random date within configured range
	// ========================================================================

	private randomDateInRange(): Date {
		const rng = this.getRng();
		const config = this.getConfig();
		const end = new Date();
		const start = new Date(end);
		start.setMonth(start.getMonth() - config.monthsBack);

		const startMs = start.getTime();
		const endMs = end.getTime();
		return new Date(startMs + rng.next() * (endMs - startMs));
	}

	// ========================================================================
	// OVERRIDES: Tag all generated data from base methods
	// ========================================================================

	/**
	 * Override generateUsers to add data source tags.
	 */
	generateUsersTagged(count?: number): (GeneratedUser & DataSourceTag)[] {
		const users = this.generateUsers(count);
		return users.map((u) => tagDataSource(u));
	}

	/**
	 * Override generateQuizResults to add data source tags.
	 */
	generateQuizResultsTagged(
		userId: string,
		subjectCount: number
	): (GeneratedQuizResult & DataSourceTag)[] {
		const results = this.generateQuizResults(userId, subjectCount);
		return results.map((r) => tagDataSource(r));
	}

	/**
	 * Override generateStudySession to add data source tags.
	 */
	generateStudySessionTagged(userId: string): GeneratedStudySession & DataSourceTag {
		return tagDataSource(this.generateStudySession(userId));
	}

	/**
	 * Override generateTopicMastery to add data source tags.
	 */
	generateTopicMasteryTagged(
		userId: string,
		subjectId: number,
		subjectSlug: string
	): (GeneratedTopicMastery & DataSourceTag)[] {
		const masteries = this.generateTopicMastery(userId, subjectId, subjectSlug);
		return masteries.map((m) => tagDataSource(m));
	}

	/**
	 * Override generateAchievements to add data source tags.
	 */
	generateAchievementsTagged(userId: string): (GeneratedAchievement & DataSourceTag)[] {
		const achievements = this.generateAchievements(userId);
		return achievements.map((a) => tagDataSource(a));
	}
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new MockDataGeneratorV2 instance.
 */
export const createMockDataGeneratorV2 = (
	enrichmentConfig?: EnrichmentConfig,
	generatorConfig?: {
		seed?: number;
		userCount?: number;
		monthsBack?: number;
		intensity?: 'low' | 'medium' | 'high';
	}
): MockDataGeneratorV2 => {
	return new MockDataGeneratorV2(enrichmentConfig, generatorConfig);
};

/**
 * Generate all mock data using the V2 generator with profile support.
 */
export const generateAllMockDataV2 = async (
	enrichmentConfig?: EnrichmentConfig,
	generatorConfig?: {
		seed?: number;
		userCount?: number;
		monthsBack?: number;
		intensity?: 'low' | 'medium' | 'high';
	}
): Promise<{
	users: (GeneratedUser & DataSourceTag)[];
	quizResults: (GeneratedQuizResult & DataSourceTag)[];
	studySessions: (GeneratedStudySession & DataSourceTag)[];
	topicMasteries: (GeneratedTopicMastery & DataSourceTag)[];
	achievements: (GeneratedAchievement & DataSourceTag)[];
	profileAssignments: ProfileAssignment[];
}> => {
	const generator = createMockDataGeneratorV2(enrichmentConfig, generatorConfig);
	const result = generator.generateAllWithFlag();
	const { assignments } = generator.generateUsersWithProfiles();

	return {
		...result,
		profileAssignments: assignments,
	};
};
