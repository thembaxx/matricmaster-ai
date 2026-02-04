export const SUBJECTS = [
	{
		id: 'math',
		name: 'Mathematics',
		topics: 'Calculus, Euclidean Geometry, Trig',
		icon: 'Calculator',
		color: 'text-brand-blue',
		bg: 'bg-brand-blue/10',
		path: '/quiz',
	},
	{
		id: 'physics',
		name: 'Physical Sciences',
		topics: 'Newtonian Laws, Electrodynamics, Organic',
		icon: 'Atom',
		color: 'text-brand-purple',
		bg: 'bg-brand-purple/10',
		path: '/physics',
	},
	{
		id: 'chemistry',
		name: 'Chemistry',
		topics: 'Rate of Reaction, Organic Molecules',
		icon: 'Beaker',
		color: 'text-brand-amber',
		bg: 'bg-brand-amber/10',
		path: '/quiz',
	},
	{
		id: 'life',
		name: 'Life Sciences',
		topics: 'Genetics, Evolution, DNA',
		icon: 'Microscope',
		color: 'text-brand-green',
		bg: 'bg-brand-green/10',
		path: '/quiz',
	},
];

export const CURRENT_GOAL = {
	title: 'Calculus: Optimization',
	subtitle: 'Next: Stationary Points & Maxima',
	progress: 60,
	step: 'Quiz 3/5',
	icon: '🚀',
};

export const WEEKLY_JOURNEY = [
	{ day: 'TUE', date: 10, status: 'complete' },
	{ day: 'WED', date: 11, status: 'complete' },
	{ day: 'THU', date: 12, status: 'active' },
	{ day: 'FRI', date: 13, status: 'upcoming' },
	{ day: 'SAT', date: 14, status: 'upcoming' },
	{ day: 'SUN', date: 15, status: 'upcoming' },
];

export const RECOMMENDED_CHALLENGES = [
	{
		title: 'Rate of Reaction',
		topic: 'Chemistry',
		time: '12m',
		difficulty: 'Medium',
		color: 'bg-brand-amber/10 text-brand-amber',
		icon: '🧪',
	},
	{
		title: 'Organic Molecules',
		topic: 'Chemistry',
		time: '15m',
		difficulty: 'Easy',
		color: 'bg-brand-amber/10 text-brand-amber',
		icon: '⬢',
	},
	{
		title: 'Doppler Effect',
		topic: 'Physics',
		time: '20m',
		difficulty: 'Hard',
		color: 'bg-brand-purple/10 text-brand-purple',
		icon: '🔊',
	},
];
