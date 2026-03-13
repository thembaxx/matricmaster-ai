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

const LESSON_MAP: Record<string, any> = {
	math: Object.values(mathematics).flat(),
	mathematics: Object.values(mathematics).flat(),
	physics: Object.values(physics).flat(),
	physical_sciences: Object.values(physics).flat(),
	life: Object.values(lifeSciences).flat(),
	life_sciences: Object.values(lifeSciences).flat(),
	accounting: Object.values(accounting).flat(),
	geography: Object.values(geography).flat(),
	business: Object.values(businessStudies).flat(),
	business_studies: Object.values(businessStudies).flat(),
	history: Object.values(history).flat(),
	chemistry: Object.values(chemistry).flat(),
	economics: Object.values(economics).flat(),
	lo: Object.values(lifeOrientation).flat(),
	life_orientation: Object.values(lifeOrientation).flat(),
};

export function getLessonsBySubject(subjectId: string) {
	const normalizedId = subjectId.toLowerCase();
	return LESSON_MAP[normalizedId] || [];
}

export function getLessonById(subjectId: string, lessonId: string) {
	const lessons = getLessonsBySubject(subjectId);
	return lessons.find((l: any) => l.id === lessonId);
}
