import { SUBJECTS } from '@/content';

export { SUBJECTS };

const ESSAY_SUBJECTS = [
	SUBJECTS.english,
	SUBJECTS.afrikaans,
	SUBJECTS.history,
	SUBJECTS['life-sciences'],
	SUBJECTS['business-studies'],
	SUBJECTS.accounting,
] as const;

export const ESSAY_GRADING_SUBJECTS = ESSAY_SUBJECTS.map((s) => s.name);

export const getGradeColor = (score: number) => {
	if (score >= 80) return 'text-green-500';
	if (score >= 60) return 'text-blue-500';
	if (score >= 40) return 'text-yellow-500';
	return 'text-red-500';
};

export const getGradeBadge = (grade: string) => {
	const colors: Record<string, string> = {
		'A+': 'bg-green-500',
		A: 'bg-green-500',
		'B+': 'bg-blue-500',
		B: 'bg-blue-500',
		'C+': 'bg-yellow-500',
		C: 'bg-yellow-500',
		D: 'bg-orange-500',
		E: 'bg-red-500',
		F: 'bg-red-500',
	};
	return colors[grade] || 'bg-gray-500';
};
