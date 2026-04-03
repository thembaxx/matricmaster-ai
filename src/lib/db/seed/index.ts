import { resolve } from 'node:path';
import { config } from 'dotenv';

// Load environment variables explicitly to avoid authentication issues
const envPath = resolve(process.cwd(), '.env.local');
config({ path: envPath });

import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { dbManagerV2 } from '../database-manager-v2';
import { syncTableRegistry } from '../sync/registry';
import { seedCurriculumData } from './curriculum-data';
import { englishQuestions } from './english-questions';
import { historyQuestions } from './history-questions';
import { mathematicsQuestions } from './mathematics-questions';
import { pastPapersData } from './past-papers';
import { physicsQuestions } from './physics-questions';

export async function seedDatabase() {
	console.log('🔄 Starting database seeding...');

	await dbManagerV2.initialize();
	const activeDb = dbManagerV2.getActiveDatabase();
	const useDb = await dbManagerV2.getDbRaw();

	console.log(`📡 Active Database: ${activeDb}`);

	const getT = (name: string) => {
		const mapping = syncTableRegistry.find((m) => m.tableName === name);
		if (!mapping) throw new Error(`Table mapping not found for: ${name}`);
		return activeDb === 'sqlite' ? mapping.sqliteTable : mapping.pgTable;
	};

	const formatDate = (date: Date) => (activeDb === 'sqlite' ? date.toISOString() : date);

	const subjectsTable = getT('subjects');
	const questionsTable = getT('questions');
	const optionsTable = getT('options');
	const usersTable = getT('users');
	const pastPapersTable = getT('past_papers');

	try {
		console.log('📊 Checking existing data...');

		// Check existing subjects
		const existingSubjects: any[] = await useDb.select().from(subjectsTable);
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

		// Insert missing subjects
		const subjectsToInsert = requiredSubjects.filter(
			(subject) => !existingSubjects.some((existing) => existing.slug === subject.slug)
		);

		if (subjectsToInsert.length > 0) {
			console.log(`📝 Inserting ${subjectsToInsert.length} missing subjects...`);
			await useDb.insert(subjectsTable).values(
				subjectsToInsert.map((subject) => {
					const values: any = {
						...subject,
						isActive: true,
						createdAt: formatDate(new Date()),
						updatedAt: formatDate(new Date()),
					};
					if (activeDb === 'sqlite') {
						values.lastModifiedAt = formatDate(new Date());
						values.localUpdatedAt = formatDate(new Date());
					}
					return values;
				})
			);
			console.log(`✓ Successfully inserted ${subjectsToInsert.length} subjects`);
		}

		// Re-fetch all subjects to get IDs
		const allSubjects: any[] = await useDb.select().from(subjectsTable);

		const getSubject = (slug: string) => allSubjects.find((s) => s.slug === slug);
		const historySubject = getSubject('history');
		const englishSubject = getSubject('english');
		const mathematicsSubject = getSubject('mathematics');
		const physicsSubject = getSubject('physics');

		if (!historySubject || !englishSubject || !mathematicsSubject || !physicsSubject) {
			throw new Error('Failed to get all required subjects');
		}

		// Helper to check if question exists
		const questionExists = async (text: string, subjectId: number) => {
			const existing = await useDb
				.select()
				.from(questionsTable)
				.where(and(eq(questionsTable.questionText, text), eq(questionsTable.subjectId, subjectId)))
				.limit(1);
			return existing.length > 0;
		};

		const seedQuestionSet = async (subject: any, questionsData: any[], name: string) => {
			console.log(`Seeding ${name} questions...`);
			let count = 0;
			for (const q of questionsData) {
				if (await questionExists(q.questionText, subject.id)) continue;

				await useDb.transaction(async (tx: any) => {
					const qValues: any = {
						id: crypto.randomUUID(),
						subjectId: subject.id,
						questionText: q.questionText,
						imageUrl: (q as any).imageUrl || null,
						gradeLevel: q.gradeLevel,
						topic: q.topic,
						difficulty: q.difficulty,
						marks: q.marks,
						isActive: true,
						createdAt: formatDate(new Date()),
						updatedAt: formatDate(new Date()),
					};
					if (activeDb === 'sqlite') {
						qValues.lastModifiedAt = formatDate(new Date());
						qValues.localUpdatedAt = formatDate(new Date());
					}

					const [question] = await tx.insert(questionsTable).values(qValues).returning();

					for (const opt of q.options) {
						const optValues: any = {
							id: crypto.randomUUID(),
							questionId: question.id,
							optionText: opt.text || opt.optionText,
							isCorrect: opt.isCorrect,
							optionLetter: opt.letter || opt.optionLetter,
							explanation: opt.explanation || null,
							isActive: true,
							createdAt: formatDate(new Date()),
						};
						if (activeDb === 'sqlite') {
							optValues.updatedAt = formatDate(new Date());
							optValues.lastModifiedAt = formatDate(new Date());
							optValues.localUpdatedAt = formatDate(new Date());
						}
						await tx.insert(optionsTable).values(optValues);
					}
				});
				count++;
			}
			console.log(`✓ ${count} new ${name} questions seeded`);
		};

		await seedQuestionSet(historySubject, historyQuestions, 'History');
		await seedQuestionSet(englishSubject, englishQuestions, 'English');
		await seedQuestionSet(mathematicsSubject, mathematicsQuestions, 'Mathematics');
		await seedQuestionSet(physicsSubject, physicsQuestions, 'Physics');

		// Seed Past Papers
		console.log('Seeding Past Papers...');
		let papersCount = 0;
		for (const p of pastPapersData) {
			const existing = await useDb
				.select()
				.from(pastPapersTable)
				.where(eq(pastPapersTable.paperId, p.paperId))
				.limit(1);

			if (existing.length > 0) continue;

			const pValues: any = {
				...p,
				id: crypto.randomUUID(),
				createdAt: formatDate(new Date()),
				updatedAt: formatDate(new Date()),
			};
			if (activeDb === 'sqlite') {
				pValues.lastModifiedAt = formatDate(new Date());
				pValues.localUpdatedAt = formatDate(new Date());
			}

			await useDb.insert(pastPapersTable).values(pValues);
			papersCount++;
		}
		console.log(`✓ ${papersCount} new Past Papers seeded`);

		// Seed Test User
		const testEmail = 'student@lumni.ai';
		const existingUser = await useDb
			.select()
			.from(usersTable)
			.where(eq(usersTable.email, testEmail))
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
				console.log('✓ Test user seeded via Auth API');
			} catch (_authError) {
				const userValues: any = {
					id: crypto.randomUUID(),
					email: testEmail,
					name: 'Test Student',
					emailVerified: true,
					role: 'user',
					createdAt: formatDate(new Date()),
					updatedAt: formatDate(new Date()),
				};
				if (activeDb === 'sqlite') {
					userValues.isBlocked = false;
					userValues.twoFactorEnabled = false;
					userValues.lastModifiedAt = formatDate(new Date());
					userValues.localUpdatedAt = formatDate(new Date());
				} else {
					userValues.is_blocked = false;
					userValues.twoFactorEnabled = false;
				}
				await useDb.insert(usersTable).values(userValues);
				console.log('✓ Test user seeded directly to database');
			}
		}

		console.log('\n🔄 Seeding curriculum data...');
		await seedCurriculumData();

		console.log('\n✅ Database seeding completed successfully!');
	} catch (error) {
		console.error('❌ Seeding failed:', error);
		throw error;
	}
}
