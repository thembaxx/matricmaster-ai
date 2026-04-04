export const TIIMO_COLORS = {
	lavender: '#3B82F6',
	cream: '#F8FAFC',
	green: '#5CB587',
	grayDark: '#0F172A',
	grayMuted: '#64748B',
	graySubtle: '#E2E8F0',
	white: '#FFFFFF',
	yellow: '#F2C945',
	blue: '#3B82F6',
	orange: '#D16900',
	pink: '#EC4899',
	teal: '#14B8A6',
	subjectMath: '#F2C945',
	subjectPhysics: '#3B82F6',
	subjectLife: '#5CB587',
	subjectChemistry: '#14B8A6',
	subjectAccounting: '#F472B6',
	subjectEnglish: '#818CF8',
	subjectGeography: '#2DD4BF',
	subjectHistory: '#D16900',
	success: '#5CB587',
	destructive: '#FF5C5C',
	warning: '#F2C945',
	info: '#3B82F6',
	darkBg: '#0F172A',
	darkElevated: '#1E293B',
	darkBorder: '#334155',
} as const;

export const TIIMO_EASE = {
	bouncy: [0.34, 1.56, 0.64, 1] as const,
	smooth: [0.16, 1, 0.3, 1] as const,
} as const;

export const TIIMO_DURATION = {
	fast: 150,
	normal: 300,
	slow: 500,
} as const;

export const TIIMO_RADIUS = {
	xs: 6,
	sm: 10,
	md: 16,
	lg: 20,
	xl: 24,
	full: 9999,
} as const;
