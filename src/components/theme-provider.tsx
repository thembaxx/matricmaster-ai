'use client';

import { useEffect, useState } from 'react';
import { type Theme, useThemeStore } from '@/stores/useThemeStore';

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
	const { theme } = useThemeStore();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;

		const root = window.document.documentElement;
		root.classList.remove('light', 'dark');

		const resolved =
			theme === 'system'
				? window.matchMedia('(prefers-color-scheme: dark)').matches
					? 'dark'
					: 'light'
				: theme;

		root.classList.add(resolved);

		if (theme === 'system') {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			const handleChange = (e: MediaQueryListEvent) => {
				root.classList.remove('light', 'dark');
				root.classList.add(e.matches ? 'dark' : 'light');
			};
			mediaQuery.addEventListener('change', handleChange);
			return () => mediaQuery.removeEventListener('change', handleChange);
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
