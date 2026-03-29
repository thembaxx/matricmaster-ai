export type ContentLevel = 'grade10' | 'grade11' | 'grade12' | 'tertiary' | 'all';

export interface ContentFilterConfig {
	allowedLevels: ContentLevel[];
	strictMode: boolean;
	showAdvancedOption: boolean;
}

export interface AgeGroup {
	level: ContentLevel;
	minAge: number;
	maxAge: number;
	displayName: string;
}

export const AGE_GROUPS: AgeGroup[] = [
	{ level: 'grade10', minAge: 14, maxAge: 16, displayName: 'Grade 10' },
	{ level: 'grade11', minAge: 15, maxAge: 17, displayName: 'Grade 11' },
	{ level: 'grade12', minAge: 16, maxAge: 18, displayName: 'Grade 12' },
	{ level: 'tertiary', minAge: 18, maxAge: 25, displayName: 'Tertiary' },
	{ level: 'all', minAge: 0, maxAge: 100, displayName: 'All ages' },
];

export const CONTENT_HIERARCHY: ContentLevel[] = ['grade10', 'grade11', 'grade12', 'tertiary'];

export function getLevelIndex(level: ContentLevel): number {
	if (level === 'all') return CONTENT_HIERARCHY.length;
	return CONTENT_HIERARCHY.indexOf(level);
}

export function isLevelAllowed(contentLevel: ContentLevel, allowedLevels: ContentLevel[]): boolean {
	if (allowedLevels.includes('all')) return true;

	if (contentLevel === 'all') return true;

	const contentIndex = getLevelIndex(contentLevel);

	for (const allowed of allowedLevels) {
		if (allowed === 'all') return true;

		const allowedIndex = getLevelIndex(allowed);
		if (contentIndex <= allowedIndex) return true;
	}

	return false;
}

export function filterContentByAge<T extends { contentLevel?: ContentLevel }>(
	content: T[],
	userAge: number,
	config?: Partial<ContentFilterConfig>
): T[] {
	const defaultConfig: ContentFilterConfig = {
		allowedLevels: ['grade10', 'grade11', 'grade12'],
		strictMode: false,
		showAdvancedOption: true,
	};

	const finalConfig = { ...defaultConfig, ...config };

	const userLevel = getLevelFromAge(userAge, finalConfig.allowedLevels);

	return content.filter((item) => {
		if (!item.contentLevel) return true;
		return isLevelAllowed(item.contentLevel, [userLevel]);
	});
}

export function getLevelFromAge(age: number, allowedLevels: ContentLevel[]): ContentLevel {
	for (const group of AGE_GROUPS) {
		if (age >= group.minAge && age <= group.maxAge) {
			if (allowedLevels.includes(group.level)) {
				return group.level;
			}
		}
	}

	if (age < 15) return 'grade10';
	if (age < 17) return 'grade11';
	if (age < 20) return 'grade12';
	return 'tertiary';
}

export function getContentLevelLabel(level: ContentLevel): string {
	const group = AGE_GROUPS.find((g) => g.level === level);
	return group?.displayName || level.toUpperCase();
}

export function getNextLevel(current: ContentLevel): ContentLevel | null {
	const index = CONTENT_HIERARCHY.indexOf(current);
	if (index === -1 || index >= CONTENT_HIERARCHY.length - 1) return null;
	return CONTENT_HIERARCHY[index + 1];
}

export function getPreviousLevel(current: ContentLevel): ContentLevel | null {
	const index = CONTENT_HIERARCHY.indexOf(current);
	if (index <= 0) return null;
	return CONTENT_HIERARCHY[index - 1];
}

export interface ContentRating {
	level: ContentLevel;
	icons: string[];
	description: string;
}

export function getContentRating(level: ContentLevel): ContentRating {
	const ratings: Record<ContentLevel, ContentRating> = {
		grade10: {
			level: 'grade10',
			icons: ['📘'],
			description: 'Suitable for Grade 10 students (ages 14-16)',
		},
		grade11: {
			level: 'grade11',
			icons: ['📗'],
			description: 'Suitable for Grade 11 students (ages 15-17)',
		},
		grade12: {
			level: 'grade12',
			icons: ['📙'],
			description: 'Suitable for Grade 12 / NSC students (ages 16-18)',
		},
		tertiary: {
			level: 'tertiary',
			icons: ['🎓'],
			description: 'Advanced content for university/further education',
		},
		all: {
			level: 'all',
			icons: ['👶', '👨‍🎓', '🎓'],
			description: 'Suitable for all ages and levels',
		},
	};

	return ratings[level] || ratings.all;
}

export function canAccessHigherLevel(
	currentLevel: ContentLevel,
	targetLevel: ContentLevel,
	hasOverride: boolean
): boolean {
	if (hasOverride) return true;

	const currentIndex = getLevelIndex(currentLevel);
	const targetIndex = getLevelIndex(targetLevel);

	return targetIndex <= currentIndex;
}

export function sanitizeContent(content: string, allowedLevels: ContentLevel[]): string {
	if (allowedLevels.includes('all')) return content;

	return content;
}

export function createFilterQuery(levels: ContentLevel[]): string {
	if (levels.includes('all')) return '';

	return levels.map((l) => `content_level = '${l}'`).join(' OR ');
}
