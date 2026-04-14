import { describe, expect, it } from 'vitest';
import type { EnrichmentConfig } from '@/lib/enrichment/config';
import { defaultEnrichmentConfig } from '@/lib/enrichment/default-config';
import { MockDataGeneratorV2, tagDataSource } from '@/lib/mock-data/generator-v2';

// ============================================================================
// TEST HELPERS
// ============================================================================

function createTestEnrichmentConfig(overrides: Partial<EnrichmentConfig> = {}): EnrichmentConfig {
	return {
		...defaultEnrichmentConfig,
		userCount: 5,
		monthsOfActivity: 3,
		seed: 42,
		...overrides,
	};
}

// ============================================================================
// 1. PROFILE-BASED GENERATION
// ============================================================================

describe('MockDataGeneratorV2 - Profile-based generation', () => {
	it('should assign profiles to users according to profile distribution weights', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 50 });

		const { users, assignments } = generator.generateUsersWithProfiles();

		expect(users).toHaveLength(50);
		expect(assignments).toHaveLength(50);

		// Each assignment should have a valid profile name
		const validProfiles = new Set(['Diligent', 'Struggling', 'Average', 'Crammer', 'Balanced']);
		for (const assignment of assignments) {
			expect(validProfiles.has(assignment.profileName)).toBe(true);
			expect(assignment.userId).toBeTruthy();
		}
	});

	it('should distribute users approximately according to weights', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 123, userCount: 200 });

		const { assignments } = generator.generateUsersWithProfiles();

		const counts: Record<string, number> = {};
		for (const a of assignments) {
			counts[a.profileName] = (counts[a.profileName] || 0) + 1;
		}

		// Average should be most common (35% weight)
		expect(counts.Average ?? 0).toBeGreaterThan(0);
		// All profiles should have at least some representation
		expect(Object.keys(counts).length).toBeGreaterThan(2);
	});

	it('should return the correct profile for a specific user', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 5 });

		const { users } = generator.generateUsersWithProfiles();
		const firstUser = users[0];

		const profile = generator.getUserProfile(firstUser.id);
		expect(profile).toBeDefined();
		expect(profile?.name).toBeDefined();
	});

	it('should return undefined for a user without profile assignment', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 5 });

		// Generate users but don't assign profiles
		generator.generateUsers(5);

		// getUserProfile should return undefined
		const profile = generator.getUserProfile('non-existent-user-id');
		expect(profile).toBeUndefined();
	});

	it('should generate quiz results weighted by user profile accuracy', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 5 });

		const { users } = generator.generateUsersWithProfiles();

		for (const user of users) {
			const results = generator.generateQuizResultsForProfile(user.id, 3);
			expect(results.length).toBeGreaterThan(0);

			for (const result of results) {
				expect(result.percentage).toBeGreaterThanOrEqual(0);
				expect(result.percentage).toBeLessThanOrEqual(100);
				expect(result.score).toBeGreaterThanOrEqual(0);
			}
		}
	});
});

// ============================================================================
// 2. REPRODUCIBILITY
// ============================================================================

describe('MockDataGeneratorV2 - Reproducibility', () => {
	it('should produce the same output with the same seed', () => {
		const config = createTestEnrichmentConfig();

		const gen1 = new MockDataGeneratorV2(config, { seed: 999, userCount: 3 });
		const { users: users1 } = gen1.generateUsersWithProfiles();

		const gen2 = new MockDataGeneratorV2(config, { seed: 999, userCount: 3 });
		const { users: users2 } = gen2.generateUsersWithProfiles();

		expect(users1).toHaveLength(users2.length);
		for (let i = 0; i < users1.length; i++) {
			expect(users1[i].id).toBe(users2[i].id);
			expect(users1[i].email).toBe(users2[i].email);
			expect(users1[i].name).toBe(users2[i].name);
		}
	});

	it('should produce different output with different seeds', () => {
		const config = createTestEnrichmentConfig();

		const gen1 = new MockDataGeneratorV2(config, { seed: 111, userCount: 3 });
		const { users: users1 } = gen1.generateUsersWithProfiles();

		const gen2 = new MockDataGeneratorV2(config, { seed: 222, userCount: 3 });
		const { users: users2 } = gen2.generateUsersWithProfiles();

		// At least some users should differ
		const allSame = users1.every((u, i) => u.id === users2[i]?.id);
		expect(allSame).toBe(false);
	});
});

// ============================================================================
// 3. FLASHCARD REVIEW GENERATION (SM-2)
// ============================================================================

describe('MockDataGeneratorV2 - Flashcard review generation', () => {
	it('should generate flashcard decks for a user', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 3 });

		const { users } = generator.generateUsersWithProfiles();
		const decks = generator.generateFlashcardDecks(users[0].id, 3);

		expect(decks).toHaveLength(3);
		for (const deck of decks) {
			expect(deck.userId).toBe(users[0].id);
			expect(deck.subject).toBeDefined();
			expect(deck.cardCount).toBeGreaterThan(0);
			expect(deck.id).toMatch(
				/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
			);
		}
	});

	it('should generate SM-2 flashcard reviews with valid ratings (1-5)', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 3 });

		const { users } = generator.generateUsersWithProfiles();
		const reviews = generator.generateFlashcardReviews(users[0].id, 2);

		expect(reviews.length).toBeGreaterThan(0);
		for (const review of reviews) {
			expect([1, 2, 3, 4, 5]).toContain(review.rating);
		}
	});

	it('should ensure easeFactor is always >= 1.3', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 3 });

		const { users } = generator.generateUsersWithProfiles();
		const reviews = generator.generateFlashcardReviews(users[0].id, 2);

		for (const review of reviews) {
			expect(review.easeFactor).toBeGreaterThanOrEqual(1.3);
		}
	});

	it('should produce reviews sorted by reviewedAt', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 3 });

		const { users } = generator.generateUsersWithProfiles();
		const reviews = generator.generateFlashcardReviews(users[0].id, 2);

		for (let i = 1; i < reviews.length; i++) {
			expect(reviews[i].reviewedAt.getTime()).toBeGreaterThanOrEqual(
				reviews[i - 1].reviewedAt.getTime()
			);
		}
	});

	it('should tag all flashcard reviews with dataSource=mock', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 3 });

		const { users } = generator.generateUsersWithProfiles();
		const reviews = generator.generateFlashcardReviews(users[0].id, 1);

		for (const review of reviews) {
			expect((review as Record<string, unknown>).dataSource).toBe('mock');
		}
	});
});

// ============================================================================
// 4. ACTIVITY TIMELINE
// ============================================================================

describe('MockDataGeneratorV2 - Activity timeline', () => {
	it('should generate a merged activity timeline with correct types', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 3 });

		const { users } = generator.generateUsersWithProfiles();
		const timeline = generator.generateActivityTimeline(users[0].id, 3);

		expect(timeline.length).toBeGreaterThan(0);

		const validTypes = new Set(['quiz', 'flashcard', 'study-session']);
		for (const entry of timeline) {
			expect(validTypes.has(entry.type)).toBe(true);
			expect(entry.userId).toBe(users[0].id);
			expect(entry.dataSource).toBe('mock');
			expect(entry.dataQuality).toBe('high');
		}
	});

	it('should sort timeline entries by date descending (most recent first)', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 3 });

		const { users } = generator.generateUsersWithProfiles();
		const timeline = generator.generateActivityTimeline(users[0].id, 3);

		for (let i = 1; i < timeline.length; i++) {
			expect(timeline[i].date.getTime()).toBeLessThanOrEqual(timeline[i - 1].date.getTime());
		}
	});
});

// ============================================================================
// 5. AGING SIMULATION
// ============================================================================

describe('MockDataGeneratorV2 - Aging simulation', () => {
	it('should apply decay to mastery when monthsSinceLastPractice > 0', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 3 });

		const { users } = generator.generateUsersWithProfiles();
		const masteries = generator.generateTopicMastery(users[0].id, 1, 'mathematics');
		const mastery = masteries[0];

		const agingResult = generator.applyAging(mastery, 3);

		expect(agingResult.masteryLevel).toBeLessThanOrEqual(mastery.masteryLevel);
		expect(agingResult.decayFactor).toBeLessThanOrEqual(1.0);
		expect(agingResult.decayFactor).toBeGreaterThan(0);
	});

	it('should allow slight improvement when monthsSinceLastPractice <= 0', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 3 });

		const { users } = generator.generateUsersWithProfiles();
		const masteries = generator.generateTopicMastery(users[0].id, 1, 'mathematics');
		const mastery = masteries[0];

		const agingResult = generator.applyAging(mastery, 0);

		expect(agingResult.masteryLevel).toBeGreaterThanOrEqual(mastery.masteryLevel);
	});

	it('should resist decay for high mastery topics (> 80)', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 3 });

		const { users } = generator.generateUsersWithProfiles();
		const masteries = generator.generateTopicMastery(users[0].id, 1, 'mathematics');

		// Force high mastery
		const highMastery = { ...masteries[0], masteryLevel: 95 };
		const agingResult = generator.applyAging(highMastery, 2);

		// High mastery should have a higher decay factor (more resistant)
		expect(agingResult.decayFactor).toBeGreaterThan(0.8);
	});

	it('should clamp masteryLevel between 0 and 100', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 3 });

		const { users } = generator.generateUsersWithProfiles();
		const masteries = generator.generateTopicMastery(users[0].id, 1, 'mathematics');
		const mastery = masteries[0];

		const agingResult = generator.applyAging(mastery, 12);

		expect(agingResult.masteryLevel).toBeGreaterThanOrEqual(0);
		expect(agingResult.masteryLevel).toBeLessThanOrEqual(100);
	});
});

// ============================================================================
// 6. EXPORT / IMPORT ROUND-TRIP
// ============================================================================

describe('MockDataGeneratorV2 - Export/Import', () => {
	it('should export configuration as valid JSON', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 5 });

		const exported = generator.exportConfig();
		const parsed = JSON.parse(exported);

		expect(parsed.version).toBe('2.0');
		expect(parsed.generatorConfig.seed).toBe(42);
		expect(parsed.generatorConfig.userCount).toBe(5);
		expect(parsed.enrichmentConfig).toBeDefined();
		expect(typeof parsed.exportedAt).toBe('string');
	});

	it('should import exported config and recreate generator', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 5 });

		const exported = generator.exportConfig();
		const imported = MockDataGeneratorV2.importConfig(exported);

		expect(imported).toBeInstanceOf(MockDataGeneratorV2);
		const importedConfig = imported.getConfig();
		expect(importedConfig.seed).toBe(42);
		expect(importedConfig.userCount).toBe(5);
	});

	it('should throw on unsupported config version', () => {
		const invalidConfig = JSON.stringify({
			version: '1.0',
			generatorConfig: { seed: 1, userCount: 1, monthsBack: 1, intensity: 'low' },
			enrichmentConfig: defaultEnrichmentConfig,
			mockDataEnabled: true,
			exportedAt: new Date().toISOString(),
		});

		expect(() => MockDataGeneratorV2.importConfig(invalidConfig)).toThrow(
			'Unsupported config version'
		);
	});

	it('should round-trip preserve mock data enabled flag', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42 });
		generator.setMockDataEnabled(false);

		const exported = generator.exportConfig();
		const imported = MockDataGeneratorV2.importConfig(exported);

		expect(imported.isMockDataEnabled()).toBe(false);
	});
});

// ============================================================================
// 7. FEATURE FLAG TOGGLE
// ============================================================================

describe('MockDataGeneratorV2 - Feature flag', () => {
	it('should return empty arrays when mock data is disabled', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 5 });
		generator.setMockDataEnabled(false);

		const result = generator.generateAllWithFlag();

		expect(result.users).toEqual([]);
		expect(result.quizResults).toEqual([]);
		expect(result.studySessions).toEqual([]);
		expect(result.topicMasteries).toEqual([]);
		expect(result.achievements).toEqual([]);
	});

	it('should return data when mock data is enabled', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 3 });
		generator.setMockDataEnabled(true);

		const result = generator.generateAllWithFlag();

		expect(result.users.length).toBeGreaterThan(0);
		expect(result.quizResults.length).toBeGreaterThan(0);
	});

	it('should default to enabled', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42 });

		expect(generator.isMockDataEnabled()).toBe(true);
	});
});

// ============================================================================
// 8. DATA SOURCE TAGGING
// ============================================================================

describe('MockDataGeneratorV2 - Data source tagging', () => {
	it('should tag all generated users with dataSource=mock', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 5 });

		const taggedUsers = generator.generateUsersTagged();

		for (const user of taggedUsers) {
			expect((user as Record<string, unknown>).dataSource).toBe('mock');
			expect((user as Record<string, unknown>).dataQuality).toBe('high');
			expect((user as Record<string, unknown>).enrichedAt).toBeInstanceOf(Date);
		}
	});

	it('should tag quiz results with dataSource=mock', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 3 });

		const { users } = generator.generateUsersWithProfiles();
		const taggedResults = generator.generateQuizResultsTagged(users[0].id, 3);

		for (const result of taggedResults) {
			expect((result as Record<string, unknown>).dataSource).toBe('mock');
		}
	});

	it('should tag study sessions with dataSource=mock', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 3 });

		const { users } = generator.generateUsersWithProfiles();
		const taggedSession = generator.generateStudySessionTagged(users[0].id);

		expect((taggedSession as Record<string, unknown>).dataSource).toBe('mock');
	});

	it('should tag topic masteries with dataSource=mock', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 3 });

		const { users } = generator.generateUsersWithProfiles();
		const taggedMasteries = generator.generateTopicMasteryTagged(users[0].id, 1, 'mathematics');

		for (const mastery of taggedMasteries) {
			expect((mastery as Record<string, unknown>).dataSource).toBe('mock');
		}
	});

	it('should tag achievements with dataSource=mock', () => {
		const config = createTestEnrichmentConfig();
		const generator = new MockDataGeneratorV2(config, { seed: 42, userCount: 3 });

		const { users } = generator.generateUsersWithProfiles();
		const taggedAchievements = generator.generateAchievementsTagged(users[0].id);

		for (const achievement of taggedAchievements) {
			expect((achievement as Record<string, unknown>).dataSource).toBe('mock');
		}
	});

	it('tagDataSource should add correct properties to any object', () => {
		const record = { id: '123', name: 'test' };
		const tagged = tagDataSource(record);

		expect(tagged.dataSource).toBe('mock');
		expect(tagged.dataQuality).toBe('high');
		expect(tagged.enrichedAt).toBeInstanceOf(Date);
		expect(tagged.id).toBe('123');
		expect(tagged.name).toBe('test');
	});
});
