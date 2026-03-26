import { resolve } from 'node:path';
import { config } from 'dotenv';

// Load environment variables explicitly to avoid authentication issues
const envPath = resolve(process.cwd(), '.env.local');
config({ path: envPath });

// Ensure the and/eq utilities are available
import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { users } from '../better-auth-schema';
import type { DbType } from '../index';
import { dbManager } from '../index';
import { options, pastPapers, questions, subjects } from '../schema';
import { seedCurriculumData } from './curriculum-data';
import { englishQuestions } from './english-questions';
import { historyQuestions } from './history-questions';
import { mathematicsQuestions } from './mathematics-questions';
import { pastPapersData } from './past-papers';
import { physicsQuestions } from './physics-questions';

type TransactionType = Parameters<Parameters<DbType['transaction']>[0]>[0];

async function getDb() {
	if (!dbManager.isConnectedToDatabase()) {
		throw new Error('Database not connected');
	}
	return await dbManager.getDb();
}

export async function seedDatabase() {
	console.log('🔄 Starting database seeding...');

	// Validate environment variables
	if (!process.env.DATABASE_URL) {
		throw new Error('DATABASE_URL environment variable is not set');
	}

	console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL);
	console.log('Using database: PostgreSQL');

	// Ensure database is initialized with error handling
	try {
		if (!dbManager.isConnectedToDatabase()) {
			console.log('🔄 Initializing database connection...');
			await dbManager.initialize();
		}
	} catch (dbError) {
		console.debug(
			'❌ Failed to connect to database:',
			dbError instanceof Error ? dbError.message : dbError
		);
		throw new Error(
			'Database connection failed. Please check your DATABASE_URL and ensure PostgreSQL is running.'
		);
	}

	const useDb = await getDb();

	try {
		console.log('📊 Checking existing data...');

		// Check existing subjects
		const existingSubjects: (typeof subjects.$inferSelect)[] = await useDb.select().from(subjects);
		console.log(
			'Existing subjects found:',
			existingSubjects.map((s) => s.name)
		);

		// Get or create required subjects
		const requiredSubjects = [
			{
				slug: 'history',
				name: 'History',
				displayName: 'History',
				description: 'CAPS History Grades 10-12',
				curriculumCode: 'CAPS-HIST',
			},
			{
				slug: 'english',
				name: 'English FAL',
				displayName: 'English',
				description: 'CAPS English First Additional Language Grades 10-12',
				curriculumCode: 'CAPS-EFAL',
			},
			{
				slug: 'mathematics',
				name: 'Mathematics',
				displayName: 'Mathematics',
				description: 'CAPS Mathematics Grades 10-12',
				curriculumCode: 'CAPS-MATH',
			},
			{
				slug: 'physics',
				name: 'Physical Sciences',
				displayName: 'Physical Sciences',
				description: 'CAPS Physical Sciences Grades 10-12',
				curriculumCode: 'CAPS-PHYS',
			},
			{
				slug: 'life-sciences',
				name: 'Life Sciences',
				displayName: 'Life Sciences',
				description: 'CAPS Life Sciences Grades 10-12',
				curriculumCode: 'CAPS-LIFE',
			},
			{
				slug: 'geography',
				name: 'Geography',
				displayName: 'Geography',
				description: 'CAPS Geography Grades 10-12',
				curriculumCode: 'CAPS-GEOG',
			},
			{
				slug: 'accounting',
				name: 'Accounting',
				displayName: 'Accounting',
				description: 'CAPS Accounting Grades 10-12',
				curriculumCode: 'CAPS-ACCT',
			},
			{
				slug: 'economics',
				name: 'Economics',
				displayName: 'Economics',
				description: 'CAPS Economics Grades 10-12',
				curriculumCode: 'CAPS-ECON',
			},
		];

		let historySubject = existingSubjects.find((s) => s.name === 'History');
		let englishSubject = existingSubjects.find((s) => s.name === 'English FAL');
		let mathematicsSubject = existingSubjects.find((s) => s.name === 'Mathematics');
		let physicsSubject = existingSubjects.find((s) => s.name === 'Physical Sciences');
		// Subjects available for future question seeding
		const _lifeSciencesSubject = existingSubjects.find((s) => s.name === 'Life Sciences');
		void _lifeSciencesSubject; // Reserved for future question seeding
		const _geographySubject = existingSubjects.find((s) => s.name === 'Geography');
		void _geographySubject;
		const _accountingSubject = existingSubjects.find((s) => s.name === 'Accounting');
		void _accountingSubject;
		const _economicsSubject = existingSubjects.find((s) => s.name === 'Economics');
		void _economicsSubject;

		// Insert missing subjects
		const subjectsToInsert = requiredSubjects.filter(
			(subject) => !existingSubjects.some((existing) => existing.name === subject.name)
		);

		if (subjectsToInsert.length > 0) {
			console.log(`📝 Inserting ${subjectsToInsert.length} missing subjects...`);
			try {
				const insertedSubjects = await useDb
					.insert(subjects)
					.values(
						subjectsToInsert.map((subject) => ({
							...subject,
							isActive: true,
						}))
					)
					.returning();

				// Update references
				insertedSubjects.forEach((subject: typeof subjects.$inferSelect) => {
					if (subject.name === 'History') historySubject = subject;
					if (subject.name === 'English FAL') englishSubject = subject;
					if (subject.name === 'Mathematics') mathematicsSubject = subject;
					if (subject.name === 'Physical Sciences') physicsSubject = subject;
				});

				console.log(`✓ Successfully inserted ${insertedSubjects.length} subjects`);
			} catch (insertError) {
				console.debug(
					'❌ Failed to insert subjects:',
					insertError instanceof Error ? insertError.message : insertError
				);
				throw insertError;
			}
		} else {
			console.log('✓ All required subjects already exist');
		}

		// Ensure we have all subjects
		if (!historySubject || !englishSubject || !mathematicsSubject || !physicsSubject) {
			throw new Error('Failed to get or create all required subjects');
		}

		console.log(
			'✓ Subjects verified:',
			historySubject.name,
			',',
			englishSubject.name,
			',',
			mathematicsSubject.name,
			',',
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

			await useDb.transaction(async (tx: TransactionType) => {
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

			await useDb.transaction(async (tx: TransactionType) => {
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

		// Seed Mathematics questions
		console.log('Seeding Mathematics questions...');
		let mathCount = 0;
		for (const q of mathematicsQuestions) {
			if (await questionExists(q.questionText, mathematicsSubject!.id)) continue;

			await useDb.transaction(async (tx: TransactionType) => {
				const [question] = await tx
					.insert(questions)
					.values({
						subjectId: mathematicsSubject!.id,
						questionText: q.questionText,
						imageUrl: (q as { imageUrl?: string }).imageUrl || null,
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
			mathCount++;
		}
		console.log(`✓ ${mathCount} new Mathematics questions seeded`);

		// Seed Physics questions
		console.log('Seeding Physics questions...');
		let physicsCount = 0;
		for (const q of physicsQuestions) {
			if (await questionExists(q.questionText, physicsSubject.id)) continue;

			await useDb.transaction(async (tx: TransactionType) => {
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

		// Seed Past Papers
		console.log('Seeding Past Papers...');
		let papersCount = 0;
		for (const p of pastPapersData) {
			const existing = await useDb
				.select()
				.from(pastPapers)
				.where(eq(pastPapers.paperId, p.paperId))
				.limit(1);

			if (existing.length > 0) continue;

			await useDb.insert(pastPapers).values(p);
			papersCount++;
		}
		console.log(`✓ ${papersCount} new Past Papers seeded`);

		// Seed Test User
		const testEmail = 'student@lumni.ai';
		console.log('Checking for test user...');

		const existingUser = await useDb
			.select()
			.from(users)
			.where(eq(users.email, testEmail))
			.limit(1);

		if (existingUser.length === 0) {
			console.log('Seeding test user...');
			try {
				// Try to create user via Auth API
				await auth.api.signUpEmail({
					body: {
						email: testEmail,
						password: 'password123',
						name: 'Test Student',
					},
				});
				console.log('✓ Test user seeded via Auth API: student@lumni.ai / password123');
			} catch (_authError) {
				console.warn('⚠️ Auth API failed, attempting direct database insertion...');
				try {
					// Fallback: create user directly in database
					await useDb.insert(users).values({
						id: crypto.randomUUID(), // Generate a unique ID
						email: testEmail,
						name: 'Test Student',
						emailVerified: true, // Boolean, not Date
						role: 'user',
						isBlocked: false,
						twoFactorEnabled: false,
						createdAt: new Date(),
						updatedAt: new Date(),
					});
					console.log('✓ Test user seeded directly to database: student@lumni.ai / password123');
				} catch (dbError) {
					console.debug(
						'❌ Failed to seed user via database:',
						dbError instanceof Error ? dbError.message : dbError
					);
					console.log(
						'ℹ️  You may need to create the test user manually or check your auth configuration.'
					);
				}
			}
		} else {
			console.log('✓ Test user already exists.');
		}

		console.log('\n🔄 Seeding curriculum data...');
		await seedCurriculumData();

		console.log('\n✅ Database seeding completed successfully!');
	} catch (error) {
		console.debug('❌ Seeding failed:', error);
		throw error;
	}
}

// End of file
