import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { appConfig } from '@/app.config';
import type { CurriculumType, SALanguage } from '@/lib/i18n/languages';
import { DEFAULT_CURRICULUM, DEFAULT_LANGUAGE } from '@/lib/i18n/languages';

interface LanguageState {
	language: SALanguage;
	curriculum: CurriculumType;
	homeLanguage: SALanguage | null;
	setLanguage: (lang: SALanguage) => void;
	setCurriculum: (curriculum: CurriculumType) => void;
	setHomeLanguage: (lang: SALanguage | null) => void;
}

export const useLanguageStore = create<LanguageState>()(
	persist(
		(set) => ({
			language: DEFAULT_LANGUAGE,
			curriculum: DEFAULT_CURRICULUM,
			homeLanguage: null,
			setLanguage: (lang) => set({ language: lang }),
			setCurriculum: (curriculum) => set({ curriculum }),
			setHomeLanguage: (lang) => set({ homeLanguage: lang }),
		}),
		{
			name: `${appConfig.name}-language-v2`,
		}
	)
);

export function getLanguageFromOldCode(code: string): SALanguage {
	const codeMap: Record<string, SALanguage> = {
		EN: 'en',
		AF: 'af',
		ZU: 'zu',
		XH: 'xh',
		NS: 'en',
		TN: 'tn',
		SS: 'ss',
		TS: 'en',
		VE: 'en',
		NR: 'en',
		ST: 'en',
	};
	return codeMap[code] || 'en';
}
