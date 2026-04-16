'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

export interface SettingsState {
	dataSaverMode: boolean;
	targetAPS: number;
	aiLanguage: 'en' | 'af';
	autoConvertWrongAnswers: boolean;
}

interface SettingsContextType extends SettingsState {
	setDataSaverMode: (val: boolean) => void;
	setTargetAPS: (val: number) => void;
	setAiLanguage: (val: 'en' | 'af') => void;
	setAutoConvertWrongAnswers: (val: boolean) => void;
}

const defaultState: SettingsState = {
	dataSaverMode: false,
	targetAPS: 0,
	aiLanguage: 'en',
	autoConvertWrongAnswers: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
	const [dataSaverMode, setDataSaverMode] = useState(defaultState.dataSaverMode);
	const [targetAPS, setTargetAPS] = useState(defaultState.targetAPS);
	const [aiLanguage, setAiLanguage] = useState<SettingsState['aiLanguage']>(
		defaultState.aiLanguage
	);
	const [autoConvertWrongAnswers, setAutoConvertWrongAnswers] = useState(
		defaultState.autoConvertWrongAnswers
	);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		try {
			const saved = localStorage.getItem('lumni_settings');
			if (saved) {
				const parsed = JSON.parse(saved);
				if (typeof parsed.dataSaverMode === 'boolean') setDataSaverMode(parsed.dataSaverMode);
				if (typeof parsed.targetAPS === 'number') setTargetAPS(parsed.targetAPS);
				if (parsed.aiLanguage === 'en' || parsed.aiLanguage === 'af')
					setAiLanguage(parsed.aiLanguage);
				if (typeof parsed.autoConvertWrongAnswers === 'boolean')
					setAutoConvertWrongAnswers(parsed.autoConvertWrongAnswers);
			}
		} catch {
			// Ignore read errors
		}
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		localStorage.setItem(
			'lumni_settings',
			JSON.stringify({
				dataSaverMode,
				targetAPS,
				aiLanguage,
				autoConvertWrongAnswers,
			})
		);
	}, [dataSaverMode, targetAPS, aiLanguage, autoConvertWrongAnswers]);

	return (
		<SettingsContext.Provider
			value={{
				dataSaverMode,
				setDataSaverMode,
				targetAPS,
				setTargetAPS,
				aiLanguage,
				setAiLanguage,
				autoConvertWrongAnswers,
				setAutoConvertWrongAnswers,
			}}
		>
			{children}
		</SettingsContext.Provider>
	);
}

export function useSettings() {
	const context = useContext(SettingsContext);
	if (context === undefined) {
		throw new Error('useSettings must be used within a SettingsProvider');
	}
	return context;
}
