import { SUBJECTS } from '@/constants/subjects';
import type { Subject } from './types';

export const english: Subject = {
	id: 'english',
	name: 'English',
	color: 'bg-subject-english',
	icon: SUBJECTS.english.emoji,
	topics: [
		{
			id: 'e1',
			name: 'Comprehension',
			status: 'mastered',
			progress: 100,
			lastPracticed: '3 days ago',
			questionsAttempted: 30,
		},
		{
			id: 'e2',
			name: 'Summary Writing',
			status: 'mastered',
			progress: 100,
			lastPracticed: '5 days ago',
			questionsAttempted: 25,
		},
		{
			id: 'e3',
			name: 'Essay Writing',
			status: 'in-progress',
			progress: 70,
			lastPracticed: 'Today',
			questionsAttempted: 12,
		},
		{
			id: 'e4',
			name: 'Poetry Analysis',
			status: 'in-progress',
			progress: 45,
			lastPracticed: 'Yesterday',
			questionsAttempted: 14,
		},
		{ id: 'e5', name: 'Literature', status: 'not-started', progress: 0, questionsAttempted: 0 },
		{
			id: 'e6',
			name: 'Language Structures',
			status: 'not-started',
			progress: 0,
			questionsAttempted: 0,
		},
		{ id: 'e7', name: 'Advertising', status: 'not-started', progress: 0, questionsAttempted: 0 },
		{
			id: 'e8',
			name: 'Visual Literacy',
			status: 'not-started',
			progress: 0,
			questionsAttempted: 0,
		},
	],
};
