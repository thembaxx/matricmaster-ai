import type { CurriculumType } from '@/lib/i18n/languages';

export interface CurriculumFilterOptions {
	curriculum: CurriculumType;
	includeBoth?: boolean;
}

export interface Curriculummable {
	curriculumCode?: string | null;
	curriculum?: string | null;
	supportedCurriculums?: string[];
}

export function matchesCurriculum(
	item: Curriculummable,
	options: CurriculumFilterOptions
): boolean {
	if (options.includeBoth) {
		const itemCurriculum = item.curriculumCode || item.curriculum || 'NSC';
		return (
			itemCurriculum === 'NSC' || itemCurriculum === 'IEB' || itemCurriculum === options.curriculum
		);
	}
	const itemCurriculum = item.curriculumCode || item.curriculum;
	if (!itemCurriculum) return true;
	return itemCurriculum === options.curriculum || itemCurriculum === 'BOTH';
}

export function filterByCurriculum<T extends Curriculummable>(
	items: T[],
	options: CurriculumFilterOptions
): T[] {
	return items.filter((item) => matchesCurriculum(item, options));
}

export function getCurriculumLabel(curriculum: CurriculumType): string {
	const labels: Record<CurriculumType, string> = {
		NSC: 'NSC (National Senior Certificate)',
		IEB: 'IEB (Independent Examinations Board)',
	};
	return labels[curriculum];
}

export function isIEBContent(item: Curriculummable): boolean {
	const curriculum = item.curriculumCode || item.curriculum;
	return curriculum === 'IEB';
}

export function isNSCContent(item: Curriculummable): boolean {
	const curriculum = item.curriculumCode || item.curriculum;
	return curriculum === 'NSC' || !curriculum;
}

export function getContentDescription(item: Curriculummable): string | null {
	const curriculum = item.curriculumCode || item.curriculum;
	if (curriculum === 'IEB') return 'IEB-specific content';
	if (curriculum === 'NSC') return 'NSC content';
	if (curriculum === 'BOTH') return 'Available for both NSC and IEB';
	return null;
}

export const NSC_ONLY_SUBJECTS = ['lifeSciences', 'geography', 'history'];
export const IEB_ADDITIONAL_TOPICS = ['advancedCalculus', 'appliedMathematics'];

export function getCurriculumSpecificTopics(subject: string, curriculum: CurriculumType): string[] {
	const nscTopics: Record<string, string[]> = {
		mathematics: [
			'algebra',
			'functions',
			'calculus',
			'geometry',
			'trigonometry',
			'statistics',
			'probability',
		],
		physicalSciences: [
			'mechanics',
			'waves',
			'optics',
			'electricity',
			'magnetism',
			'matter',
			'chemicalSystems',
		],
	};

	const iebTopics: Record<string, string[]> = {
		mathematics: [...nscTopics.mathematics, 'advancedCalculus', 'linearProgramming', 'matrices'],
		physicalSciences: [...nscTopics.physicalSciences, 'nuclearPhysics', 'electronics'],
	};

	const topics = curriculum === 'IEB' ? iebTopics : nscTopics;
	return topics[subject] || [];
}
