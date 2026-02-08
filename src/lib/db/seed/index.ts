import { closeConnection, db } from '../index';
import { options, questions, subjects } from '../schema';
import { englishQuestions } from './english-questions';
import { historyQuestions } from './history-questions';

export async function seedDatabase() {
	console.log('Starting database seeding...');

	try {
		// Check if subjects already exist
		const existingSubjects = await db.select().from(subjects);
		if (existingSubjects.length > 0) {
			console.log('Database already seeded. Skipping...');
			return;
		}

		// Insert subjects
		const [historySubject, englishSubject] = await db
			.insert(subjects)
			.values([
				{
					name: 'History',
					description: 'CAPS History Grades 10-12',
					curriculumCode: 'CAPS-HIST',
					isActive: true,
				},
				{
					name: 'English FAL',
					description: 'CAPS English First Additional Language Grades 10-12',
					curriculumCode: 'CAPS-EFAL',
					isActive: true,
				},
			])
			.returning();

		console.log('✓ Subjects seeded:', historySubject.name, '&', englishSubject.name);

		// Seed History questions within transaction
		await db.transaction(async (tx) => {
			for (const q of historyQuestions) {
				const [question] = await tx
					.insert(questions)
					.values({
						subjectId: historySubject.id,
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
		await db.transaction(async (tx) => {
			for (const q of englishQuestions) {
				const [question] = await tx
					.insert(questions)
					.values({
						subjectId: englishSubject.id,
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

		console.log('\n✅ Database seeding completed successfully!');
	} catch (error) {
		console.error('Seeding failed:', error);
		throw error;
	}
}

// Run if called directly (ES Module compatible check)
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
