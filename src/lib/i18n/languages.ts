export const SA_LANGUAGES = {
	en: {
		name: 'English',
		nativeName: 'English',
		flag: '🇬🇧',
		direction: 'ltr' as const,
	},
	zu: {
		name: 'isiZulu',
		nativeName: 'isiZulu',
		flag: '🇿🇦',
		direction: 'ltr' as const,
	},
	xh: {
		name: 'isiXhosa',
		nativeName: 'isiXhosa',
		flag: '🇿🇦',
		direction: 'ltr' as const,
	},
	af: {
		name: 'Afrikaans',
		nativeName: 'Afrikaans',
		flag: '🇿🇦',
		direction: 'ltr' as const,
	},
	tn: {
		name: 'Setswana',
		nativeName: 'Setswana',
		flag: '🇿🇦',
		direction: 'ltr' as const,
	},
	ss: {
		name: 'siSwati',
		nativeName: 'siSwati',
		flag: '🇿🇦',
		direction: 'ltr' as const,
	},
} as const;

export const CURRICULUM_TYPES = {
	NSC: {
		name: 'NSC',
		description: 'National Senior Certificate',
		fullName: 'National Senior Certificate (NSC)',
		examsBody: 'Department of Basic Education',
	},
	IEB: {
		name: 'IEB',
		description: 'Independent Examinations Board',
		fullName: 'Independent Examinations Board (IEB)',
		examsBody: 'Independent Examinations Board',
	},
} as const;

export type SALanguage = keyof typeof SA_LANGUAGES;
export type CurriculumType = keyof typeof CURRICULUM_TYPES;

export const DEFAULT_LANGUAGE: SALanguage = 'en';
export const DEFAULT_CURRICULUM: CurriculumType = 'NSC';

export const SUPPORTED_LANGUAGES: SALanguage[] = ['en', 'zu', 'xh', 'af', 'tn', 'ss'];
export const SUPPORTED_CURRICULUMS: CurriculumType[] = ['NSC', 'IEB'];

export const LANGUAGE_DISPLAY_ORDER: SALanguage[] = ['en', 'zu', 'xh', 'af', 'tn', 'ss'];
export const CURRICULUM_DISPLAY_ORDER: CurriculumType[] = ['NSC', 'IEB'];

export function getLanguageDisplayName(lang: SALanguage): string {
	return SA_LANGUAGES[lang].nativeName;
}

export function getLanguageByCode(code: string): SALanguage | undefined {
	const normalizedCode = code.toLowerCase();
	const lang = SUPPORTED_LANGUAGES.find((l) => l === normalizedCode);
	if (lang) return lang;
	const codeMap: Record<string, SALanguage> = {
		en: 'en',
		zu: 'zu',
		xh: 'xh',
		af: 'af',
		tn: 'tn',
		ss: 'ss',
		'zu-zu': 'zu',
		'xh-xh': 'xh',
	};
	return codeMap[normalizedCode];
}

export function getCurriculumDisplayName(curriculum: CurriculumType): string {
	return CURRICULUM_TYPES[curriculum].fullName;
}
