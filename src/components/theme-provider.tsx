'use client';

import { useEffect, useState } from 'react';
import { useThemeStore, type Theme } from '@/stores/useThemeStore';

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
};

export function ThemeProvider({
	children,
}: ThemeProviderProps) {
	const { theme } = useThemeStore();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;

		const root = window.document.documentElement;
		root.classList.remove('light', 'dark');

		if (theme === 'system') {
			const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light';
			root.classList.add(systemTheme);
		} else {
			root.classList.add(theme);
		}
	}, [theme, mounted]);

	// Prevent hydration mismatch by rendering children without theme class initially
	return <>{children}</>;
}

export const useTheme = () => {
	const { theme, setTheme } = useThemeStore();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return {
		theme: mounted ? theme : 'system',
		setTheme,
	};
};
