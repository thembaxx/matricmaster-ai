import { beforeEach, describe, expect, it } from 'vitest';
import { createMockDataGenerator, generateAllMockData, type MockDataGenerator } from '../generator';
import { SeededRandom } from '../seeded-random';

describe('MockDataGenerator', () => {
	let generator: MockDataGenerator;

	beforeEach(() => {
		generator = createMockDataGenerator({ seed: 42, userCount: 10, monthsBack: 3 });
	});

	describe('User Generation', () => {
		it('should generate specified number of users', () => {
			const users = generator.generateUsers(5);
			expect(users).toHaveLength(5);
		});

		it('should generate users with valid email format', () => {
			const users = generator.generateUsers(3);
			users.forEach((user) => {
				expect(user.email).toContain('@');
			});
		});

		it('should generate users with valid names', () => {
			const users = generator.generateUsers(3);
			users.forEach((user) => {
				expect(user.name.split(' ')).toHaveLength(2);
			});
		});

		it('should be reproducible with same seed', () => {
			const gen1 = createMockDataGenerator({ seed: 123, userCount: 5 });
			const gen2 = createMockDataGenerator({ seed: 123, userCount: 5 });

			const users1 = gen1.generateUsers();
			const users2 = gen2.generateUsers();

			expect(users1).toEqual(users2);
		});
	});

	describe('Quiz Results Generation', () => {
		it('should generate quiz results for a user', () => {
			const userIds = generator.generateUsers(1).map((u) => u.id);
			const results = generator.generateQuizResults(userIds[0], 3);

			expect(results.length).toBeGreaterThan(0);
		});

		it('should have valid percentage scores (0-100)', () => {
			const userIds = generator.generateUsers(1).map((u) => u.id);
			const results = generator.generateQuizResults(userIds[0], 3);

			results.forEach((result) => {
				expect(result.percentage).toBeGreaterThanOrEqual(0);
				expect(result.percentage).toBeLessThanOrEqual(100);
			});
		});

		it('should have score matching percentage', () => {
			const userIds = generator.generateUsers(1).map((u) => u.id);
			const results = generator.generateQuizResults(userIds[0], 3);

			results.forEach((result) => {
				const expectedScore = Math.round((result.totalQuestions * result.percentage) / 100);
				expect(result.score).toBe(expectedScore);
			});
		});
	});

	describe('Study Sessions', () => {
		it('should generate valid study sessions', () => {
			const userIds = generator.generateUsers(1).map((u) => u.id);
			const session = generator.generateStudySession(userIds[0]);

			expect(session.userId).toBe(userIds[0]);
			expect(session.durationMinutes).toBeGreaterThan(0);
			expect(session.subjectId).toBeDefined();
		});

		it('should have valid question counts', () => {
			const userIds = generator.generateUsers(1).map((u) => u.id);
			const session = generator.generateStudySession(userIds[0]);

			if (session.completedAt) {
				expect(session.correctAnswers).toBeLessThanOrEqual(session.questionsAttempted);
			}
		});
	});

	describe('Topic Mastery', () => {
		it('should generate topic masteries with valid levels', () => {
			const userIds = generator.generateUsers(1).map((u) => u.id);
			const masteries = generator.generateTopicMastery(userIds[0], 1, 'mathematics');

			masteries.forEach((mastery) => {
				expect(mastery.masteryLevel).toBeGreaterThanOrEqual(0);
				expect(mastery.masteryLevel).toBeLessThanOrEqual(100);
			});
		});

		it('should have valid question counts', () => {
			const userIds = generator.generateUsers(1).map((u) => u.id);
			const masteries = generator.generateTopicMastery(userIds[0], 1, 'mathematics');

			masteries.forEach((mastery) => {
				expect(mastery.questionsCorrect).toBeLessThanOrEqual(mastery.questionsAttempted);
			});
		});
	});

	describe('Achievements', () => {
		it('should generate achievements for a user', () => {
			const userIds = generator.generateUsers(1).map((u) => u.id);
			const achievements = generator.generateAchievements(userIds[0]);

			expect(achievements.length).toBeGreaterThan(0);
			expect(achievements.length).toBeLessThanOrEqual(8);
		});

		it('should have valid unlocked dates', () => {
			const userIds = generator.generateUsers(1).map((u) => u.id);
			const achievements = generator.generateAchievements(userIds[0]);

			achievements.forEach((achievement) => {
				expect(achievement.unlockedAt).toBeInstanceOf(Date);
			});
		});
	});

	describe('Reset Functionality', () => {
		it('should reset with same seed', () => {
			const users1 = generator.generateUsers(5);
			generator.reset();
			const users2 = generator.generateUsers(5);

			expect(users1).toEqual(users2);
		});

		it('should reset with new seed', () => {
			const users1 = generator.generateUsers(5);
			generator.reset(999);
			const users2 = generator.generateUsers(5);

			expect(users1).not.toEqual(users2);
		});
	});
});

describe('SeededRandom', () => {
	it('should produce same sequence with same seed', () => {
		const rng1 = new SeededRandom(42);
		const rng2 = new SeededRandom(42);

		const values1 = Array.from({ length: 10 }, () => rng1.next());
		const values2 = Array.from({ length: 10 }, () => rng2.next());

		expect(values1).toEqual(values2);
	});

	it('should produce different sequences with different seeds', () => {
		const rng1 = new SeededRandom(1);
		const rng2 = new SeededRandom(2);

		const values1 = Array.from({ length: 10 }, () => rng1.next());
		const values2 = Array.from({ length: 10 }, () => rng2.next());

		expect(values1).not.toEqual(values2);
	});

	it('should return values in correct range', () => {
		const rng = new SeededRandom(42);

		for (let i = 0; i < 100; i++) {
			const value = rng.next();
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThan(1);
		}
	});

	it('should return integers in range', () => {
		const rng = new SeededRandom(42);

		for (let i = 0; i < 100; i++) {
			const value = rng.nextInt(10, 20);
			expect(value).toBeGreaterThanOrEqual(10);
			expect(value).toBeLessThan(20);
		}
	});

	it('should pick from array', () => {
		const rng = new SeededRandom(42);
		const items = ['a', 'b', 'c', 'd', 'e'];

		const picked = rng.pick(items);
		expect(items).toContain(picked);
	});

	it('should generate UUIDs', () => {
		const rng = new SeededRandom(42);

		const uuid = rng.uuid();
		expect(uuid).toMatch(/^[0-9a-f-]{36}$/);
	});
});

describe('generateAllMockData', () => {
	it('should generate all data types', async () => {
		const data = await generateAllMockData({ seed: 42, userCount: 5, monthsBack: 2 });

		expect(data.users).toHaveLength(5);
		expect(data.quizResults.length).toBeGreaterThan(0);
		expect(data.studySessions.length).toBeGreaterThan(0);
		expect(data.topicMasteries.length).toBeGreaterThan(0);
		expect(data.achievements.length).toBeGreaterThan(0);
	});

	it('should include user IDs in all generated data', async () => {
		const data = await generateAllMockData({ seed: 42, userCount: 3, monthsBack: 1 });
		const userIds = new Set(data.users.map((u) => u.id));

		data.quizResults.forEach((result) => {
			expect(userIds.has(result.userId)).toBe(true);
		});

		data.studySessions.forEach((session) => {
			expect(userIds.has(session.userId)).toBe(true);
		});

		data.topicMasteries.forEach((mastery) => {
			expect(userIds.has(mastery.userId)).toBe(true);
		});

		data.achievements.forEach((achievement) => {
			expect(userIds.has(achievement.userId)).toBe(true);
		});
	});
});
