export interface SummaryPoint {
	id: number;
	description: string;
	quotation: string;
}

export interface PointAnalysisResult {
	pointId: number;
	matched: boolean;
	evidence?: string;
	isVerbatim: boolean;
}

export interface LanguageMarksCriteria {
	minPoints: number;
	maxPoints: number;
	languageMarks: number;
}

// ============================================================================
// 1. normalizeText - Normalizes text for comparison
// ============================================================================
export function normalizeText(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s]/g, '') // Remove punctuation
		.replace(/\s+/g, ' '); // Replace multiple spaces with single space
}

// ============================================================================
// 2. analyzeSummaryPoints - Analyzes which summary points student included
// ============================================================================
export function analyzeSummaryPoints(
	studentAnswer: string,
	requiredPoints: SummaryPoint[],
	options?: { strictMode?: boolean; allowPartialMatch?: boolean }
): PointAnalysisResult[] {
	const { allowPartialMatch = true } = options || {};
	const results: PointAnalysisResult[] = [];

	for (const point of requiredPoints) {
		const normalizedAnswer = normalizeText(studentAnswer);
		const normalizedQuotation = normalizeText(point.quotation);

		let matched = false;
		let evidence: string | undefined;
		let isVerbatim = false;

		// Check for verbatim match (exact or near-exact quote)
		if (normalizedAnswer.includes(normalizedQuotation)) {
			matched = true;
			isVerbatim = true;
			evidence = findEvidence(studentAnswer, point.quotation);
		}
		// Check for paraphrased match using description keywords
		else if (allowPartialMatch) {
			const keywords = extractKeywords(point.description);
			const matchCount = keywords.filter((kw) =>
				normalizedAnswer.includes(normalizeText(kw))
			).length;

			// Require at least 50% of keywords to match
			if (matchCount >= Math.ceil(keywords.length / 2)) {
				matched = true;
				isVerbatim = false;
				evidence = findEvidence(studentAnswer, keywords.join(' '));
			}
		}

		results.push({
			pointId: point.id,
			matched,
			evidence,
			isVerbatim,
		});
	}

	return results;
}

// Helper: Extract keywords from description
function extractKeywords(description: string): string[] {
	// Remove stop words and extract meaningful keywords
	const stopWords = new Set([
		'the',
		'a',
		'an',
		'and',
		'or',
		'but',
		'in',
		'on',
		'at',
		'to',
		'for',
		'of',
		'with',
		'by',
		'is',
		'are',
		'was',
		'were',
		'be',
		'been',
		'being',
		'have',
		'has',
		'had',
		'do',
		'does',
		'did',
		'will',
		'would',
		'could',
		'should',
		'may',
		'might',
		'must',
		'can',
	]);

	return description
		.toLowerCase()
		.replace(/[^\w\s]/g, '')
		.split(/\s+/)
		.filter((word) => word.length > 2 && !stopWords.has(word));
}

// Helper: Find evidence snippet in student answer
function findEvidence(text: string, searchTerm: string): string {
	const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
	if (index === -1) return '';

	const start = Math.max(0, index - 30);
	const end = Math.min(text.length, index + searchTerm.length + 30);

	return text.substring(start, end).trim();
}

// ============================================================================
// 3. calculateLanguageMarks - Calculates language marks for summary
// ============================================================================
export function calculateLanguageMarks(
	contentPointsScored: number,
	totalPossiblePoints: number,
	hasVerbatimQuoting: boolean,
	verbatimCount?: number
): { languageMarks: number; explanation: string } {
	// Default criteria for non-verbatim responses
	const nonVerbatimCriteria: LanguageMarksCriteria[] = [
		{ minPoints: 1, maxPoints: 3, languageMarks: 1 },
		{ minPoints: 4, maxPoints: 5, languageMarks: 2 },
		{ minPoints: 6, maxPoints: totalPossiblePoints, languageMarks: 3 },
	];

	// Criteria for verbatim responses (stricter)
	const verbatimCriteria: LanguageMarksCriteria[] = [
		{ minPoints: 6, maxPoints: totalPossiblePoints, languageMarks: 0 },
		{ minPoints: 4, maxPoints: 5, languageMarks: 1 },
		{ minPoints: 2, maxPoints: 3, languageMarks: 2 },
		{ minPoints: 0, maxPoints: 1, languageMarks: 0 },
	];

	const criteria = hasVerbatimQuoting ? verbatimCriteria : nonVerbatimCriteria;

	// Find matching criteria
	const matchingCriterion = criteria.find(
		(crit) => contentPointsScored >= crit.minPoints && contentPointsScored <= crit.maxPoints
	);

	const languageMarks = matchingCriterion ? matchingCriterion.languageMarks : 0;

	// Generate explanation
	let explanation = '';
	if (hasVerbatimQuoting) {
		explanation = `Language marks reduced due to verbatim quoting (${verbatimCount || 0} quotes). `;
	}

	explanation += `Awarded ${languageMarks} language mark(s) for ${contentPointsScored} content point(s).`;

	return {
		languageMarks,
		explanation,
	};
}

// ============================================================================
// 4. evaluateSummary - Complete summary evaluation function
// ============================================================================
export interface SummaryEvaluationResult {
	contentMarks: number;
	languageMarks: number;
	totalMarks: number;
	matchedPoints: PointAnalysisResult[];
	wordCount: number;
	exceedsWordLimit: boolean;
	explanation: string;
}

export function evaluateSummary(
	studentAnswer: string,
	requiredPoints: SummaryPoint[],
	maxWordLimit: number,
	requiredPointsCount: number = 7
): SummaryEvaluationResult {
	// Analyze which points were included
	const matchedPoints = analyzeSummaryPoints(studentAnswer, requiredPoints);

	// Count matched points (max requiredPointsCount)
	const contentMarks = Math.min(matchedPoints.filter((p) => p.matched).length, requiredPointsCount);

	// Check for verbatim quoting
	const verbatimCount = matchedPoints.filter((p) => p.matched && p.isVerbatim).length;
	const hasVerbatimQuoting = verbatimCount > 0;

	// Calculate language marks
	const { languageMarks, explanation: langExplanation } = calculateLanguageMarks(
		contentMarks,
		requiredPointsCount,
		hasVerbatimQuoting,
		verbatimCount
	);

	// Word count check
	const wordCount = studentAnswer
		.trim()
		.split(/\s+/)
		.filter((w) => w.length > 0).length;
	const exceedsWordLimit = wordCount > maxWordLimit;

	// Build final explanation
	const explanation = [
		`Content marks: ${contentMarks}/${requiredPointsCount} points`,
		langExplanation,
		`Word count: ${wordCount}/${maxWordLimit} ${exceedsWordLimit ? '(exceeds limit)' : ''}`,
	].join('. ');

	return {
		contentMarks,
		languageMarks,
		totalMarks: contentMarks + languageMarks,
		matchedPoints,
		wordCount,
		exceedsWordLimit,
		explanation,
	};
}

// ============================================================================
// 5. evaluateExactMatch - For questions with exact/keyword answers
// ============================================================================
export interface ExactMatchEvaluationResult {
	awardedMarks: number;
	maxMarks: number;
	matchedAnswer?: string;
	isExactMatch: boolean;
}

export function evaluateExactMatch(
	studentAnswer: string,
	acceptableAnswers: string[],
	options?: { caseSensitive?: boolean; acceptPartial?: boolean }
): ExactMatchEvaluationResult {
	const { caseSensitive = false, acceptPartial = false } = options || {};

	let normalizedStudent = studentAnswer;
	if (!caseSensitive) {
		normalizedStudent = normalizedStudent.toLowerCase();
	}

	// Check for exact match
	for (const acceptable of acceptableAnswers) {
		let normalizedAcceptable = acceptable;
		if (!caseSensitive) {
			normalizedAcceptable = normalizedAcceptable.toLowerCase();
		}

		if (normalizedStudent === normalizedAcceptable) {
			return {
				awardedMarks: 1,
				maxMarks: 1,
				matchedAnswer: acceptable,
				isExactMatch: true,
			};
		}
	}

	// Check for partial match (if allowed)
	if (acceptPartial) {
		for (const acceptable of acceptableAnswers) {
			let normalizedAcceptable = acceptable;
			if (!caseSensitive) {
				normalizedAcceptable = normalizedAcceptable.toLowerCase();
			}

			if (normalizedStudent.includes(normalizedAcceptable)) {
				return {
					awardedMarks: 1,
					maxMarks: 1,
					matchedAnswer: acceptable,
					isExactMatch: false,
				};
			}
		}
	}

	// No match
	return {
		awardedMarks: 0,
		maxMarks: 1,
		isExactMatch: false,
	};
}

// ============================================================================
// 6. evaluateKeywordBased - For questions requiring specific keywords
// ============================================================================
export interface KeywordMatch {
	keyword: string;
	found: boolean;
	position?: number;
}

export interface KeywordEvaluationResult {
	awardedMarks: number;
	maxMarks: number;
	keywordMatches: KeywordMatch[];
	explanation: string;
}

export function evaluateKeywordBased(
	studentAnswer: string,
	requiredKeywords: string[],
	maxMarks: number,
	options?: { caseSensitive?: boolean; requireAll?: boolean }
): KeywordEvaluationResult {
	const { caseSensitive = false, requireAll = false } = options || {};

	let normalizedAnswer = studentAnswer;
	if (!caseSensitive) {
		normalizedAnswer = normalizedAnswer.toLowerCase();
	}

	const keywordMatches: KeywordMatch[] = requiredKeywords.map((keyword) => {
		let normalizedKeyword = keyword;
		if (!caseSensitive) {
			normalizedKeyword = normalizedKeyword.toLowerCase();
		}

		const found = normalizedAnswer.includes(normalizedKeyword);
		const position = found ? normalizedAnswer.indexOf(normalizedKeyword) : -1;

		return {
			keyword,
			found,
			position: position >= 0 ? position : undefined,
		};
	});

	const foundCount = keywordMatches.filter((k) => k.found).length;

	// If requireAll is true, must find all keywords
	const awardedMarks = requireAll
		? foundCount === requiredKeywords.length
			? maxMarks
			: 0
		: Math.min(foundCount, maxMarks);

	const explanation = `${foundCount}/${requiredKeywords.length} keywords found. Awarded ${awardedMarks}/${maxMarks} marks.`;

	return {
		awardedMarks,
		maxMarks,
		keywordMatches,
		explanation,
	};
}

// ============================================================================
// 7. evaluateMultipleChoice - For MCQ questions
// ============================================================================
export function evaluateMultipleChoice(
	studentAnswer: string,
	correctOption: string,
	options?: { acceptLetterOrText?: boolean }
): { awardedMarks: number; maxMarks: number; isCorrect: boolean } {
	const { acceptLetterOrText = true } = options || {};

	const normalizedStudent = normalizeText(studentAnswer);
	const normalizedCorrect = normalizeText(correctOption);

	let isCorrect = false;

	if (acceptLetterOrText) {
		// Check if student answered with letter (e.g., "D") or full text
		isCorrect =
			normalizedStudent === normalizedCorrect ||
			normalizedStudent.includes(normalizedCorrect) ||
			normalizedCorrect.includes(normalizedStudent);
	} else {
		isCorrect = normalizedStudent === normalizedCorrect;
	}

	return {
		awardedMarks: isCorrect ? 1 : 0,
		maxMarks: 1,
		isCorrect,
	};
}

// ============================================================================
// 8. countWords - Word counter with proper handling
// ============================================================================
export function countWords(text: string): number {
	return text
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0).length;
}
