import { SUBJECTS, type SubjectId } from '@/content';
import type { RecentSessionWithContext } from '@/lib/db/actions';

export interface SuggestionCard {
	id: string;
	emoji: string;
	title: string;
	description: string;
}

export interface StudyHelpCard {
	id: string;
	emoji: string;
	title: string;
	subtitle: string;
	subjectId: SubjectId;
}

export const SUGGESTION_CARDS: SuggestionCard[] = [
	{
		id: '1',
		emoji: '🎯',
		title: 'Help me prioritize',
		description: 'Figure out what to study first',
	},
	{ id: '2', emoji: '🧘', title: 'Start a routine', description: 'Create a study schedule' },
	{ id: '3', emoji: '📚', title: 'Explain a topic', description: 'Break down any concept' },
	{ id: '4', emoji: '✍️', title: 'Practice questions', description: 'Get exercises to try' },
];

export const HELP_CARDS: StudyHelpCard[] = [
	{
		id: '1',
		emoji: SUBJECTS.mathematics.emoji,
		title: 'Mathematics',
		subtitle: 'Algebra, Calculus, Geometry',
		subjectId: 'mathematics',
	},
	{
		id: '2',
		emoji: SUBJECTS.physics.emoji,
		title: 'Physics',
		subtitle: 'Mechanics, Waves, Energy',
		subjectId: 'physics',
	},
	{
		id: '3',
		emoji: SUBJECTS['life-sciences'].emoji,
		title: 'Life Sciences',
		subtitle: 'Cells, Genetics, Ecology',
		subjectId: 'life-sciences',
	},
	{
		id: '4',
		emoji: SUBJECTS.english.emoji,
		title: 'English',
		subtitle: 'Literature, Language, Writing',
		subjectId: 'english',
	},
];

export const MOCK_RECENT_SESSIONS = [
	{
		emoji: SUBJECTS.mathematics.emoji,
		title: 'Calculus - Derivatives & Integration',
		time: '2 hours ago',
		subjectId: 'mathematics',
		topic: 'Calculus',
		duration: 45,
	},
	{
		emoji: SUBJECTS.physics.emoji,
		title: 'Electric Circuits',
		time: 'Yesterday',
		subjectId: 'physics',
		topic: 'Circuits',
		duration: 30,
	},
	{
		emoji: SUBJECTS['life-sciences'].emoji,
		title: 'Cell Structure & Function',
		time: '2 days ago',
		subjectId: 'life-sciences',
		topic: 'Cells',
		duration: 60,
	},
	{
		emoji: SUBJECTS.english.emoji,
		title: 'Essay Writing: Argumentative',
		time: '3 days ago',
		subjectId: 'english',
		topic: 'Essay Writing',
		duration: 40,
	},
];

export function formatRelativeTime(date: Date | null | undefined): string {
	if (!date) return 'Unknown';

	const now = new Date();
	const diffMs = now.getTime() - new Date(date).getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffMins < 1) return 'Just now';
	if (diffMins < 60) return `${diffMins} min ago`;
	if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
	if (diffDays === 1) return 'Yesterday';
	if (diffDays < 7) return `${diffDays} days ago`;
	return new Date(date).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
}

export function getSessionTitle(session: RecentSessionWithContext): string {
	if (session.topic) return session.topic;
	if (session.subjectName) return session.subjectName;
	if (session.sessionType)
		return session.sessionType.charAt(0).toUpperCase() + session.sessionType.slice(1);
	return 'Study Session';
}

export function getSessionSubtitle(session: RecentSessionWithContext): string {
	const parts: string[] = [];
	if (session.subjectName) parts.push(session.subjectName);
	if (session.durationMinutes) parts.push(`${session.durationMinutes} min`);
	if (session.questionsAttempted > 0) {
		const accuracy = Math.round((session.correctAnswers / session.questionsAttempted) * 100);
		parts.push(`${accuracy}%`);
	}
	return parts.join(' • ');
}
