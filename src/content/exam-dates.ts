export interface ExamDateEntry {
	subject: string;
	date: string;
	paper: string;
	subjectKey: string;
}

export const NSC_EXAM_DATES: ExamDateEntry[] = [
	{ subject: 'mathematics', date: '2026-10-19', paper: 'paper 1', subjectKey: 'mathematics' },
	{
		subject: 'mathematics',
		date: '2026-10-22',
		paper: 'paper 2',
		subjectKey: 'mathematics',
	},
	{
		subject: 'physical sciences',
		date: '2026-10-21',
		paper: 'paper 1',
		subjectKey: 'physical-sciences',
	},
	{
		subject: 'physical sciences',
		date: '2026-10-24',
		paper: 'paper 2',
		subjectKey: 'physical-sciences',
	},
	{
		subject: 'life sciences',
		date: '2026-10-23',
		paper: 'paper 1',
		subjectKey: 'life-sciences',
	},
	{
		subject: 'life sciences',
		date: '2026-10-27',
		paper: 'paper 2',
		subjectKey: 'life-sciences',
	},
	{ subject: 'accounting', date: '2026-10-26', paper: 'paper 1', subjectKey: 'accounting' },
	{ subject: 'accounting', date: '2026-10-29', paper: 'paper 2', subjectKey: 'accounting' },
	{ subject: 'geography', date: '2026-10-28', paper: 'paper 1', subjectKey: 'geography' },
	{ subject: 'geography', date: '2026-10-31', paper: 'paper 2', subjectKey: 'geography' },
	{ subject: 'history', date: '2026-10-30', paper: 'paper 1', subjectKey: 'history' },
	{ subject: 'history', date: '2026-11-03', paper: 'paper 2', subjectKey: 'history' },
	{ subject: 'english', date: '2026-11-02', paper: 'paper 1', subjectKey: 'english' },
	{ subject: 'english', date: '2026-11-05', paper: 'paper 2', subjectKey: 'english' },
	{ subject: 'afrikaans', date: '2026-11-04', paper: 'paper 1', subjectKey: 'afrikaans' },
	{ subject: 'afrikaans', date: '2026-11-06', paper: 'paper 2', subjectKey: 'afrikaans' },
];

export const SUBJECT_COLORS: Record<string, string> = {
	mathematics: '#F2C945',
	'physical sciences': '#48A7DE',
	'life sciences': '#5CB587',
	accounting: '#F472B6',
	geography: '#2DD4BF',
	history: '#FB923C',
	english: '#818CF8',
	afrikaans: '#F97316',
};
