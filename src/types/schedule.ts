import { SUBJECTS as CENTRAL_SUBJECTS } from '@/content';

export type SubjectId =
	| 'mathematics'
	| 'physics'
	| 'life-sciences'
	| 'english'
	| 'geography'
	| 'history'
	| 'accounting'
	| 'economics'
	| 'chemistry'
	| 'afrikaans'
	| 'lo'
	| 'business-studies';

export interface Subject {
	id: SubjectId;
	name: string;
	emoji: string;
	color: string;
	bgColor: string;
}

export const SUBJECTS: Record<SubjectId, Subject> = (() => {
	const entries = Object.values(CENTRAL_SUBJECTS).map((s) => [
		s.id,
		{
			id: s.id,
			name: s.name,
			emoji: s.emoji,
			color: s.color,
			bgColor: s.bgColor,
		},
	]);
	return Object.fromEntries(entries);
})();

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
