import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'EN' | 'AF' | 'ZU' | 'XH' | 'NS' | 'TN' | 'SS' | 'TS' | 'VE' | 'NR' | 'ST';

interface LanguageState {
	language: Language;
	setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
	persist(
		(set) => ({
			language: 'EN',
			setLanguage: (lang) => set({ language: lang }),
		}),
		{
			name: 'matricmaster-language',
		}
	)
);

export const LANGUAGES: Record<Language, { name: string; native: string }> = {
	EN: { name: 'English', native: 'English' },
	AF: { name: 'Afrikaans', native: 'Afrikaans' },
	ZU: { name: 'isiZulu', native: 'Zulu' },
	XH: { name: 'isiXhosa', native: 'Xhosa' },
	NS: { name: 'Sepedi', native: 'Sepedi' },
	TN: { name: 'Setswana', native: 'Tswana' },
	SS: { name: 'siSwati', native: 'Swati' },
	TS: { name: 'Xitsonga', native: 'Xitsonga' },
	VE: { name: 'Tshivenda', native: 'Venda' },
	NR: { name: 'isiNdebele', native: 'Ndebele' },
	ST: { name: 'Sesotho', native: 'Sesotho' },
};
