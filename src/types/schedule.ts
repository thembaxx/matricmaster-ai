export type SubjectId =
	| 'mathematics'
	| 'physics'
	| 'life-sciences'
	| 'english'
	| 'geography'
	| 'history'
	| 'accounting'
	| 'economics'
	| 'chemistry';

export interface Subject {
	id: SubjectId;
	name: string;
	emoji: string;
	color: string;
	bgColor: string;
}

export const SUBJECTS: Record<SubjectId, Subject> = {
	mathematics: {
		id: 'mathematics',
		name: 'Mathematics',
		emoji: '🧮',
		color: 'text-mathematics',
		bgColor: 'bg-mathematics',
	},
	physics: {
		id: 'physics',
		name: 'Physics',
		emoji: '⚛️',
		color: 'text-physics',
		bgColor: 'bg-physics',
	},
	'life-sciences': {
		id: 'life-sciences',
		name: 'Life Sciences',
		emoji: '🧬',
		color: 'text-life-sciences',
		bgColor: 'bg-life-sciences',
	},
	english: {
		id: 'english',
		name: 'English',
		emoji: '📚',
		color: 'text-english',
		bgColor: 'bg-english',
	},
	geography: {
		id: 'geography',
		name: 'Geography',
		emoji: '🌍',
		color: 'text-geography',
		bgColor: 'bg-geography',
	},
	history: {
		id: 'history',
		name: 'History',
		emoji: '📜',
		color: 'text-history',
		bgColor: 'bg-history',
	},
	accounting: {
		id: 'accounting',
		name: 'Accounting',
		emoji: '📊',
		color: 'text-accounting',
		bgColor: 'bg-accounting',
	},
	economics: {
		id: 'economics',
		name: 'Economics',
		emoji: '💰',
		color: 'text-economics',
		bgColor: 'bg-economics',
	},
	chemistry: {
		id: 'chemistry',
		name: 'Chemistry',
		emoji: '🧪',
		color: 'text-chemistry',
		bgColor: 'bg-chemistry',
	},
};

export interface TaskStep {
	id: string;
	title: string;
	completed: boolean;
}

export interface StudyTask {
	id: string;
	title: string;
	subject: SubjectId;
	duration: number;
	startTime?: string;
	endTime?: string;
	completed: boolean;
	steps: TaskStep[];
	notes?: string;
}

export type BlockType = 'study' | 'break' | 'review' | 'practice';

export interface RoutineBlock {
	id: string;
	title: string;
	duration: number;
	subject?: SubjectId;
	type: BlockType;
}

export type RoutineType = 'morning' | 'afternoon' | 'evening' | 'exam-prep' | 'custom';

export interface Routine {
	id: string;
	name: string;
	type: RoutineType;
	blocks: RoutineBlock[];
}

export const ROUTINE_TEMPLATES: Routine[] = [
	{
		id: 'morning-boost',
		name: 'Morning Boost',
		type: 'morning',
		blocks: [
			{ id: '1', title: 'Quick Review', duration: 15, type: 'review' },
			{ id: '2', title: 'Main Subject Study', duration: 90, type: 'study' },
			{ id: '3', title: 'Break', duration: 15, type: 'break' },
			{ id: '4', title: 'Next Subject', duration: 45, type: 'practice' },
		],
	},
	{
		id: 'afternoon-focus',
		name: 'Afternoon Focus',
		type: 'afternoon',
		blocks: [
			{ id: '1', title: 'Lunch Break', duration: 30, type: 'break' },
			{ id: '2', title: 'Past Paper Practice', duration: 90, type: 'practice' },
			{ id: '3', title: 'Short Break', duration: 10, type: 'break' },
			{ id: '4', title: 'Review Answers', duration: 45, type: 'review' },
		],
	},
	{
		id: 'evening-revision',
		name: 'Evening Revision',
		type: 'evening',
		blocks: [
			{ id: '1', title: 'Light Review', duration: 30, type: 'review' },
			{ id: '2', title: 'Weak Topics Focus', duration: 60, type: 'study' },
			{ id: '3', title: 'Break', duration: 10, type: 'break' },
			{ id: '4', title: 'Preview Tomorrow', duration: 30, type: 'review' },
		],
	},
	{
		id: 'exam-prep',
		name: 'Exam Prep',
		type: 'exam-prep',
		blocks: [
			{ id: '1', title: 'Intensive Study', duration: 60, type: 'study' },
			{ id: '2', title: 'Break', duration: 10, type: 'break' },
			{ id: '3', title: 'Practice Questions', duration: 60, type: 'practice' },
			{ id: '4', title: 'Break', duration: 10, type: 'break' },
			{ id: '5', title: 'Mock Exam', duration: 60, type: 'practice' },
		],
	},
];

export type ScheduleView = 'active' | 'timeline';

export interface DailyPlan {
	id: string;
	date: string;
	tasks: StudyTask[];
	routines: Routine[];
}
