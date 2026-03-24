'use client';

import * as React from 'react';

export const THEMES = { light: '', dark: '.dark' } as const;

// Format: { [key: string]: { label: string; color?: string; icon?: React.ComponentType } }
export type ChartConfig = {
	[k in string]: {
		label?: React.ReactNode;
		icon?: React.ComponentType;
	} & (
		| { color?: string; theme?: never }
		| { color?: never; theme: Record<keyof typeof THEMES, string> }
	);
};

export type ChartContextProps = {
	config: ChartConfig;
};

export const ChartContext = React.createContext<ChartContextProps | null>(null);

export function useChart() {
	const context = React.useContext(ChartContext);

	if (!context) {
		throw new Error('useChart must be used within a ChartContainer.');
	}

	return context;
}
