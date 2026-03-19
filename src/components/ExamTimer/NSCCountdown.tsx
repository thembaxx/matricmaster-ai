export interface NSCExamDate {
	subject: string;
	paper: number;
	date: Date;
	year: number;
}

function getNSCExamDates(): NSCExamDate[] {
	const currentYear = new Date().getFullYear();
	const examStartMonth = 10;
	const examStartDay = 20;

	return [
		{
			subject: 'English Home Language',
			paper: 1,
			date: new Date(currentYear, examStartMonth, examStartDay),
			year: currentYear,
		},
		{
			subject: 'English Home Language',
			paper: 2,
			date: new Date(currentYear, examStartMonth, examStartDay + 1),
			year: currentYear,
		},
		{
			subject: 'English Home Language',
			paper: 3,
			date: new Date(currentYear, examStartMonth, examStartDay + 2),
			year: currentYear,
		},
		{
			subject: 'Mathematics',
			paper: 1,
			date: new Date(currentYear, examStartMonth, examStartDay + 5),
			year: currentYear,
		},
		{
			subject: 'Mathematics',
			paper: 2,
			date: new Date(currentYear, examStartMonth, examStartDay + 6),
			year: currentYear,
		},
		{
			subject: 'Mathematics',
			paper: 3,
			date: new Date(currentYear, examStartMonth, examStartDay + 7),
			year: currentYear,
		},
		{
			subject: 'Physical Sciences',
			paper: 1,
			date: new Date(currentYear, examStartMonth, examStartDay + 8),
			year: currentYear,
		},
		{
			subject: 'Physical Sciences',
			paper: 2,
			date: new Date(currentYear, examStartMonth, examStartDay + 9),
			year: currentYear,
		},
		{
			subject: 'Life Sciences',
			paper: 1,
			date: new Date(currentYear, examStartMonth, examStartDay + 12),
			year: currentYear,
		},
		{
			subject: 'Life Sciences',
			paper: 2,
			date: new Date(currentYear, examStartMonth, examStartDay + 13),
			year: currentYear,
		},
		{
			subject: 'Accounting',
			paper: 1,
			date: new Date(currentYear, examStartMonth, examStartDay + 15),
			year: currentYear,
		},
		{
			subject: 'Accounting',
			paper: 2,
			date: new Date(currentYear, examStartMonth, examStartDay + 16),
			year: currentYear,
		},
		{
			subject: 'Geography',
			paper: 1,
			date: new Date(currentYear, examStartMonth, examStartDay + 19),
			year: currentYear,
		},
		{
			subject: 'Geography',
			paper: 2,
			date: new Date(currentYear, examStartMonth, examStartDay + 20),
			year: currentYear,
		},
		{
			subject: 'History',
			paper: 1,
			date: new Date(currentYear, examStartMonth, examStartDay + 22),
			year: currentYear,
		},
		{
			subject: 'History',
			paper: 2,
			date: new Date(currentYear, examStartMonth, examStartDay + 23),
			year: currentYear,
		},
		{
			subject: 'Economics',
			paper: 1,
			date: new Date(currentYear, examStartMonth, examStartDay + 26),
			year: currentYear,
		},
		{
			subject: 'Economics',
			paper: 2,
			date: new Date(currentYear, examStartMonth, examStartDay + 27),
			year: currentYear,
		},
	];
}

export function getNextExam(): NSCExamDate | null {
	const now = new Date();
	const exams = getNSCExamDates().sort((a, b) => a.date.getTime() - b.date.getTime());

	for (const exam of exams) {
		if (exam.date > now) {
			return exam;
		}
	}

	return null;
}

export function getDaysUntilExam(examDate: Date): number {
	const now = new Date();
	const diff = examDate.getTime() - now.getTime();
	return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getWeeksUntilExam(examDate: Date): number {
	const days = getDaysUntilExam(examDate);
	return Math.ceil(days / 7);
}

export { getNSCExamDates };
