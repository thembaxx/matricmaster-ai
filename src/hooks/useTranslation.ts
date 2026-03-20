'use client';

import { useCallback, useState } from 'react';
import type { SALanguage } from '@/lib/i18n/languages';
import { useLanguageStore } from './useLanguage';

const GEMINI_TRANSLATION_PROMPT = `You are a translation assistant for a South African education app. 
Translate the given text to {targetLanguage}.
- Preserve the meaning accurately
- Keep English technical terms in English
- Use appropriate South African context
- Be concise and clear
- If the text is already in the target language, return it as-is`;

async function translateWithGemini(
	text: string,
	targetLanguage: SALanguage,
	_apiKey?: string
): Promise<string> {
	const languageNames: Record<SALanguage, string> = {
		en: 'English',
		zu: 'isiZulu',
		xh: 'isiXhosa',
		af: 'Afrikaans',
		tn: 'Setswana',
		ss: 'siSwati',
	};

	try {
		const response = await fetch('/api/translate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				text,
				targetLanguage: languageNames[targetLanguage],
				prompt: GEMINI_TRANSLATION_PROMPT.replace(
					'{targetLanguage}',
					languageNames[targetLanguage]
				),
			}),
		});

		if (!response.ok) {
			throw new Error('Translation failed');
		}

		const data = await response.json();
		return data.translation || text;
	} catch (error) {
		console.error('Translation error, falling back to original text:', error);
		return text;
	}
}

const translationCache = new Map<string, string>();

export function useTranslation() {
	const { language, setLanguage } = useLanguageStore();
	const [isTranslating, setIsTranslating] = useState(false);

	const translate = useCallback(
		async (text: string, targetLang?: SALanguage): Promise<string> => {
			const target = targetLang || language;
			if (target === 'en') return text;

			const cacheKey = `${text}:${target}`;
			if (translationCache.has(cacheKey)) {
				return translationCache.get(cacheKey)!;
			}

			setIsTranslating(true);
			try {
				const translated = await translateWithGemini(text, target);
				translationCache.set(cacheKey, translated);
				return translated;
			} finally {
				setIsTranslating(false);
			}
		},
		[language]
	);

	const translateBatch = useCallback(
		async (texts: string[], targetLang?: SALanguage): Promise<string[]> => {
			const target = targetLang || language;
			if (target === 'en') return texts;

			const translatedTexts: string[] = [];
			for (const text of texts) {
				const translated = await translate(text, target);
				translatedTexts.push(translated);
			}
			return translatedTexts;
		},
		[language, translate]
	);

	const explainInLanguage = useCallback(
		async (explanation: string, targetLang?: SALanguage): Promise<string> => {
			const target = targetLang || language;
			if (target === 'en') return explanation;

			const prefixedExplanation = `Explain in ${targetLang === 'zu' ? 'Zulu' : targetLang === 'xh' ? 'Xhosa' : targetLang === 'af' ? 'Afrikaans' : targetLang === 'tn' ? 'Tswana' : 'Swati'}: ${explanation}`;
			return translate(prefixedExplanation, target);
		},
		[language, translate]
	);

	const t = useCallback((key: string, params?: Record<string, string>): string => {
		let text = key;
		if (params) {
			Object.entries(params).forEach(([k, v]) => {
				text = text.replace(new RegExp(`{${k}}`, 'g'), v);
			});
		}
		return text;
	}, []);

	return {
		language,
		setLanguage,
		isTranslating,
		translate,
		translateBatch,
		explainInLanguage,
		t,
	};
}

export function clearTranslationCache() {
	translationCache.clear();
}
