import { SUBJECTS } from '@/lib/content-adapter';
import type { Subject } from './types';

export const lifeSciences: Subject = {
	id: 'life-sciences',
	name: 'Life Sciences',
	color: 'bg-subject-life',
	icon: SUBJECTS['life-sciences'].emoji,
	topics: [
		{
			id: 'l1',
			name: 'DNA & RNA',
			status: 'mastered',
			progress: 100,
			lastPracticed: '4 days ago',
			questionsAttempted: 41,
		},
		{
			id: 'l2',
			name: 'Genetics',
			status: 'mastered',
			progress: 100,
			lastPracticed: '1 week ago',
			questionsAttempted: 56,
		},
		{
			id: 'l3',
			name: 'Evolution',
			status: 'in-progress',
			progress: 55,
			lastPracticed: 'Yesterday',
			questionsAttempted: 18,
		},
		{ id: 'l4', name: 'Ecosystems', status: 'not-started', progress: 0, questionsAttempted: 0 },
		{
			id: 'l5',
			name: 'Photosynthesis',
			status: 'not-started',
			progress: 0,
			questionsAttempted: 0,
		},
		{
			id: 'l6',
			name: 'Human Nutrition',
			status: 'not-started',
			progress: 0,
			questionsAttempted: 0,
		},
		{ id: 'l7', name: 'Respiration', status: 'not-started', progress: 0, questionsAttempted: 0 },
		{ id: 'l8', name: 'Homeostasis', status: 'not-started', progress: 0, questionsAttempted: 0 },
	],
};
