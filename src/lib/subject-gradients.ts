export const SUBJECT_GRADIENTS: Record<
	string,
	{ primary: string; secondary: string; accent: string }
> = {
	mathematics: { primary: '#667eea', secondary: '#764ba2', accent: '#a855f7' },
	physics: { primary: '#11998e', secondary: '#38ef7d', accent: '#34d399' },
	chemistry: { primary: '#fc4a1a', secondary: '#f7b733', accent: '#fb923c' },
	'life-sciences': { primary: '#56ab2f', secondary: '#a8e063', accent: '#84cc16' },
	english: { primary: '#c9d6ff', secondary: '#e2e2e2', accent: '#94a3b8' },
	geography: { primary: '#8e2de2', secondary: '#4a00e0', accent: '#a855f7' },
	history: { primary: '#cb2d3e', secondary: '#ef473a', accent: '#f87171' },
	accounting: { primary: '#0f4c75', secondary: '#3282b8', accent: '#60a5fa' },
	economics: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
};

export function getGradientColors(subjectId: string): {
	primary: string;
	secondary: string;
	accent: string;
} {
	return SUBJECT_GRADIENTS[subjectId] || SUBJECT_GRADIENTS.mathematics;
}

export function getGradientColorsArray(subjectId: string): string[] {
	const colors = getGradientColors(subjectId);
	return [colors.primary, colors.secondary, colors.accent];
}
