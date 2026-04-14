// ============================================================================
// DATA NORMALIZATION UTILITIES FOR ENRICHMENT PIPELINE
// ============================================================================

/**
 * Normalize date inputs into a consistent Date object.
 * Handles ISO strings, local date strings, Date objects, and null.
 */
export function normalizeDate(input: string | Date | null): Date | null {
	if (input === null || input === undefined) return null;
	if (input instanceof Date) {
		return Number.isNaN(input.getTime()) ? null : input;
	}
	if (typeof input === 'string') {
		const trimmed = input.trim();
		if (!trimmed) return null;

		// Try ISO parsing first
		const parsed = new Date(trimmed);
		if (!Number.isNaN(parsed.getTime())) return parsed;

		// Try DD/MM/YYYY or DD-MM-YYYY
		const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
		if (dmyMatch) {
			const [, day, month, year] = dmyMatch;
			const d = new Date(Number(year), Number(month) - 1, Number(day));
			if (!Number.isNaN(d.getTime())) return d;
		}

		// Try YYYY/MM/DD or YYYY-MM-DD (already handled by Date constructor)

		return null;
	}
	return null;
}

/**
 * Map common subject name variants to canonical SA NSC Grade 12 subject names.
 */
const SUBJECT_NAME_MAP: Record<string, string> = {
	// Mathematics
	math: 'Mathematics',
	maths: 'Mathematics',
	mathematics: 'Mathematics',
	'maths lit': 'Mathematical Literacy',
	'mathematical literacy': 'Mathematical Literacy',
	mathtech: 'Mathematical Techniques',
	'math techniques': 'Mathematical Techniques',

	// Physical Sciences
	'phys sci': 'Physical Sciences',
	physics: 'Physical Sciences',
	'physical sci': 'Physical Sciences',
	'physical science': 'Physical Sciences',
	'physical sciences': 'Physical Sciences',
	physsci: 'Physical Sciences',

	// Life Sciences
	'life sci': 'Life Sciences',
	biology: 'Life Sciences',
	'life science': 'Life Sciences',
	'life sciences': 'Life Sciences',

	// English
	english: 'English',
	'english home language': 'English',
	'english first additional language': 'English (FAL)',
	'eng fal': 'English (FAL)',
	'eng hl': 'English',

	// Afrikaans
	afrikaans: 'Afrikaans',
	'afrikaans home language': 'Afrikaans',
	'afrikaans first additional language': 'Afrikaans (FAL)',
	'afr fal': 'Afrikaans (FAL)',
	'afr hl': 'Afrikaans',

	// Geography
	geography: 'Geography',
	geog: 'Geography',

	// History
	history: 'History',
	hist: 'History',

	// Accounting
	accounting: 'Accounting',
	accounts: 'Accounting',
	bookkeeping: 'Accounting',

	// Business Studies
	'business studies': 'Business Studies',
	business: 'Business Studies',
	'bus studies': 'Business Studies',

	// Economics
	economics: 'Economics',
	econ: 'Economics',

	// Additional SA NSC subjects
	'information technology': 'Information Technology',
	it: 'Information Technology',
	'computer applications technology': 'Computer Applications Technology',
	cat: 'Computer Applications Technology',
	design: 'Design',
	'visual arts': 'Visual Arts',
	'dramatic arts': 'Dramatic Arts',
	music: 'Music',
	tourism: 'Tourism',
	'consumer studies': 'Consumer Studies',
	'agricultural sciences': 'Agricultural Sciences',
	'agricultural technology': 'Agricultural Technology',
	'engineering graphics and design': 'Engineering Graphics and Design',
	egd: 'Engineering Graphics and Design',
	'technical mathematics': 'Technical Mathematics',
	'technical sciences': 'Technical Sciences',
};

export function normalizeSubjectName(name: string): string {
	if (!name) return 'Unknown';
	const lower = name.toLowerCase().trim();
	return SUBJECT_NAME_MAP[lower] ?? name;
}

/**
 * Normalize grade level input to SA NSC Grade 12 (represented as 12).
 * Any input that indicates Grade 12 / Matric / Matriculation maps to 12.
 * Other grades pass through as parsed integers.
 */
const GRADE_12_VARIANTS = new Set([
	'12',
	'grade 12',
	'gr12',
	'gr 12',
	'grade12',
	'matric',
	'matriculation',
	'nsc',
	'senior',
	'matric year',
]);

export function normalizeGradeLevel(input: string | number): number {
	if (typeof input === 'number') {
		return Number.isFinite(input) ? Math.round(input) : 12;
	}

	const trimmed = input.toString().toLowerCase().trim();

	if (GRADE_12_VARIANTS.has(trimmed)) {
		return 12;
	}

	// Try to extract a number
	const numMatch = trimmed.match(/(\d+)/);
	if (numMatch) {
		const parsed = Number.parseInt(numMatch[1], 10);
		if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 12) {
			return parsed;
		}
	}

	// Default to Grade 12 for this curriculum
	return 12;
}

/**
 * Normalize answer format strings: lowercase, trim, normalize whitespace.
 */
export function normalizeAnswerFormat(answer: string): string {
	if (!answer) return '';
	return answer
		.toLowerCase()
		.trim()
		.replace(/\s+/g, ' ')
		.replace(/[\u2018\u2019]/g, "'") // Normalize curly quotes
		.replace(/[\u201C\u201D]/g, '"')
		.replace(/\u00A0/g, ' '); // Normalize non-breaking spaces
}

/**
 * Normalize difficulty levels to a consistent set.
 */
const DIFFICULTY_MAP: Record<string, string> = {
	easy: 'easy',
	simple: 'easy',
	basic: 'easy',
	beginner: 'easy',
	foundation: 'easy',
	medium: 'medium',
	moderate: 'medium',
	intermediate: 'medium',
	average: 'medium',
	standard: 'medium',
	hard: 'hard',
	difficult: 'hard',
	advanced: 'hard',
	challenging: 'hard',
	expert: 'hard',
	complex: 'hard',
};

export function normalizeDifficulty(input: string): string {
	if (!input) return 'medium';
	const lower = input.toLowerCase().trim();
	return DIFFICULTY_MAP[lower] ?? 'medium';
}

/**
 * Normalize percentage to a number between 0 and 100.
 */
export function normalizePercentage(input: string | number | null): number {
	if (input === null || input === undefined) return 0;

	let value: number;
	if (typeof input === 'string') {
		const cleaned = input.replace('%', '').trim();
		value = Number.parseFloat(cleaned);
	} else {
		value = input;
	}

	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(100, value));
}
