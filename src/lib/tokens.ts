export const colors = {
	primary: {
		DEFAULT: '#3B82F6',
		hover: '#2563EB',
		foreground: '#FFFFFF',
	},
	secondary: {
		DEFAULT: '#0F172A',
		foreground: '#F8FAFC',
	},
	tertiary: {
		DEFAULT: '#D16900',
		foreground: '#FFFFFF',
	},
	background: {
		light: '#F8FAFC',
		dark: '#0F172A',
	},
	surface: {
		light: '#FFFFFF',
		dark: '#1E293B',
	},
	text: {
		primary: {
			light: '#0F172A',
			dark: '#F8FAFC',
		},
		secondary: {
			light: '#475569',
			dark: '#CBD5E1',
		},
		muted: {
			light: '#64748B',
			dark: '#94A3B8',
		},
	},
	border: {
		light: '#E2E8F0',
		dark: '#334155',
	},
	semantic: {
		success: '#5CB587',
		warning: '#F2C945',
		error: '#FF5C5C',
		info: '#48A7DE',
	},
	tiimo: {
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
		purple: '#8957E5',
	},
} as const;

export const subjectColors = {
	math: {
		DEFAULT: '#F2C945',
		soft: 'rgba(242, 201, 69, 0.12)',
	},
	physics: {
		DEFAULT: '#3B82F6',
		soft: 'rgba(59, 130, 246, 0.12)',
	},
	lifeSciences: {
		DEFAULT: '#5CB587',
		soft: 'rgba(92, 181, 135, 0.12)',
	},
	chemistry: {
		DEFAULT: '#14B8A6',
		soft: 'rgba(20, 184, 166, 0.12)',
	},
	accounting: {
		DEFAULT: '#F472B6',
		soft: 'rgba(244, 114, 182, 0.12)',
	},
	english: {
		DEFAULT: '#818CF8',
		soft: 'rgba(129, 140, 248, 0.12)',
	},
	geography: {
		DEFAULT: '#2DD4BF',
		soft: 'rgba(45, 212, 191, 0.12)',
	},
	history: {
		DEFAULT: '#D16900',
		soft: 'rgba(209, 105, 0, 0.12)',
	},
} as const;

export const typography = {
	fontFamily: {
		display: "'Playfair Display', Georgia, serif",
		body: "'Geist', system-ui, -apple-system, sans-serif",
		mono: "'Geist Mono', 'SF Mono', ui-monospace, monospace",
		math: "'Noto Sans Math', 'Times New Roman', serif",
	},
	typeScale: {
		xs: { rem: '0.64', px: '10.24' },
		sm: { rem: '0.8', px: '12.8' },
		base: { rem: '1', px: '16' },
		lg: { rem: '1.25', px: '20' },
		xl: { rem: '1.563', px: '25' },
		'2xl': { rem: '1.953', px: '31.25' },
		'3xl': { rem: '2.441', px: '39' },
		'4xl': { rem: '3.052', px: '48.8' },
		'5xl': { rem: '3.815', px: '61' },
		'6xl': { rem: '4.768', px: '76.3' },
	},
	fontWeight: {
		normal: 400,
		medium: 500,
		semibold: 600,
		bold: 700,
	},
	lineHeight: {
		tight: 1.1,
		snug: 1.25,
		normal: 1.5,
		relaxed: 1.625,
		loose: 1.75,
	},
	letterSpacing: {
		tight: '-0.025em',
		normal: '0em',
		wide: '0.025em',
		wider: '0.05em',
	},
} as const;

export const spacing = {
	1: 4,
	2: 8,
	3: 12,
	4: 16,
	5: 20,
	6: 24,
	8: 32,
	10: 40,
	12: 48,
	16: 64,
	20: 80,
	24: 96,
} as const;

export const semanticSpacing = {
	xs: spacing[1],
	sm: spacing[2],
	md: spacing[4],
	lg: spacing[6],
	xl: spacing[8],
	'2xl': spacing[12],
	'3xl': spacing[16],
	'4xl': spacing[24],
} as const;

export const borderRadius = {
	xs: 6,
	sm: 10,
	md: 16,
	lg: 20,
	xl: 24,
	'2xl': 36,
	full: 9999,
} as const;

export const shadows = {
	sm: '0 1px 2px rgba(70, 70, 68, 0.05)',
	md: '0 8px 32px -4px rgba(70, 70, 68, 0.08)',
	lg: '0 16px 48px -8px rgba(70, 70, 68, 0.12)',
	xl: '0 24px 64px -12px rgba(70, 70, 68, 0.16)',
} as const;

export const animation = {
	durations: {
		fast: 150,
		normal: 300,
		slow: 500,
		enter: 300,
		exit: 200,
		move: 350,
		scale: 200,
	},
	easings: {
		tiimo: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
		smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
		spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
		outExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
	},
} as const;

export const zIndex = {
	dropdown: 50,
	sticky: 100,
	modal: 200,
	toast: 300,
	tooltip: 400,
} as const;

export type Colors = typeof colors;
export type SubjectColors = typeof subjectColors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type SemanticSpacing = typeof semanticSpacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type Animation = typeof animation;
export type ZIndex = typeof zIndex;
