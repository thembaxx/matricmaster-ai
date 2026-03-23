import { appConfig } from '@/app.config';
import type { Language } from '../../stores/useLanguageStore';

type SALang = 'en' | 'zu' | 'xh' | 'af' | 'tn' | 'ss';

type PartialTranslationSet = Partial<Record<SALang, TranslationSet>>;

interface TranslationSet {
	[key: string]: string | TranslationSet;
}

export const TRANSLATIONS: Record<string, PartialTranslationSet> = {
	common: {
		en: {
			welcome: `Welcome to ${appConfig.name}`,
			loading: 'Loading...',
			save: 'Save',
			cancel: 'Cancel',
			delete: 'Delete',
			edit: 'Edit',
			submit: 'Submit',
			next: 'Next',
			previous: 'Previous',
			back: 'Back',
			continue: 'Continue',
			start: 'Start',
			stop: 'Stop',
			pause: 'Pause',
			resume: 'Resume',
			success: 'Success',
			error: 'Error',
			warning: 'Warning',
		},
		af: {
			welcome: `Welkom by ${appConfig.name}`,
			loading: 'Laai tans...',
			save: 'Stoor',
			cancel: 'Kanselleer',
			delete: 'Verwyder',
			edit: 'Wysig',
			submit: 'Dien in',
			next: 'Volgende',
			previous: 'Vorige',
			back: 'Terug',
			continue: 'Gaan voort',
			start: 'Begin',
			stop: 'Stop',
			pause: 'Pouse',
			resume: 'Hervat',
			success: 'Sukses',
			error: 'Fout',
			warning: 'Waarskuwing',
		},
		zu: {
			welcome: `Siyakwamukela ku-${appConfig.name}`,
			loading: 'Iyalayisha...',
			save: 'Gcina',
			cancel: 'Khansela',
			delete: 'Susa',
			edit: 'Hlela',
			submit: 'Thumela',
			next: 'Okulandelayo',
			previous: 'Okwangaphambili',
			back: 'Emuva',
			Continue: 'Qhubeka',
			start: 'Qala',
			stop: 'Misa',
			pause: 'Misa',
			resume: 'Qhubeka',
			success: 'Impumelelo',
			error: 'Iphutha',
			warning: 'Isixwayiso',
		},
		xh: {
			welcome: `Wamkela ku-${appConfig.name}`,
			loading: 'Iyalayisha...',
			save: 'Gcina',
			cancel: 'Rhoxisa',
			delete: 'Cima',
			edit: 'Hlela',
			submit: 'Thumela',
			next: 'Okulandelayo',
			previous: 'Okwangaphambili',
			back: 'Emuva',
			continue: 'Qhubeka',
			start: 'Qala',
			stop: 'Yima',
			pause: 'Yima',
			resume: 'Qhubeka',
			success: 'Impumelelo',
			error: 'Impazamo',
			warning: 'Isixwayiso',
		},
	},
	navigation: {
		en: {
			dashboard: 'Dashboard',
			flashcards: 'Flashcards',
			pastPapers: 'Past Papers',
			aiTutor: 'AI Tutor',
			studyPlan: 'Study Plan',
			profile: 'Profile',
			settings: 'Settings',
			leaderboard: 'Leaderboard',
			achievements: 'Achievements',
			voiceTutor: 'Voice Tutor',
			tutoring: 'Live Tutoring',
			apsCalculator: 'APS Calculator',
			examTimer: 'Exam Timer',
		},
		af: {
			dashboard: 'Dashbord',
			flashcards: 'Flitskaarte',
			pastPapers: 'Vraestelle',
			aiTutor: 'KI Tutor',
			studyPlan: 'Studieplan',
			profile: 'Profiel',
			settings: 'Instellings',
			leaderboard: 'Leaderboard',
			achievements: 'Prestasies',
			voiceTutor: 'Stem Tutor',
			tutoring: 'Regstreekse Tutor',
			apsCalculator: 'APS Sakrekenaar',
			examTimer: 'Eksamen Tydhouer',
		},
		zu: {
			dashboard: 'Ideshodi',
			flashcards: 'Amakhadi Okufunda',
			payPapers: 'Amaphepha Edlule',
			aiTutor: 'UM-fundisi we-AI',
			studyPlan: 'Inqubo Yofunda',
			profile: 'Iphrofayela',
			settings: 'Izilungiselelo',
			leaderboard: 'Uhla Lwabaholi',
			achievements: 'Izinzuzo',
			voiceTutor: 'Umfundisi weSizwi',
			tutoring: 'Ukufundisa Okuqhubekayo',
			apsCalculator: 'Isibali se-APS',
			examTimer: 'Isikhathi Sesiheki',
		},
	},
	aiTutor: {
		en: {
			placeholder: 'Ask me anything about your studies...',
			thinking: 'Looking up...',
			suggestions: 'Try asking about:',
			explainTopic: 'Explain {topic}',
			practice: 'Practice questions for {topic}',
			summary: 'Summarize this: {content}',
		},
		af: {
			placeholder: 'Vra my enige iets oor jou studies...',
			thinking: 'Soek...',
			suggestions: 'Probeer vra oor:',
			explainTopic: 'Verduidelik {topic}',
			practice: 'Oefenvrae vir {topic}',
			summary: 'Vat dit saam: {content}',
		},
		zu: {
			placeholder: 'Ngibuze noma yini ngokufunda kwakho...',
			thinking: 'Ngakha...',
			suggestions: 'Zama ukubuza nge:',
			explainTopic: 'Chaza {topic}',
			practice: 'Imibuzo yokuzijwayeza ku-{topic}',
			summary: 'Shwathanisa lokhu: {content}',
		},
	},
	subjects: {
		en: {
			mathematics: 'Mathematics',
			physicalSciences: 'Physical Sciences',
			lifeSciences: 'Life Sciences',
			geography: 'Geography',
			history: 'History',
			accounting: 'Accounting',
			businessStudies: 'Business Studies',
			economics: 'Economics',
			english: 'English',
			afrikaans: 'Afrikaans',
		},
		af: {
			mathematics: 'Wiskunde',
			physicalSciences: 'Fisiese Wetenskappe',
			lifeSciences: 'Lewenswetenskappe',
			geography: 'Geografie',
			history: 'Geskiedenis',
			accounting: 'Rekeningkunde',
			businessStudies: 'Besigheidstudies',
			economics: 'Ekonomie',
			english: 'Engels',
			afrikaans: 'Afrikaans',
		},
		zu: {
			mathematics: 'Imathemathiki',
			physicalSciences: 'Izinsimbakwama',
			lifeSciences: 'Izinsimbazululwazi',
			geography: 'Ijenali',
			history: 'Inkumbulo',
			accounting: 'I-Accounting',
			businessStudies: 'Izifundo Zengqalasizinda',
			economics: 'Uqhaso',
			english: 'isiNgisi',
			afrikaans: 'isiBhunu',
		},
	},
};

export function t(
	category: keyof typeof TRANSLATIONS,
	key: string,
	language: Language = 'EN',
	params?: Record<string, string>
): string {
	const translations = TRANSLATIONS[category] as unknown as Record<
		Language,
		Record<string, string>
	>;
	const translation = translations?.[language]?.[key];

	if (!translation) {
		const fallback = translations?.EN?.[key] || key;
		if (params) {
			return Object.entries(params).reduce(
				(str, [paramKey, value]) => str.replace(`{${paramKey}}`, value),
				fallback
			);
		}
		return fallback;
	}

	if (params) {
		return Object.entries(params).reduce(
			(str, [paramKey, value]) => str.replace(`{${paramKey}}`, value),
			translation
		);
	}

	return translation;
}

export function getLanguageForAI(language: Language): string {
	const languageMap: Record<Language, string> = {
		EN: 'English',
		AF: 'Afrikaans',
		ZU: 'Zulu',
		XH: 'Xhosa',
		NS: 'Northern Sotho',
		TN: 'Tswana',
		SS: 'Swazi',
		TS: 'Tsonga',
		VE: 'Venda',
		NR: 'Ndebele',
		ST: 'Southern Sotho',
	};
	return languageMap[language] || 'English';
}

export function getSystemPromptForLanguage(language: Language): string {
	const languageName = getLanguageForAI(language);

	if (language === 'EN') {
		return '';
	}

	return `When responding, you may switch to ${languageName} for explanations if the user prefers, but maintain English for academic terminology.`;
}
