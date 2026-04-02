export const GRADE_POINTS: Record<string, number> = {
	'7': 7,
	'6': 6,
	'5': 5,
	'4': 4,
	'3': 3,
	'2': 2,
	'1': 1,
	U: 0,
};

export const GRADES = ['7', '6', '5', '4', '3', '2', '1', 'U'] as const;

export const NSC_GRADE_POINTS = GRADE_POINTS;
