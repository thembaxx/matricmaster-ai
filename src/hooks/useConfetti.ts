'use client';

import { useCallback, useState } from 'react';

export type ConfettiType = 'lesson-complete' | 'quiz-perfect' | 'streak-milestone' | 'daily-first';

interface ConfettiConfig {
	type: ConfettiType;
	colors?: string[];
}

const CONFETTI_CONFIGS: Record<
	ConfettiType,
	{ particleCount: number; duration: number; colors: string[] }
> = {
	'lesson-complete': {
		particleCount: 50,
		duration: 2000,
		colors: [],
	},
	'quiz-perfect': {
		particleCount: 100,
		duration: 3000,
		colors: ['#fbbf24', '#f59e0b', '#d97706', '#fff', '#a855f7'],
	},
	'streak-milestone': {
		particleCount: 75,
		duration: 2500,
		colors: ['#ef4444', '#f97316', '#fbbf24', '#fef3c7', '#fed7aa'],
	},
	'daily-first': {
		particleCount: 30,
		duration: 1500,
		colors: [],
	},
};

export function useConfetti() {
	const [active, setActive] = useState(false);
	const [config, setConfig] = useState<ConfettiConfig>({ type: 'lesson-complete' });

	const trigger = useCallback((type: ConfettiType, colors?: string[]) => {
		setConfig({ type, colors });
		setActive(true);
	}, []);

	const stop = useCallback(() => {
		setActive(false);
	}, []);

	const getConfig = useCallback((type: ConfettiType) => {
		return CONFETTI_CONFIGS[type];
	}, []);

	return { active, config, trigger, stop, getConfig };
}
