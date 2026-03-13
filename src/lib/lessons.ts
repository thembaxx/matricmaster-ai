import accounting from '@/constants/lessons/accounting.json';
import businessStudies from '@/constants/lessons/business-studies.json';
import chemistry from '@/constants/lessons/chemistry.json';
import economics from '@/constants/lessons/economics.json';
import geography from '@/constants/lessons/geography.json';
import history from '@/constants/lessons/history.json';
import lifeOrientation from '@/constants/lessons/life-orientation.json';
import lifeSciences from '@/constants/lessons/life-sciences.json';
import mathematics from '@/constants/lessons/mathematics.json';
import physics from '@/constants/lessons/physics.json';

export type SubjectId =
	| 'math'
	| 'physics'
	| 'life'
	| 'accounting'
	| 'geography'
	| 'business'
	| 'history'
	| 'chemistry'
	| 'economics'
	| 'lo';

export interface Lesson {
	id: string;
	subject: string;
	topic: string;
	title: string;
	content: string;
	duration: number;
	difficulty: string;
	completed?: boolean;
}

const LESSON_MAP: Record<string, Lesson[]> = {
	math: Object.values(mathematics).flat() as Lesson[],
	mathematics: Object.values(mathematics).flat() as Lesson[],
	physics: Object.values(physics).flat() as Lesson[],
	physical_sciences: Object.values(physics).flat() as Lesson[],
	life: Object.values(lifeSciences).flat() as Lesson[],
	life_sciences: Object.values(lifeSciences).flat() as Lesson[],
	accounting: Object.values(accounting).flat() as Lesson[],
	geography: Object.values(geography).flat() as Lesson[],
	business: Object.values(businessStudies).flat() as Lesson[],
	business_studies: Object.values(businessStudies).flat() as Lesson[],
	history: Object.values(history).flat() as Lesson[],
	chemistry: Object.values(chemistry).flat() as Lesson[],
	economics: Object.values(economics).flat() as Lesson[],
	lo: Object.values(lifeOrientation).flat() as Lesson[],
	life_orientation: Object.values(lifeOrientation).flat() as Lesson[],
};

export function getLessonsBySubject(subjectId: string): Lesson[] {
	const normalizedId = subjectId.toLowerCase();
	return LESSON_MAP[normalizedId] || [];
}

export function getLessonById(subjectId: string, lessonId: string): Lesson | undefined {
	const lessons = getLessonsBySubject(subjectId);
	return lessons.find((l) => l.id === lessonId);
}
