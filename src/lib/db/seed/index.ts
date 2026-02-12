import { resolve } from 'node:path';
import { config } from 'dotenv';

// Load environment variables explicitly to avoid authentication issues
const envPath = resolve(process.cwd(), '.env.local');
config({ path: envPath });

import { auth } from '@/lib/auth';
import { closeConnection, dbManager } from '../index';
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
	console.log('Starting database seeding...');
	console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL);
	if (process.env.DATABASE_URL) {
		console.log(`DATABASE_URL starts with: ${process.env.DATABASE_URL.substring(0, 10)}...`);
	} else {
		console.log('DATABASE_URL not set');
	}

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
			throw new Error('Failed to get all required subjects');
		}

		console.log(
			'✓ Subjects seeded:',
			historySubject.name,
			'&',
			englishSubject.name,
			'&',
			physicsSubject.name
		);

		// Seed History questions within transaction
		await useDb.transaction(async (tx) => {
			for (const q of historyQuestions) {
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
			}
		});
		console.log(`✓ ${historyQuestions.length} History questions seeded`);

		// Seed English questions within transaction
		await useDb.transaction(async (tx) => {
			for (const q of englishQuestions) {
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
			}
		});
		console.log(`✓ ${englishQuestions.length} English questions seeded`);

		// Seed Physics questions within transaction
		await useDb.transaction(async (tx) => {
			for (const q of physicsQuestions) {
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
			}
		});
		console.log(`✓ ${physicsQuestions.length} Physics questions seeded`);

		// Seed Test User
		const testEmail = 'student@matricmaster.ai';

		console.log('Seeding test user...');
		try {
			// Using auth.api.signUpEmail which is the server-side action
			await auth.api.signUpEmail({
				body: {
					email: testEmail,
					password: 'password123',
					name: 'Test Student',
				},
			});
			console.log('✓ Test user seeded: student@matricmaster.ai / password123');
		} catch (e) {
			console.error('Failed to seed user via Auth API:', e);
		}

		console.log('\n✅ Database seeding completed successfully!');
	} catch (error) {
		console.error('Seeding failed:', error);
		throw error;
	}
}

// Run if called directly (ES Module compatible check)
try {
	seedDatabase()
		.then(async () => {
			console.log('Done!');
			await closeConnection();
			process.exit(0);
		})
		.catch(async (error) => {
			console.error('Seed error:', error);
			await closeConnection();
			process.exit(1);
		});
} catch (error) {
	console.error('Seed error:', error);
}
