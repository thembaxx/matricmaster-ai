export const TIIMO_COLORS = {
	lavender: '#9F85FF',
	cream: '#FAF8F5',
	green: '#5CB587',
	grayDark: '#464644',
	grayMuted: '#8E8E8E',
	graySubtle: '#D1D1D1',
	white: '#FFFFFF',
	yellow: '#F2C945',
	blue: '#48A7DE',
	orange: '#F97316',
	pink: '#EC4899',
	teal: '#14B8A6',
	subjectMath: '#F2C945',
	subjectPhysics: '#48A7DE',
	subjectLife: '#5CB587',
	subjectChemistry: '#14B8A6',
	subjectAccounting: '#F472B6',
	subjectEnglish: '#818CF8',
	subjectGeography: '#2DD4BF',
	subjectHistory: '#FB923C',
	success: '#5CB587',
	destructive: '#FF5C5C',
	warning: '#F2C945',
	info: '#48A7DE',
	darkBg: '#1F1F1F',
	darkElevated: '#2A2A2A',
	darkBorder: '#383838',
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
