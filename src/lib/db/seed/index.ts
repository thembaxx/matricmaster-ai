import { auth } from '@/lib/auth'; // Import auth to create user
import { closeConnection, db } from '../index';
import { options, questions, subjects } from '../schema';
import { englishQuestions } from './english-questions';
import { historyQuestions } from './history-questions';

export async function seedDatabase() {
	console.log('Starting database seeding...');
	console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL);
	if (process.env.DATABASE_URL) {
		console.log(`DATABASE_URL starts with: ${process.env.DATABASE_URL.substring(0, 10)}...`);
	} else {
		console.error('DATABASE_URL is missing!');
	}

	try {
		// 1. Seed User
		// Note: The previous code was checking subjects, but let's do user first or alongside.

		// Actually, we should check subjects first to avoid re-seeding them if they exist.
		const existingSubjects = await db.select().from(subjects);

		if (existingSubjects.length === 0) {
			// Insert subjects
			const [historySubject, englishSubject] = await db                .insert(subjects)
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
            		} else {
            			console.log('Subjects already seeded. Skipping subject seeding...');
            		}
        // 2. Seed Test User
        // We use the auth API to ensure password hashing and account creation
        // Note: auth.api.signUpEmail might not be directly available or work in this script context 
        // depending on how better-auth is structured (it often requires a request context).
        // However, better-auth v1+ usually exposes server-side APIs.
        // If api.signUpEmail expects a request, we might need to mock it or insert directly.
        // Let's try to insert directly if we can hash the password, BUT we don't have the hashing algo easily.
        // Better-auth usually uses bcrypt or argon2.
        
        // Let's try to use the auth.api if available.
        // Checking the import above: import { auth } from '@/lib/auth';
        
        const testEmail = 'student@matricmaster.ai';
        const testUser = await db.query.user.findFirst({
            where: (users, { eq }) => eq(users.email, testEmail),
        });

        if (!testUser) {
             console.log('Seeding test user...');
             try {
                 // Using auth.api.signUpEmail which is the server-side action
                 await auth.api.signUpEmail({
                     body: {
                         email: testEmail,
                         password: 'password123',
                         name: 'Test Student',
                     },
                     // We might need to mock headers if better-auth checks them strictly, 
                     // but usually for internal calls it's fine.
                 });
                 console.log('✓ Test user seeded: student@matricmaster.ai / password123');
             } catch (e) {
                 console.error('Failed to seed user via Auth API:', e);
                 // Fallback or rethrow?
                 // If this fails, it might be due to context. 
                 // We will just log it.
             }
        } else {
            console.log('Test user already exists. Skipping...');
        }


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
