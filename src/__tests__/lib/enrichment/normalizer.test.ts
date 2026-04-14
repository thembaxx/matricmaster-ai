import { describe, expect, it } from 'vitest';
import {
	normalizeAnswerFormat,
	normalizeDate,
	normalizeDifficulty,
	normalizeGradeLevel,
	normalizePercentage,
	normalizeSubjectName,
} from '@/lib/enrichment/normalizer';

// ============================================================================
// 1. normalizeDate
// ============================================================================

describe('normalizer - normalizeDate', () => {
	it('should parse ISO date strings', () => {
		const result = normalizeDate('2024-03-15T10:30:00Z');
		expect(result).toBeInstanceOf(Date);
		expect(result?.getFullYear()).toBe(2024);
		expect(result?.getMonth()).toBe(2); // March (0-indexed)
	});

	it('should handle valid Date objects', () => {
		const input = new Date('2024-06-01');
		const result = normalizeDate(input);
		expect(result).toBeInstanceOf(Date);
		expect(result?.getTime()).toBe(input.getTime());
	});

	it('should return null for null input', () => {
		expect(normalizeDate(null)).toBeNull();
	});

	it('should return null for empty strings', () => {
		expect(normalizeDate('')).toBeNull();
		expect(normalizeDate('   ')).toBeNull();
	});

	it('should return null for invalid date strings', () => {
		expect(normalizeDate('not-a-date')).toBeNull();
		expect(normalizeDate('xyz')).toBeNull();
	});

	it('should return null for invalid Date objects', () => {
		expect(normalizeDate(new Date('invalid'))).toBeNull();
	});

	it('should parse DD/MM/YYYY format', () => {
		const result = normalizeDate('15/03/2024');
		expect(result).toBeInstanceOf(Date);
		expect(result?.getFullYear()).toBe(2024);
		expect(result?.getMonth()).toBe(2);
		expect(result?.getDate()).toBe(15);
	});

	it('should parse DD-MM-YYYY format', () => {
		const result = normalizeDate('15-03-2024');
		expect(result).toBeInstanceOf(Date);
		expect(result?.getDate()).toBe(15);
	});
});

// ============================================================================
// 2. normalizeSubjectName
// ============================================================================

describe('normalizer - normalizeSubjectName', () => {
	it('should map "math" to "Mathematics"', () => {
		expect(normalizeSubjectName('math')).toBe('Mathematics');
	});

	it('should map "maths" to "Mathematics"', () => {
		expect(normalizeSubjectName('maths')).toBe('Mathematics');
	});

	it('should map "mathematics" to "Mathematics"', () => {
		expect(normalizeSubjectName('mathematics')).toBe('Mathematics');
	});

	it('should map "phys sci" to "Physical Sciences"', () => {
		expect(normalizeSubjectName('phys sci')).toBe('Physical Sciences');
	});

	it('should map "biology" to "Life Sciences"', () => {
		expect(normalizeSubjectName('biology')).toBe('Life Sciences');
	});

	it('should map "life sci" to "Life Sciences"', () => {
		expect(normalizeSubjectName('life sci')).toBe('Life Sciences');
	});

	it('should map "english" to "English"', () => {
		expect(normalizeSubjectName('english')).toBe('English');
	});

	it('should map "accounting" to "Accounting"', () => {
		expect(normalizeSubjectName('accounting')).toBe('Accounting');
	});

	it('should map "accounts" to "Accounting"', () => {
		expect(normalizeSubjectName('accounts')).toBe('Accounting');
	});

	it('should map "geography" to "Geography"', () => {
		expect(normalizeSubjectName('geography')).toBe('Geography');
	});

	it('should map "geog" to "Geography"', () => {
		expect(normalizeSubjectName('geog')).toBe('Geography');
	});

	it('should return unknown for unrecognized subjects', () => {
		expect(normalizeSubjectName('unknown-subject')).toBe('unknown-subject');
	});

	it('should return "Unknown" for empty input', () => {
		expect(normalizeSubjectName('')).toBe('Unknown');
	});

	it('should handle case-insensitive mapping', () => {
		expect(normalizeSubjectName('MATH')).toBe('Mathematics');
		expect(normalizeSubjectName('Math')).toBe('Mathematics');
	});
});

// ============================================================================
// 3. normalizeGradeLevel
// ============================================================================

describe('normalizer - normalizeGradeLevel', () => {
	it('should map "12" to 12', () => {
		expect(normalizeGradeLevel('12')).toBe(12);
	});

	it('should map "grade 12" to 12', () => {
		expect(normalizeGradeLevel('grade 12')).toBe(12);
	});

	it('should map "matric" to 12', () => {
		expect(normalizeGradeLevel('matric')).toBe(12);
	});

	it('should map "matriculation" to 12', () => {
		expect(normalizeGradeLevel('matriculation')).toBe(12);
	});

	it('should map "nsc" to 12', () => {
		expect(normalizeGradeLevel('nsc')).toBe(12);
	});

	it('should map numeric input to 12', () => {
		expect(normalizeGradeLevel(12)).toBe(12);
	});

	it('should map other numeric grades correctly', () => {
		expect(normalizeGradeLevel(10)).toBe(10);
		expect(normalizeGradeLevel(8)).toBe(8);
	});

	it('should handle "gr12" as 12', () => {
		expect(normalizeGradeLevel('gr12')).toBe(12);
	});

	it('should handle "gr 12" as 12', () => {
		expect(normalizeGradeLevel('gr 12')).toBe(12);
	});

	it('should default to 12 for unrecognized strings', () => {
		expect(normalizeGradeLevel('unknown-grade')).toBe(12);
	});

	it('should round non-integer numeric inputs', () => {
		expect(normalizeGradeLevel(11.6)).toBe(12);
	});
});

// ============================================================================
// 4. normalizeAnswerFormat
// ============================================================================

describe('normalizer - normalizeAnswerFormat', () => {
	it('should trim whitespace', () => {
		expect(normalizeAnswerFormat('  hello world  ')).toBe('hello world');
	});

	it('should lowercase the input', () => {
		expect(normalizeAnswerFormat('Hello World')).toBe('hello world');
	});

	it('should normalize multiple spaces to single space', () => {
		expect(normalizeAnswerFormat('hello   world')).toBe('hello world');
	});

	it('should normalize curly single quotes', () => {
		expect(normalizeAnswerFormat('it\u2019s')).toBe("it's");
	});

	it('should normalize curly double quotes', () => {
		expect(normalizeAnswerFormat('\u201Chello\u201D')).toBe('"hello"');
	});

	it('should normalize non-breaking spaces', () => {
		expect(normalizeAnswerFormat('hello\u00A0world')).toBe('hello world');
	});

	it('should return empty string for empty input', () => {
		expect(normalizeAnswerFormat('')).toBe('');
	});

	it('should return empty string for null/undefined input', () => {
		expect(normalizeAnswerFormat(null as unknown as string)).toBe('');
		expect(normalizeAnswerFormat(undefined as unknown as string)).toBe('');
	});
});

// ============================================================================
// 5. normalizeDifficulty
// ============================================================================

describe('normalizer - normalizeDifficulty', () => {
	it('should map "easy" variants to "easy"', () => {
		expect(normalizeDifficulty('easy')).toBe('easy');
		expect(normalizeDifficulty('simple')).toBe('easy');
		expect(normalizeDifficulty('basic')).toBe('easy');
		expect(normalizeDifficulty('beginner')).toBe('easy');
	});

	it('should map "medium" variants to "medium"', () => {
		expect(normalizeDifficulty('medium')).toBe('medium');
		expect(normalizeDifficulty('moderate')).toBe('medium');
		expect(normalizeDifficulty('intermediate')).toBe('medium');
	});

	it('should map "hard" variants to "hard"', () => {
		expect(normalizeDifficulty('hard')).toBe('hard');
		expect(normalizeDifficulty('difficult')).toBe('hard');
		expect(normalizeDifficulty('advanced')).toBe('hard');
	});

	it('should default to "medium" for unrecognized input', () => {
		expect(normalizeDifficulty('extreme')).toBe('medium');
	});

	it('should default to "medium" for empty input', () => {
		expect(normalizeDifficulty('')).toBe('medium');
	});

	it('should handle case-insensitive input', () => {
		expect(normalizeDifficulty('EASY')).toBe('easy');
		expect(normalizeDifficulty('Hard')).toBe('hard');
	});
});

// ============================================================================
// 6. normalizePercentage
// ============================================================================

describe('normalizer - normalizePercentage', () => {
	it('should parse numeric input', () => {
		expect(normalizePercentage(75)).toBe(75);
	});

	it('should parse string numbers', () => {
		expect(normalizePercentage('85')).toBe(85);
	});

	it('should parse percentage strings with % sign', () => {
		expect(normalizePercentage('75%')).toBe(75);
	});

	it('should clamp to 0-100 range', () => {
		expect(normalizePercentage(150)).toBe(100);
		expect(normalizePercentage(-10)).toBe(0);
	});

	it('should return 0 for null input', () => {
		expect(normalizePercentage(null)).toBe(0);
	});

	it('should return 0 for invalid input', () => {
		expect(normalizePercentage('abc')).toBe(0);
	});

	it('should handle decimal values', () => {
		expect(normalizePercentage(75.5)).toBe(75.5);
	});
});
