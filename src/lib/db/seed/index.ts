import { resolve } from 'node:path';
import { config } from 'dotenv';

// Load environment variables explicitly to avoid authentication issues
const envPath = resolve(process.cwd(), '.env.local');
config({ path: envPath });

import { auth } from '@/lib/auth';
import { dbManager } from '../index';
import { options, questions, subjects } from '../schema';
import { englishQuestions } from './english-questions';
import { historyQuestions } from './history-questions';
import { physicsQuestions } from './physics-questions';

function getDb() {
	if (!dbManager.isConnectedToDatabase()) {
		throw new Error('Database not connected');
	}
	return dbManager.getDb();
}

export async function seedDatabase() {
	console.log('🔄 Starting database seeding...');

	// Ensure database is initialized
	if (!dbManager.isConnectedToDatabase()) {
		console.log('🔄 Initializing database connection...');
		await dbManager.initialize();
	}

	console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL);
	console.log('Using database: PostgreSQL');

	const useDb = getDb();

	try {
		const existingSubjects = await useDb.select().from(subjects);
		console.log(
			'Existing subjects found:',
			existingSubjects.map((s) => s.name)
		);

		let historySubject = existingSubjects.find((s) => s.name === 'History');
		let englishSubject = existingSubjects.find((s) => s.name === 'English FAL');
		let physicsSubject = existingSubjects.find((s) => s.name === 'Physical Sciences');

		// Insert missing subjects
		const subjectsToInsert = [];

		if (!historySubject) {
			subjectsToInsert.push({
				name: 'History',
				description: 'CAPS History Grades 10-12',
				curriculumCode: 'CAPS-HIST',
				isActive: true,
			});
		}

		if (!englishSubject) {
			subjectsToInsert.push({
				name: 'English FAL',
				description: 'CAPS English First Additional Language Grades 10-12',
				curriculumCode: 'CAPS-EFAL',
				isActive: true,
			});
		}

		if (!physicsSubject) {
			subjectsToInsert.push({
				name: 'Physical Sciences',
				description: 'CAPS Physical Sciences Grades 9-12 covering Physics topics',
				curriculumCode: 'CAPS-PHYS',
				isActive: true,
			});
		}

		if (subjectsToInsert.length > 0) {
			console.log(`Inserting ${subjectsToInsert.length} missing subjects...`);
			const insertedSubjects = await useDb.insert(subjects).values(subjectsToInsert).returning();

			// Update references
			insertedSubjects.forEach((subject) => {
				if (subject.name === 'History') historySubject = subject;
				if (subject.name === 'English FAL') englishSubject = subject;
				if (subject.name === 'Physical Sciences') physicsSubject = subject;
			});
		}

		// Ensure we have all subjects
		if (!historySubject || !englishSubject || !physicsSubject) {
			throw new Error('Failed to get or create all required subjects');
		}

		console.log(
			'✓ Subjects verified:',
			historySubject.name,
			'&',
			englishSubject.name,
			'&',
			physicsSubject.name
		);

		// Helper to check if question exists
		const questionExists = async (text: string, subjectId: number) => {
			const existing = await useDb
				.select()
				.from(questions)
				.where(and(eq(questions.questionText, text), eq(questions.subjectId, subjectId)))
				.limit(1);
			return existing.length > 0;
		};

		// Seed History questions
		console.log('Seeding History questions...');
		let historyCount = 0;
		for (const q of historyQuestions) {
			if (await questionExists(q.questionText, historySubject.id)) continue;

			await useDb.transaction(async (tx) => {
				const [question] = await tx
					.insert(questions)
					.values({
						subjectId: historySubject!.id,
						questionText: q.questionText,
						gradeLevel: q.gradeLevel,
						topic: q.topic,
						difficulty: q.difficulty,
						marks: q.marks,
						isActive: true,
					})
					.returning();

				for (const opt of q.options) {
					await tx.insert(options).values({
						questionId: question.id,
						optionText: opt.text,
						isCorrect: opt.isCorrect,
						optionLetter: opt.letter,
						explanation: opt.explanation || null,
						isActive: true,
					});
				}
			});
			historyCount++;
		}
		console.log(`✓ ${historyCount} new History questions seeded`);

		// Seed English questions
		console.log('Seeding English questions...');
		let englishCount = 0;
		for (const q of englishQuestions) {
			if (await questionExists(q.questionText, englishSubject.id)) continue;

			await useDb.transaction(async (tx) => {
				const [question] = await tx
					.insert(questions)
					.values({
						subjectId: englishSubject!.id,
						questionText: q.questionText,
						gradeLevel: q.gradeLevel,
						topic: q.topic,
						difficulty: q.difficulty,
						marks: q.marks,
						isActive: true,
					})
					.returning();

				for (const opt of q.options) {
					await tx.insert(options).values({
						questionId: question.id,
						optionText: opt.text,
						isCorrect: opt.isCorrect,
						optionLetter: opt.letter,
						explanation: opt.explanation || null,
						isActive: true,
					});
				}
			});
			englishCount++;
		}
		console.log(`✓ ${englishCount} new English questions seeded`);

		// Seed Physics questions
		console.log('Seeding Physics questions...');
		let physicsCount = 0;
		for (const q of physicsQuestions) {
			if (await questionExists(q.questionText, physicsSubject.id)) continue;

			await useDb.transaction(async (tx) => {
				const [question] = await tx
					.insert(questions)
					.values({
						subjectId: physicsSubject!.id,
						questionText: q.questionText,
						imageUrl: q.imageUrl || null,
						gradeLevel: q.gradeLevel,
						topic: q.topic,
						difficulty: q.difficulty,
						marks: q.marks,
						isActive: true,
					})
					.returning();

				for (const opt of q.options) {
					await tx.insert(options).values({
						questionId: question.id,
						optionText: opt.text,
						isCorrect: opt.isCorrect,
						optionLetter: opt.letter,
						explanation: opt.explanation || null,
						isActive: true,
					});
				}
			});
			physicsCount++;
		}
		console.log(`✓ ${physicsCount} new Physics questions seeded`);

		// Seed Test User
		const testEmail = 'student@matricmaster.ai';
		console.log('Checking for test user...');

		const existingUser = await useDb
			.select()
			.from(users)
			.where(eq(users.email, testEmail))
			.limit(1);

		if (existingUser.length === 0) {
			console.log('Seeding test user...');
			try {
				await auth.api.signUpEmail({
					body: {
						email: testEmail,
						password: 'password123',
						name: 'Test Student',
					},
				});
				console.log('✓ Test user seeded: student@matricmaster.ai / password123');
			} catch (e) {
				console.error('⚠️ Failed to seed user via Auth API:', e instanceof Error ? e.message : e);
			}
		} else {
			console.log('✓ Test user already exists.');
		}

		console.log('\n✅ Database seeding completed successfully!');
	} catch (error) {
		console.error('❌ Seeding failed:', error);
		throw error;
	}
}

// Ensure the and/eq utilities are available
import { and, eq } from 'drizzle-orm';
import { users } from '../better-auth-schema';

// End of file
