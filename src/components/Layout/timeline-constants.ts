import { SUBJECTS } from '@/lib/content-adapter';

export interface TimelineEvent {
	id: string;
	time: string;
	subject: string;
	title: string;
	duration: string;
	status: 'completed' | 'current' | 'upcoming';
	emoji: string;
	navigationHref?: string;
}

export const DEMO_EVENTS: TimelineEvent[] = [
	{
		id: '1',
		time: '08:00',
		subject: 'mathematics',
		title: 'Calculus review',
		duration: '45 min',
		status: 'completed',
		emoji: SUBJECTS.mathematics.emoji,
		navigationHref: '/focus?subject=mathematics',
	},
	{
		id: '2',
		time: '09:00',
		subject: 'physics',
		title: 'Circuit problems',
		duration: '30 min',
		status: 'current',
		emoji: SUBJECTS.physics.emoji,
		navigationHref: '/quiz?subject=physics',
	},
	{
		id: '3',
		time: '10:00',
		subject: 'english',
		title: 'Essay planning',
		duration: '60 min',
		status: 'upcoming',
		emoji: SUBJECTS.english.emoji,
		navigationHref: '/ai-tutor?subject=english',
	},
	{
		id: '4',
		time: '11:30',
		subject: 'life-sciences',
		title: 'Cell structures',
		duration: '45 min',
		status: 'upcoming',
		emoji: SUBJECTS['life-sciences'].emoji,
		navigationHref: '/flashcards?subject=life-sciences',
	},
	{
		id: '5',
		time: '13:00',
		subject: 'Break',
		title: 'Lunch',
		duration: '30 min',
		status: 'upcoming',
		emoji: '🥪',
		navigationHref: undefined,
	},
];
