import type { QuizAnswer, QuizResult } from '@/types/quiz';
import type { MockStudyPlan, MockStudySession, MockUser } from './mocks';

const SUBJECTS = [
	'Mathematics',
	'Physical Sciences',
	'Life Sciences',
	'Geography',
	'History',
	'Accounting',
	'Economics',
	'English Home Language',
];

const TOPICS: Record<string, string[]> = {
	Mathematics: ['Algebra', 'Calculus', 'Functions', 'Trigonometry', 'Geometry', 'Statistics'],
	'Physical Sciences': ['Mechanics', 'Waves', 'Electricity', 'Matter', 'Chemical Reactions'],
	'Life Sciences': ['Cell Biology', 'Genetics', 'Evolution', 'Human Reproduction', 'Ecology'],
	Geography: ['Geomorphology', 'Climate', 'Population', 'Settlement', 'Economic Geography'],
	History: ['Industrial Revolution', 'World War I', 'World War II', 'Apartheid', 'Cold War'],
	Accounting: ['Financial Statements', 'Cash Flow', 'Budgets', 'Cost Accounting', 'Taxation'],
	Economics: ['Microeconomics', 'Macroeconomics', 'Markets', 'Economic Growth', 'Trade'],
};

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
const QUESTION_TYPES = ['mcq', 'shortAnswer', 'trueFalse'] as const;

function randomElement<T>(arr: readonly T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function randomId(prefix = 'id'): string {
	return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo = 30): Date {
	const date = new Date();
	date.setDate(date.getDate() - randomInt(0, daysAgo));
	return date;
}

export function generateRandomUser(overrides: Partial<MockUser> = {}): MockUser {
	const now = new Date();
	const subjectCount = randomInt(1, 4);
	const selectedSubjects = [...SUBJECTS].sort(() => Math.random() - 0.5).slice(0, subjectCount);

	const totalQuestions = randomInt(50, 2000);
	const totalCorrect = randomInt(0, totalQuestions);

	return {
		id: randomId('user'),
		email: `user${randomInt(1, 9999)}@example.com`,
		name: `Test User ${randomInt(1, 1000)}`,
		role: 'student',
		avatar: null,
		createdAt: randomDate(365),
		updatedAt: now,
		preferences: {
			subjects: selectedSubjects,
			studyGoal: randomElement(['university_admission', 'improve_grades', 'pass_matric']),
			targetUniversity: randomElement([
				'University of Pretoria',
				'University of Cape Town',
				'University of Johannesburg',
				'Wits University',
				null,
			]),
			desiredCourse: randomElement(['Engineering', 'Medicine', 'Commerce', 'Science', null]),
			dailyStudyTime: randomInt(30, 180),
			preferredSessionLength: randomInt(15, 60),
			notifications: {
				reminders: Math.random() > 0.3,
				achievements: Math.random() > 0.5,
				leaderboard: Math.random() > 0.7,
			},
		},
		progress: {
			totalQuestionsAttempted: totalQuestions,
			totalCorrect,
			overallAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
			currentStreak: randomInt(0, 30),
			bestStreak: randomInt(0, 60),
			totalStudyHours: randomInt(5, 200),
			subjectsMastered: selectedSubjects.slice(0, randomInt(0, 2)),
			weakSubjects: selectedSubjects.slice(-randomInt(1, 2)),
		},
		subscription: {
			plan: Math.random() > 0.7 ? 'premium' : 'free',
			status: 'active',
			expiresAt:
				Math.random() > 0.5
					? new Date(Date.now() + randomInt(30, 365) * 24 * 60 * 60 * 1000).toISOString()
					: null,
		},
		...overrides,
	};
}

export function generateRandomQuizQuestion() {
	const subject = randomElement(SUBJECTS);
	const topics = TOPICS[subject] || ['General'];
	const topic = randomElement(topics);

	const questionTemplates: Record<string, string> = {
		Mathematics: `Solve for x: ${randomInt(2, 10)}x ${randomElement(['+', '-'])} ${randomInt(1, 20)} = ${randomInt(10, 50)}`,
		'Physical Sciences': `Calculate the ${randomElement(['force', 'velocity', 'energy', 'power'])} when ${randomElement(['mass', 'distance', 'time'])} = ${randomInt(1, 100)}${randomElement(['kg', 'm', 's', 'J', 'W'])}`,
		'Life Sciences': `Explain the process of ${randomElement(['photosynthesis', 'cell division', 'DNA replication', 'mitosis'])}`,
		Geography: `Describe the factors that influence ${randomElement(['climate', 'population distribution', 'settlement patterns'])}`,
		History: `Discuss the causes of ${randomElement(['the Industrial Revolution', 'World War I', 'Apartheid'])}`,
		Accounting: `Calculate the ${randomElement(['net profit', 'gross profit', 'break-even point'])} given revenue = R${randomInt(10000, 100000)}`,
		Economics: `Explain the concept of ${randomElement(['supply and demand', 'elasticity', 'inflation', 'unemployment'])}`,
		'English Home Language': `Write a paragraph about ${randomElement(['your future', 'education', 'career goals'])}`,
	};

	return {
		id: randomId('q'),
		type: randomElement(QUESTION_TYPES),
		subject,
		topic,
		subtopic: `${topic} - ${randomElement(['Basics', 'Intermediate', 'Advanced'])}`,
		difficulty: randomElement(DIFFICULTIES),
		question: questionTemplates[subject] || 'Sample question',
		options:
			randomElement(QUESTION_TYPES) === 'mcq'
				? [
						{ id: 'a', text: `Option A - ${randomInt(1, 100)}` },
						{ id: 'b', text: `Option B - ${randomInt(1, 100)}` },
						{ id: 'c', text: `Option C - ${randomInt(1, 100)}` },
						{ id: 'd', text: `Option D - ${randomInt(1, 100)}` },
					]
				: undefined,
		correctAnswer: randomElement(['a', 'b', 'c', 'd']),
		hint: `Hint: Consider the key concepts in ${topic}`,
		marks: randomElement([1, 2, 3, 4, 5, 6]),
		year: randomInt(2020, 2025),
		paper: randomInt(1, 3),
		session: randomElement(['November', 'June', 'March']),
	};
}

export function generateRandomQuizSession() {
	const now = new Date();
	const questionCount = randomInt(5, 15);
	const answers: QuizAnswer[] = [];

	for (let i = 0; i < questionCount; i++) {
		const isCorrect = Math.random() > 0.4;
		answers.push({
			questionId: randomId('q'),
			selectedOption: randomElement(['a', 'b', 'c', 'd']),
			isCorrect,
			timeSpentSeconds: randomInt(10, 120),
		});
	}

	return {
		quizId: randomId('quiz'),
		subjectName: randomElement(SUBJECTS),
		topic: randomElement(TOPICS.Mathematics || ['General']),
		startedAt: new Date(now.getTime() - randomInt(300, 3600) * 1000),
		answers,
		currentQuestionIndex: randomInt(0, questionCount - 1),
	};
}

export function generateRandomQuizResult(overrides: Partial<QuizResult> = {}): QuizResult {
	const totalQuestions = randomInt(5, 20);
	const correctAnswers = randomInt(0, totalQuestions);

	return {
		correctAnswers,
		totalQuestions,
		durationSeconds: randomInt(300, 1800),
		accuracy: Math.round((correctAnswers / totalQuestions) * 100),
		subjectId: randomInt(1, SUBJECTS.length),
		subjectName: randomElement(SUBJECTS),
		difficulty: randomElement(DIFFICULTIES),
		topic: randomElement(TOPICS.Mathematics || ['General']),
		completedAt: randomDate(30),
		...overrides,
	};
}

export function generateRandomStudySession(
	overrides: Partial<MockStudySession> = {}
): MockStudySession {
	const now = new Date();
	return {
		id: randomId('session'),
		date: new Date(now.getTime() - randomInt(0, 30) * 24 * 60 * 60 * 1000),
		duration: randomInt(15, 90),
		subject: randomElement(SUBJECTS),
		topics: [randomElement(TOPICS.Mathematics || ['General'])],
		completed: Math.random() > 0.3,
		notes: Math.random() > 0.5 ? 'Completed additional practice problems' : undefined,
		...overrides,
	};
}

export function generateRandomStudyPlan(overrides: Partial<MockStudyPlan> = {}): MockStudyPlan {
	const now = new Date();
	const weekCount = randomInt(4, 12);

	const weeks = Array.from({ length: weekCount }, (_, i) => ({
		weekNumber: i + 1,
		topics: Array.from({ length: randomInt(1, 3) }, () => ({
			id: randomId('topic'),
			name: randomElement(TOPICS.Mathematics || ['General']),
			subtopics: ['Subtopic 1', 'Subtopic 2'],
			priority: randomInt(1, 5),
			completed: Math.random() > 0.5,
		})),
		studySessions: Array.from({ length: randomInt(2, 5) }, () => generateRandomStudySession()),
	}));

	return {
		id: randomId('plan'),
		userId: randomId('user'),
		title: `${randomElement(['Mathematics', 'Physical Sciences', 'Life Sciences'])} Study Plan`,
		subject: randomElement(SUBJECTS),
		weeks,
		createdAt: randomDate(60),
		updatedAt: now,
		status: randomElement(['active', 'completed', 'paused']),
		...overrides,
	};
}

export function generateRandomStudyPlans(count: number): MockStudyPlan[] {
	return Array.from({ length: count }, () => generateRandomStudyPlan());
}

export function generateRandomUsers(count: number): MockUser[] {
	return Array.from({ length: count }, () => generateRandomUser());
}

export function generateRandomQuizResults(count: number): QuizResult[] {
	return Array.from({ length: count }, () => generateRandomQuizResult());
}

export function generateBatchQuizQuestions(count: number) {
	return Array.from({ length: count }, () => generateRandomQuizQuestion());
}
