import type { Subject } from './types';

export const afrikaans: Subject = {
	id: 'afrikaans',
	name: 'Afrikaans',
	color: 'bg-orange-500',
	icon: '🇿🇦',
	topics: [
		{
			id: 'af1',
			name: 'Opsomming Skryf',
			status: 'mastered',
			progress: 100,
			lastPracticed: '1 week ago',
			questionsAttempted: 32,
		},
		{
			id: 'af2',
			name: 'Leesbegrip',
			status: 'mastered',
			progress: 100,
			lastPracticed: '5 days ago',
			questionsAttempted: 28,
		},
		{
			id: 'af3',
			name: 'Opstel Skryf',
			status: 'in-progress',
			progress: 60,
			lastPracticed: '2 days ago',
			questionsAttempted: 18,
		},
		{
			id: 'af4',
			name: 'Poësie Analise',
			status: 'in-progress',
			progress: 45,
			lastPracticed: 'Yesterday',
			questionsAttempted: 14,
		},
		{ id: 'af5', name: 'Literatuur', status: 'not-started', progress: 0, questionsAttempted: 0 },
		{
			id: 'af6',
			name: 'Taalstrukture',
			status: 'not-started',
			progress: 0,
			questionsAttempted: 0,
		},
		{
			id: 'af7',
			name: 'Advertensies',
			status: 'not-started',
			progress: 0,
			questionsAttempted: 0,
		},
		{
			id: 'af8',
			name: 'Visuele Geletterdheid',
			status: 'not-started',
			progress: 0,
			questionsAttempted: 0,
		},
	],
};
