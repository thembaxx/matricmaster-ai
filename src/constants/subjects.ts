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
	fontFamily: string;
}

export const SUBJECTS: Record<SubjectId, Subject> = {
	mathematics: {
		id: 'mathematics',
		name: 'Mathematics',
		emoji: '🧮',
		color: 'text-mathematics',
		bgColor: 'bg-mathematics',
		icon: 'Calculator',
		fontFamily: 'var(--font-noto-sans-math)',
	},
	physics: {
		id: 'physics',
		name: 'Physics',
		emoji: '⚛️',
		color: 'text-physics',
		bgColor: 'bg-physics',
		icon: 'Atom',
		fontFamily: 'var(--font-noto-sans-math)',
	},
	chemistry: {
		id: 'chemistry',
		name: 'Chemistry',
		emoji: '🧪',
		color: 'text-chemistry',
		bgColor: 'bg-chemistry',
		icon: 'FlaskConical',
		fontFamily: 'var(--font-noto-sans-math)',
	},
	'life-sciences': {
		id: 'life-sciences',
		name: 'Life Sciences',
		emoji: '🧬',
		color: 'text-life-sciences',
		bgColor: 'bg-life-sciences',
		icon: 'Microscope',
		fontFamily: 'var(--font-source-serif4)',
	},
	english: {
		id: 'english',
		name: 'English',
		emoji: '📚',
		color: 'text-english',
		bgColor: 'bg-english',
		icon: 'BookOpen',
		fontFamily: 'var(--font-literata)',
	},
	geography: {
		id: 'geography',
		name: 'Geography',
		emoji: '🌍',
		color: 'text-geography',
		bgColor: 'bg-geography',
		icon: 'Globe',
		fontFamily: 'var(--font-dm-sans)',
	},
	history: {
		id: 'history',
		name: 'History',
		emoji: '📜',
		color: 'text-history',
		bgColor: 'bg-history',
		icon: 'Scroll',
		fontFamily: 'var(--font-crimson-pro)',
	},
	accounting: {
		id: 'accounting',
		name: 'Accounting',
		emoji: '💰',
		color: 'text-accounting',
		bgColor: 'bg-accounting',
		icon: 'Calculator',
		fontFamily: 'var(--font-jetbrains-mono)',
	},
	economics: {
		id: 'economics',
		name: 'Economics',
		emoji: '📈',
		color: 'text-economics',
		bgColor: 'bg-economics',
		icon: 'ChartLine',
		fontFamily: 'var(--font-dm-sans)',
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

export function getSubjectFont(subjectId: string): string {
	return SUBJECTS[subjectId as SubjectId]?.fontFamily ?? 'var(--font-body)';
}
