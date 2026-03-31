import type { Subject } from './types';

export const physicalSciences: Subject = {
	id: 'physical-sciences',
	name: 'Physical Sciences',
	color: 'bg-subject-physics',
	icon: '⚛️',
	topics: [
		{
			id: 'p1',
			name: 'Momentum & Impulse',
			status: 'mastered',
			progress: 100,
			lastPracticed: '1 week ago',
			questionsAttempted: 52,
		},
		{
			id: 'p2',
			name: 'Projectile Motion',
			status: 'in-progress',
			progress: 75,
			lastPracticed: '3 days ago',
			questionsAttempted: 34,
		},
		{
			id: 'p3',
			name: 'Work, Energy & Power',
			status: 'in-progress',
			progress: 50,
			lastPracticed: 'Yesterday',
			questionsAttempted: 22,
		},
		{
			id: 'p4',
			name: 'Doppler Effect',
			status: 'not-started',
			progress: 0,
			questionsAttempted: 0,
		},
		{
			id: 'p5',
			name: 'Chemical Equilibrium',
			status: 'not-started',
			progress: 0,
			questionsAttempted: 0,
		},
		{
			id: 'p6',
			name: 'Chemical Reactions',
			status: 'not-started',
			progress: 0,
			questionsAttempted: 0,
		},
		{
			id: 'p7',
			name: 'Electrostatics',
			status: 'not-started',
			progress: 0,
			questionsAttempted: 0,
		},
		{
			id: 'p8',
			name: 'Electric Circuits',
			status: 'not-started',
			progress: 0,
			questionsAttempted: 0,
		},
	],
};

export const PHYSICAL_SCIENCES_TOPIC_WEIGHTS: Record<string, number> = {
	'Momentum & Impulse': 15,
	'Projectile Motion': 15,
	'Work, Energy & Power': 20,
	'Doppler Effect': 10,
	'Chemical Equilibrium': 15,
	'Chemical Reactions': 15,
	Electrostatics: 15,
	'Electric Circuits': 15,
};
