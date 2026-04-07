export type QuizQuestion = {
	id: string;
	subject: string;
	question: string;
	options: string[];
	correctAnswer: number;
	explanation: string;
};

export const MOCK_QUESTIONS: Record<string, QuizQuestion[]> = {
	math: [
		{
			id: 'm1',
			subject: 'Mathematics',
			question: 'What is the derivative of f(x) = x²?',
			options: ['x', '2x', '2', 'x³'],
			correctAnswer: 1,
			explanation: 'Using the power rule, d/dx(x^n) = nx^(n-1). For x², it is 2x.',
		},
		{
			id: 'm2',
			subject: 'Mathematics',
			question: 'Which of the following is a property of a circle?',
			options: [
				'All radii are different',
				'Diameter is 2x radius',
				'Symmetry is only vertical',
				'Circumference is πr',
			],
			correctAnswer: 1,
			explanation: 'The diameter is always exactly twice the length of the radius.',
		},
		{
			id: 'm3',
			subject: 'Mathematics',
			question: 'Solve for x: 2x + 5 = 15',
			options: ['10', 'S', '5', '20'],
			correctAnswer: 2,
			explanation: 'Subtract 5 from both sides (2x=10), then divide by 2 (x=5).',
		},
	],
	physics: [
		{
			id: 'p1',
			subject: 'Physical Sciences',
			question: "What is Newton's Second Law?",
			options: ['F = ma', 'E = mc²', 'v = u + at', 'p = mv'],
			correctAnswer: 0,
			explanation: 'Force equals mass times acceleration (F=ma).',
		},
		{
			id: 'p2',
			subject: 'Physical Sciences',
			question: 'The unit of electrical resistance is...',
			options: ['Ampere', 'Volt', 'Ohm', 'Watt'],
			correctAnswer: 2,
			explanation: 'Resistance is measured in Ohms (Ω).',
		},
		{
			id: 'p3',
			subject: 'Physical Sciences',
			question: 'What is the speed of light in a vacuum?',
			options: ['3 x 10⁸ m/s', '1.5 x 10⁸ m/s', '3 x 10¹⁰ m/s', '300,000 km/h'],
			correctAnswer: 0,
			explanation: 'The speed of light is approximately 299,792,458 m/s.',
		},
	],
	// Fallback for other subjects
	default: [
		{
			id: 'd1',
			subject: 'General',
			question: 'Which of these is key to mastering any subject?',
			options: ['Rote memorization', 'Passive reading', 'Active recall', 'Avoiding mistakes'],
			correctAnswer: 2,
			explanation:
				'Active recall is the most effective way to move information into long-term memory.',
		},
		{
			id: 'd2',
			subject: 'General',
			question: 'What is the best way to use past papers?',
			options: [
				'Read the answers first',
				'Do them under timed conditions',
				'Only do the easy ones',
				'Copy them into a notebook',
			],
			correctAnswer: 1,
			explanation: 'Simulating exam conditions reduces anxiety and reveals true blind spots.',
		},
		{
			id: 'd3',
			subject: 'General',
			question: 'When should you review a mistake?',
			options: [
				'Next month',
				'Immediately after understanding why',
				'Never',
				'Only before the final exam',
			],
			correctAnswer: 1,
			explanation:
				'Correcting a mental model immediately after a mistake creates the strongest learning link.',
		},
	],
};

export function generateStudyPlan(subject: string, correctCount: number) {
	const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);
	const level =
		correctCount === 3 ? 'Advanced' : correctCount === 2 ? 'Intermediate' : 'Foundational';

	return {
		level,
		days: [
			{
				day: 1,
				focus: `Core ${subjectName} Concepts`,
				task: 'Master the top 3 most frequent exam topics.',
			},
			{
				day: 2,
				focus: 'Active Recall Session',
				task: 'Complete 10 targeted questions on your weak areas.',
			},
			{
				day: 3,
				focus: 'AI Tutor Deep Dive',
				task: 'Review the 3 most common mistakes for this subject.',
			},
			{
				day: 4,
				focus: 'Timed Mini-Paper',
				task: 'Complete a 30-minute focused blast of Question 1s.',
			},
			{
				day: 5,
				focus: 'Gap Closure',
				task: 'Targeted review of the topic you struggled with most.',
			},
			{
				day: 6,
				focus: 'Confidence Builder',
				task: 'Solve 5 "Easy" and 2 "Hard" past paper questions.',
			},
			{
				day: 7,
				focus: 'Final Strategy Review',
				task: 'Map out the time allocation for the full paper.',
			},
		],
	};
}
