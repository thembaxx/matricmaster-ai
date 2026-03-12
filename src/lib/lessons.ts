import accounting from '@/constants/lessons/accounting.json';
import businessStudies from '@/constants/lessons/business-studies.json';
import chemistry from '@/constants/lessons/chemistry.json';
import geography from '@/constants/lessons/geography.json';
import history from '@/constants/lessons/history.json';
import lifeSciences from '@/constants/lessons/life-sciences.json';
import mathematics from '@/constants/lessons/mathematics.json';
import physics from '@/constants/lessons/physics.json';

import economics from '@/constants/lessons/economics.json';
import lifeOrientation from '@/constants/lessons/life-orientation.json';

export type SubjectId = 'math' | 'physics' | 'life' | 'accounting' | 'geography' | 'business' | 'history' | 'chemistry' | 'economics' | 'lo';

const LESSON_MAP: Record<string, any> = {
	math: mathematics.mathematics,
	mathematics: mathematics.mathematics,
	physics: physics.physical_sciences,
	physical_sciences: physics.physical_sciences,
	life: lifeSciences.life_sciences,
	life_sciences: lifeSciences.life_sciences,
	accounting: accounting.accounting,
	geography: geography.geography,
	business: businessStudies.business_studies,
	business_studies: businessStudies.business_studies,
	history: history.history,
	chemistry: chemistry.chemistry,
	economics: economics.economics,
	lo: lifeOrientation.life_orientation,
	life_orientation: lifeOrientation.life_orientation,
};

export function getLessonsBySubject(subjectId: string) {
	const normalizedId = subjectId.toLowerCase();
	return LESSON_MAP[normalizedId] || [];
}

export function getLessonById(subjectId: string, lessonId: string) {
	const lessons = getLessonsBySubject(subjectId);
	return lessons.find((l: any) => l.id === lessonId);
}
