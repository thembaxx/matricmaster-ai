'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_TIMEZONE, getBrowserTimezone, isValidTimezone } from '@/lib/timezone';

interface TimezoneContextValue {
	timezone: string;
	setTimezone: (tz: string) => void;
	isLoading: boolean;
}

const TimezoneContext = createContext<TimezoneContextValue | undefined>(undefined);

const STORAGE_KEY = 'matricmaster_timezone';

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
	const [_timezone, setTimezoneState] = useState<string>(DEFAULT_TIMEZONE);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored && isValidTimezone(stored)) {
			setTimezoneState(stored);
		} else {
			const browserTz = getBrowserTimezone();
			if (isValidTimezone(browserTz)) {
				setTimezoneState(browserTz);
				localStorage.setItem(STORAGE_KEY, browserTz);
			}
		}
		setIsLoading(false);
	}, []);

	const setTimezone = (tz: string) => {
		if (isValidTimezone(tz)) {
			setTimezoneState(tz);
			localStorage.setItem(STORAGE_KEY, tz);
		}
	};

	return (
		<TimezoneContext.Provider value={{ timezone: _timezone, setTimezone, isLoading }}>
			{children}
		</TimezoneContext.Provider>
	);
}

export function useUserTimezone() {
	const context = useContext(TimezoneContext);
	if (!context) {
		return {
			timezone: DEFAULT_TIMEZONE,
			setTimezone: () => {},
			isLoading: true,
		};
	}
	return context;
}
