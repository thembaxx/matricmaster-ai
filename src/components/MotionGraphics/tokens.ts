import { animation, borderRadius, colors, subjectColors } from '@/lib/tokens';

export const TIIMO_COLORS = {
	...colors.tiimo,
	...subjectColors,
	success: colors.semantic.success,
	destructive: colors.semantic.error,
	warning: colors.semantic.warning,
	info: colors.semantic.info,
	darkBg: colors.background.dark,
	darkElevated: colors.surface.dark,
	darkBorder: colors.border.dark,
} as const;

export const TIIMO_EASE = {
	bouncy: animation.easings.tiimo.slice(0, 4) as [number, number, number, number],
	smooth: animation.easings.smooth.slice(0, 4) as [number, number, number, number],
} as const;

export const TIIMO_DURATION = {
	fast: animation.durations.fast,
	normal: animation.durations.normal,
	slow: animation.durations.slow,
} as const;

export const TIIMO_RADIUS = borderRadius;
