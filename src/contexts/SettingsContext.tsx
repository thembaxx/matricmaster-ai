'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface SettingsState {
	dataSaverMode: boolean;
	targetAPS: number;
	aiLanguage: 'en' | 'af';
}

interface SettingsContextType extends SettingsState {
	setDataSaverMode: (val: boolean) => void;
	setTargetAPS: (val: number) => void;
	setAiLanguage: (val: 'en' | 'af') => void;
}

const defaultState: SettingsState = {
	dataSaverMode: false,
	targetAPS: 0,
	aiLanguage: 'en',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
	const [dataSaverMode, setDataSaverMode] = useState(defaultState.dataSaverMode);
	const [targetAPS, setTargetAPS] = useState(defaultState.targetAPS);
	const [aiLanguage, setAiLanguage] = useState<SettingsState['aiLanguage']>(defaultState.aiLanguage);

	useEffect(() => {
		try {
			const saved = localStorage.getItem('matricmaster_settings');
			if (saved) {
				const parsed = JSON.parse(saved);
				if (typeof parsed.dataSaverMode === 'boolean') setDataSaverMode(parsed.dataSaverMode);
				if (typeof parsed.targetAPS === 'number') setTargetAPS(parsed.targetAPS);
				if (parsed.aiLanguage === 'en' || parsed.aiLanguage === 'af')
					setAiLanguage(parsed.aiLanguage);
			}
		} catch {
			// Ignore read errors
		}
	}, []);

	useEffect(() => {
		localStorage.setItem(
			'matricmaster_settings',
			JSON.stringify({
				dataSaverMode,
				targetAPS,
				aiLanguage,
			})
		);
	}, [dataSaverMode, targetAPS, aiLanguage]);

	return (
		<SettingsContext.Provider
			value={{
				dataSaverMode,
				setDataSaverMode,
				targetAPS,
				setTargetAPS,
				aiLanguage,
				setAiLanguage,
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
