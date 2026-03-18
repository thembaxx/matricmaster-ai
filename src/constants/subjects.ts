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
	gradient?: {
		primary: string;
		secondary: string;
		accent: string;
	};
}

export const NSC_SUPPORTED_SUBJECTS: SubjectId[] = [
	'mathematics',
	'physics',
	'chemistry',
	'life-sciences',
	'english',
	'geography',
	'history',
	'accounting',
	'economics',
];

export function isNSCSupportedSubject(subjectIdOrName: string): boolean {
	const normalizedInput = subjectIdOrName.toLowerCase().trim();
	const supportedNames = NSC_SUPPORTED_SUBJECTS.map((id) =>
		SUBJECTS[id]?.name.toLowerCase()
	).filter(Boolean);
	return (
		NSC_SUPPORTED_SUBJECTS.includes(normalizedInput as SubjectId) ||
		supportedNames.includes(normalizedInput)
	);
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
		gradient: { primary: '#667eea', secondary: '#764ba2', accent: '#a855f7' },
	},
	physics: {
		id: 'physics',
		name: 'Physics',
		emoji: '⚛️',
		color: 'text-physics',
		bgColor: 'bg-physics',
		icon: 'Atom',
		fontFamily: 'var(--font-noto-sans-math)',
		gradient: { primary: '#11998e', secondary: '#38ef7d', accent: '#34d399' },
	},
	chemistry: {
		id: 'chemistry',
		name: 'Chemistry',
		emoji: '🧪',
		color: 'text-chemistry',
		bgColor: 'bg-chemistry',
		icon: 'FlaskConical',
		fontFamily: 'var(--font-noto-sans-math)',
		gradient: { primary: '#fc4a1a', secondary: '#f7b733', accent: '#fb923c' },
	},
	'life-sciences': {
		id: 'life-sciences',
		name: 'Life Sciences',
		emoji: '🧬',
		color: 'text-life-sciences',
		bgColor: 'bg-life-sciences',
		icon: 'Microscope',
		fontFamily: 'var(--font-source-serif4)',
		gradient: { primary: '#56ab2f', secondary: '#a8e063', accent: '#84cc16' },
	},
	english: {
		id: 'english',
		name: 'English',
		emoji: '📚',
		color: 'text-english',
		bgColor: 'bg-english',
		icon: 'BookOpen',
		fontFamily: 'var(--font-literata)',
		gradient: { primary: '#c9d6ff', secondary: '#e2e2e2', accent: '#94a3b8' },
	},
	geography: {
		id: 'geography',
		name: 'Geography',
		emoji: '🌍',
		color: 'text-geography',
		bgColor: 'bg-geography',
		icon: 'Globe',
		fontFamily: 'var(--font-dm-sans)',
		gradient: { primary: '#8e2de2', secondary: '#4a00e0', accent: '#a855f7' },
	},
	history: {
		id: 'history',
		name: 'History',
		emoji: '📜',
		color: 'text-history',
		bgColor: 'bg-history',
		icon: 'Scroll',
		fontFamily: 'var(--font-crimson-pro)',
		gradient: { primary: '#cb2d3e', secondary: '#ef473a', accent: '#f87171' },
	},
	accounting: {
		id: 'accounting',
		name: 'Accounting',
		emoji: '💰',
		color: 'text-accounting',
		bgColor: 'bg-accounting',
		icon: 'Calculator',
		fontFamily: 'var(--font-jetbrains-mono)',
		gradient: { primary: '#0f4c75', secondary: '#3282b8', accent: '#60a5fa' },
	},
	economics: {
		id: 'economics',
		name: 'Economics',
		emoji: '📈',
		color: 'text-economics',
		bgColor: 'bg-economics',
		icon: 'ChartLine',
		fontFamily: 'var(--font-dm-sans)',
		gradient: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
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

export function getSubjectGradient(subjectId: string): {
	primary: string;
	secondary: string;
	accent: string;
} {
	return (
		SUBJECTS[subjectId as SubjectId]?.gradient ?? {
			primary: '#667eea',
			secondary: '#764ba2',
			accent: '#a855f7',
		}
	);
}

export function getSubjectGradientArray(subjectId: string): string[] {
	const gradient = getSubjectGradient(subjectId);
	return [gradient.primary, gradient.secondary, gradient.accent];
}
