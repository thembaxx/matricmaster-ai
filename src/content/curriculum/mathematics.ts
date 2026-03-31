import { SUBJECTS } from '@/content';
import type { Subject } from './types';

export const mathematics: Subject = {
	id: 'mathematics',
	name: 'Mathematics',
	color: 'bg-subject-math',
	icon: SUBJECTS.mathematics.emoji,
	topics: [
		{
			id: 'm1',
			name: 'Sequences & Series',
			status: 'mastered',
			progress: 100,
			lastPracticed: '2 days ago',
			questionsAttempted: 45,
		},
		{
			id: 'm2',
			name: 'Functions & Inverses',
			status: 'mastered',
			progress: 100,
			lastPracticed: '5 days ago',
			questionsAttempted: 38,
		},
		{
			id: 'm3',
			name: 'Differential Calculus',
			status: 'in-progress',
			progress: 65,
			lastPracticed: 'Today',
			questionsAttempted: 28,
		},
		{
			id: 'm4',
			name: 'Probability',
			status: 'in-progress',
			progress: 40,
			lastPracticed: 'Yesterday',
			questionsAttempted: 15,
		},
		{ id: 'm5', name: 'Trigonometry', status: 'not-started', progress: 0, questionsAttempted: 0 },
		{
			id: 'm6',
			name: 'Analytical Geometry',
			status: 'not-started',
			progress: 0,
			questionsAttempted: 0,
		},
		{
			id: 'm7',
			name: 'Euclidean Geometry',
			status: 'not-started',
			progress: 0,
			questionsAttempted: 0,
		},
		{ id: 'm8', name: 'Statistics', status: 'not-started', progress: 0, questionsAttempted: 0 },
	],
};

export const MATHEMATICS_TOPIC_WEIGHTS: Record<string, number> = {
	'Sequences & Series': 15,
	'Functions & Inverses': 30,
	'Differential Calculus': 25,
	Probability: 15,
	Trigonometry: 20,
	'Analytical Geometry': 15,
	'Euclidean Geometry': 15,
	Statistics: 10,
};
