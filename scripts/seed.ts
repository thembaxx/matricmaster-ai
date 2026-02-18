/**
 * Seed Script - Add sample data to the database
 * Run with: bun run scripts/seed.ts
 */

import { dbManager } from '@/lib/db';
import { options, questions, subjects } from '@/lib/db/schema';

async function waitForDb(maxAttempts = 10, delay = 1000): Promise<boolean> {
	for (let i = 0; i < maxAttempts; i++) {
		const connected = await dbManager.waitForConnection(1, delay);
		if (connected) {
			return true;
		}
		console.log(`Waiting for database... (${i + 1}/${maxAttempts})`);
	}
	return false;
}

async function seed() {
	console.log('🌱 Starting seed...');

	// Wait for database connection
	console.log('⏳ Waiting for database connection...');
	const connected = await waitForDb();
	if (!connected) {
		console.error('❌ Could not connect to database');
		process.exit(1);
	}

	console.log('✅ Database connected!');

	const db = dbManager.getDb();

	// 1. Seed Subjects
	console.log('📚 Adding subjects...');

	const subjectIds = await db
		.insert(subjects)
		.values([
			{
				name: 'Mathematics',
				description: 'Mathematics P1 & P2',
				curriculumCode: 'MAT',
				isActive: true,
			},
			{
				name: 'Physical Sciences',
				description: 'Physics & Chemistry',
				curriculumCode: 'PHY',
				isActive: true,
			},
			{
				name: 'English FAL',
				description: 'English First Additional Language',
				curriculumCode: 'ENG',
				isActive: true,
			},
			{ name: 'Life Sciences', description: 'Biology', curriculumCode: 'LIF', isActive: true },
			{ name: 'Geography', description: 'Geography', curriculumCode: 'GEO', isActive: true },
			{ name: 'Accounting', description: 'Accounting', curriculumCode: 'ACC', isActive: true },
			{ name: 'History', description: 'History', curriculumCode: 'HIS', isActive: true },
		])
		.returning({ id: subjects.id });

	console.log(`✅ Added ${subjectIds.length} subjects`);

	// 2. Seed Questions for Mathematics
	console.log('📝 Adding sample questions...');

	const mathQuestions = await db
		.insert(questions)
		.values([
			{
				subjectId: subjectIds[0].id,
				questionText: 'Find the derivative of f(x) = x³ - 3x² + 2x',
				gradeLevel: 12,
				topic: 'Calculus',
				difficulty: 'medium',
				marks: 5,
				hint: 'Use the power rule: d/dx(x^n) = nx^(n-1)',
			},
			{
				subjectId: subjectIds[0].id,
				questionText: 'Solve for x: 2x² - 5x - 3 = 0',
				gradeLevel: 10,
				topic: 'Algebra',
				difficulty: 'easy',
				marks: 3,
				hint: 'Use the quadratic formula or factorization',
			},
			{
				subjectId: subjectIds[0].id,
				questionText: 'Calculate the integral: ∫(3x² + 2x - 1)dx',
				gradeLevel: 12,
				topic: 'Calculus',
				difficulty: 'hard',
				marks: 6,
				hint: 'Remember to add the constant of integration',
			},
		])
		.returning({ id: questions.id });

	console.log(`✅ Added ${mathQuestions.length} math questions`);

	// 3. Seed Options
	const allOptions = [];

	allOptions.push(
		{
			questionId: mathQuestions[0].id,
			optionText: '3x² - 6x + 2',
			isCorrect: true,
			optionLetter: 'A',
			explanation: 'Using power rule',
		},
		{
			questionId: mathQuestions[0].id,
			optionText: 'x³ - 3x² + 2x',
			isCorrect: false,
			optionLetter: 'B',
			explanation: 'This is the original function',
		},
		{
			questionId: mathQuestions[0].id,
			optionText: '3x - 6',
			isCorrect: false,
			optionLetter: 'C',
			explanation: 'Incorrect application',
		},
		{
			questionId: mathQuestions[0].id,
			optionText: 'x² - 2x',
			isCorrect: false,
			optionLetter: 'D',
			explanation: 'Wrong coefficients',
		}
	);

	allOptions.push(
		{
			questionId: mathQuestions[1].id,
			optionText: 'x = 3 or x = -0.5',
			isCorrect: true,
			optionLetter: 'A',
			explanation: 'Factor: (2x+1)(x-3)=0',
		},
		{
			questionId: mathQuestions[1].id,
			optionText: 'x = 2 or x = 1.5',
			isCorrect: false,
			optionLetter: 'B',
			explanation: 'Incorrect factorization',
		},
		{
			questionId: mathQuestions[1].id,
			optionText: 'x = 1 or x = -3',
			isCorrect: false,
			optionLetter: 'C',
			explanation: 'Does not satisfy',
		},
		{
			questionId: mathQuestions[1].id,
			optionText: 'x = 0.5 or x = -3',
			isCorrect: false,
			optionLetter: 'D',
			explanation: 'Close but wrong',
		}
	);

	allOptions.push(
		{
			questionId: mathQuestions[2].id,
			optionText: 'x³ + x² - x + C',
			isCorrect: true,
			optionLetter: 'A',
			explanation: 'Correct integration',
		},
		{
			questionId: mathQuestions[2].id,
			optionText: '6x + 2 + C',
			isCorrect: false,
			optionLetter: 'B',
			explanation: 'This is the derivative',
		},
		{
			questionId: mathQuestions[2].id,
			optionText: 'x³ + x² + C',
			isCorrect: false,
			optionLetter: 'C',
			explanation: 'Missing term',
		},
		{
			questionId: mathQuestions[2].id,
			optionText: '(3x² + 2x - 1)x + C',
			isCorrect: false,
			optionLetter: 'D',
			explanation: 'Wrong method',
		}
	);

	await db.insert(options).values(allOptions);
	console.log(`✅ Added ${allOptions.length} options`);

	// Physics
	const physicsQuestions = await db
		.insert(questions)
		.values([
			{
				subjectId: subjectIds[1].id,
				questionText: 'A car accelerates from rest at 2m/s². What is its velocity after 5 seconds?',
				gradeLevel: 11,
				topic: 'Newton Laws',
				difficulty: 'easy',
				marks: 3,
				hint: 'Use v = u + at',
			},
			{
				subjectId: subjectIds[1].id,
				questionText: 'Calculate the kinetic energy of a 2kg object moving at 3m/s',
				gradeLevel: 10,
				topic: 'Energy',
				difficulty: 'easy',
				marks: 2,
				hint: 'KE = ½mv²',
			},
		])
		.returning({ id: questions.id });

	console.log(`✅ Added ${physicsQuestions.length} physics questions`);

	// Add options for physics questions
	const physicsOptions = [];

	// Physics Question 1 options
	physicsOptions.push(
		{
			questionId: physicsQuestions[0].id,
			optionText: '10 m/s',
			isCorrect: true,
			optionLetter: 'A',
			explanation: 'v = u + at = 0 + 2*5 = 10 m/s',
		},
		{
			questionId: physicsQuestions[0].id,
			optionText: '7 m/s',
			isCorrect: false,
			optionLetter: 'B',
			explanation: 'Incorrect calculation',
		},
		{
			questionId: physicsQuestions[0].id,
			optionText: '12 m/s',
			isCorrect: false,
			optionLetter: 'C',
			explanation: 'Incorrect calculation',
		},
		{
			questionId: physicsQuestions[0].id,
			optionText: '5 m/s',
			isCorrect: false,
			optionLetter: 'D',
			explanation: 'Incorrect formula used',
		}
	);

	// Physics Question 2 options
	physicsOptions.push(
		{
			questionId: physicsQuestions[1].id,
			optionText: '9 J',
			isCorrect: true,
			optionLetter: 'A',
			explanation: 'KE = ½mv² = ½ * 2 * 3² = 9 J',
		},
		{
			questionId: physicsQuestions[1].id,
			optionText: '6 J',
			isCorrect: false,
			optionLetter: 'B',
			explanation: 'Incorrect calculation',
		},
		{
			questionId: physicsQuestions[1].id,
			optionText: '18 J',
			isCorrect: false,
			optionLetter: 'C',
			explanation: 'Forgot to halve',
		},
		{
			questionId: physicsQuestions[1].id,
			optionText: '12 J',
			isCorrect: false,
			optionLetter: 'D',
			explanation: 'Incorrect formula',
		}
	);

	// Insert all physics options
	if (physicsOptions.length > 0) {
		await db.insert(options).values(physicsOptions);
		console.log(`✅ Added ${physicsOptions.length} physics options`);
	}

	console.log('\n🎉 Seed completed successfully!');
	console.log('\nTo use this data:');
	console.log('1. Run the app: bun run dev');
	console.log('2. Sign in as a user');
	console.log('3. The questions will be available for quizzes');
}

// Run seed and exit with error code on failure
seed()
	.then(() => {
		console.log('Seed process completed');
		process.exit(0);
	})
	.catch((error) => {
		console.error('❌ Seed failed:', error);
		process.exit(1);
	});
