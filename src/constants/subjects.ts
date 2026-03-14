export type SubjectId =
	| 'mathematics'
	| 'physics'
	| 'chemistry'
	| 'life-sciences'
	| 'english'
	| 'geography'
	| 'history'
	| 'accounting'
	| 'economics';

export interface Subject {
	id: SubjectId;
	name: string;
	emoji: string;
	color: string;
	bgColor: string;
	icon: string;
}

export const SUBJECTS: Record<SubjectId, Subject> = {
	mathematics: {
		id: 'mathematics',
		name: 'Mathematics',
		emoji: '🧮',
		color: 'text-mathematics',
		bgColor: 'bg-mathematics',
		icon: 'Calculator',
	},
	physics: {
		id: 'physics',
		name: 'Physics',
		emoji: '⚛️',
		color: 'text-physics',
		bgColor: 'bg-physics',
		icon: 'Atom',
	},
	chemistry: {
		id: 'chemistry',
		name: 'Chemistry',
		emoji: '🧪',
		color: 'text-chemistry',
		bgColor: 'bg-chemistry',
		icon: 'FlaskConical',
	},
	'life-sciences': {
		id: 'life-sciences',
		name: 'Life Sciences',
		emoji: '🧬',
		color: 'text-life-sciences',
		bgColor: 'bg-life-sciences',
		icon: 'Microscope',
	},
	english: {
		id: 'english',
		name: 'English',
		emoji: '📚',
		color: 'text-english',
		bgColor: 'bg-english',
		icon: 'BookOpen',
	},
	geography: {
		id: 'geography',
		name: 'Geography',
		emoji: '🌍',
		color: 'text-geography',
		bgColor: 'bg-geography',
		icon: 'Globe',
	},
	history: {
		id: 'history',
		name: 'History',
		emoji: '📜',
		color: 'text-history',
		bgColor: 'bg-history',
		icon: 'Scroll',
	},
	accounting: {
		id: 'accounting',
		name: 'Accounting',
		emoji: '💰',
		color: 'text-accounting',
		bgColor: 'bg-accounting',
		icon: 'Calculator',
	},
	economics: {
		id: 'economics',
		name: 'Economics',
		emoji: '📈',
		color: 'text-economics',
		bgColor: 'bg-economics',
		icon: 'ChartLine',
	},
};

export const SUBJECT_LIST = Object.values(SUBJECTS);

export function getSubjectEmoji(subjectId: string): string {
	return SUBJECTS[subjectId as SubjectId]?.emoji ?? '📖';
}

export function getSubjectName(subjectId: string): string {
	return SUBJECTS[subjectId as SubjectId]?.name ?? subjectId;
}

export function getSubjectColor(subjectId: string): string {
	return SUBJECTS[subjectId as SubjectId]?.color ?? 'text-foreground';
}

export function getSubjectBgColor(subjectId: string): string {
	return SUBJECTS[subjectId as SubjectId]?.bgColor ?? 'bg-muted';
}

export function getSubjectIcon(subjectId: string): string {
	return SUBJECTS[subjectId as SubjectId]?.icon ?? 'BookOpen';
}
