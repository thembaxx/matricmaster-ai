'use client';

import type { ShortAnswerQuestion } from '@/constants/quiz/types';

export interface GradingResult {
	score: number;
	maxScore: number;
	isCorrect: boolean;
	feedback: string;
	gradingType: 'exact' | 'keywords' | 'aiGraded';
}

function normalize(str: string): string {
	return str
		.toLowerCase()
		.trim()
		.replace(/[^\w\s]/g, '');
}

function fuzzyMatch(input: string, target: string): boolean {
	const normInput = normalize(input);
	const normTarget = normalize(target);
	if (normInput === normTarget) return true;
	const inputWords = normInput.split(/\s+/);
	const targetWords = normTarget.split(/\s+/);
	const matchingWords = inputWords.filter((w) => targetWords.includes(w));
	return matchingWords.length >= targetWords.length * 0.7;
}

function gradeExact(answer: string, question: ShortAnswerQuestion): GradingResult {
	const normalized = normalize(answer);
	const correctNormalized = normalize(question.correctAnswer);

	if (normalized === correctNormalized) {
		return {
			score: question.maxMarks,
			maxScore: question.maxMarks,
			isCorrect: true,
			feedback: 'Correct! Your answer matches exactly.',
			gradingType: 'exact',
		};
	}

	if (question.acceptableAnswers) {
		const acceptableNormalized = question.acceptableAnswers.map((a) => normalize(a));
		const isFuzzyAcceptable = acceptableNormalized.some((a) => fuzzyMatch(normalized, a));
		if (isFuzzyAcceptable) {
			return {
				score: question.maxMarks,
				maxScore: question.maxMarks,
				isCorrect: true,
				feedback: 'Correct! Your answer is an acceptable alternative.',
				gradingType: 'exact',
			};
		}
	}

	return {
		score: 0,
		maxScore: question.maxMarks,
		isCorrect: false,
		feedback: `The correct answer is: ${question.correctAnswer}`,
		gradingType: 'exact',
	};
}

function gradeKeywords(answer: string, question: ShortAnswerQuestion): GradingResult {
	if (!question.keywords || question.keywords.length === 0) {
		return gradeExact(answer, question);
	}

	const normalized = normalize(answer);
	const keywordMatches = question.keywords.filter((kw) => normalized.includes(kw.toLowerCase()));
	const coverage = keywordMatches.length / question.keywords.length;

	let score: number;
	let feedback: string;

	if (coverage >= 1) {
		score = question.maxMarks;
		feedback = 'Excellent! You included all the key concepts.';
	} else if (coverage >= 0.6) {
		score = Math.round(question.maxMarks * 0.7);
		feedback = `Good effort! You covered ${Math.round(coverage * 100)}% of the key concepts. The full answer should include: ${question.keywords.join(', ')}`;
	} else if (coverage >= 0.3) {
		score = Math.round(question.maxMarks * 0.3);
		feedback = `Partial credit. You mentioned ${keywordMatches.length} of ${question.keywords.length} key terms. Key concepts to include: ${question.keywords.filter((kw) => !keywordMatches.includes(kw.toLowerCase())).join(', ')}`;
	} else {
		score = 0;
		feedback = `The correct answer is: ${question.correctAnswer}`;
	}

	return {
		score,
		maxScore: question.maxMarks,
		isCorrect: coverage >= 0.6,
		feedback,
		gradingType: 'keywords',
	};
}

async function gradeAIGraded(
	answerText: string,
	question: ShortAnswerQuestion
): Promise<GradingResult> {
	const prompt = `Grade this short answer question for a South African NSC Grade 12 student.

Question: ${question.question}
Student's Answer: ${answerText}
Correct Answer: ${question.correctAnswer}
${question.keywords ? `Key Concepts to Look For: ${question.keywords.join(', ')}` : ''}
Max Marks: ${question.maxMarks}

Respond ONLY with a valid JSON object with exactly these fields:
{
  "score": number (0 to ${question.maxMarks}),
  "maxScore": number (${question.maxMarks}),
  "isCorrect": boolean (true if score >= ${Math.round(question.maxMarks * 0.6)}),
  "feedback": string (1-2 sentences of constructive feedback),
  "gradingType": "aiGraded"
}

Be fair but accurate. Partial credit is allowed.`;
	try {
		const { generateTextWithAI } = await import('@/lib/ai/provider');
		const text = await generateTextWithAI({ prompt, temperature: 0.3 });
		const parsed = JSON.parse(text) as GradingResult;
		return parsed;
	} catch (error) {
		console.warn('AI grading failed, falling back to keyword grading:', error);
		return gradeKeywords(answerText, question);
	}
}

export async function gradeShortAnswer(
	answer: string,
	question: ShortAnswerQuestion
): Promise<GradingResult> {
	if (!answer || answer.trim().length === 0) {
		return {
			score: 0,
			maxScore: question.maxMarks,
			isCorrect: false,
			feedback: 'Please provide an answer before submitting.',
			gradingType: question.gradingType,
		};
	}

	const answerText = answer.length > 2000 ? answer.substring(0, 2000) : answer;

	switch (question.gradingType) {
		case 'exact':
			return gradeExact(answerText, question);
		case 'keywords':
			return gradeKeywords(answerText, question);
		case 'aiGraded': {
			const timeoutMs = 10000;
			const timeoutPromise = new Promise<GradingResult>((_, reject) => {
				setTimeout(() => reject(new Error('AI grading timed out')), timeoutMs);
			});
			try {
				return await Promise.race([gradeAIGraded(answerText, question), timeoutPromise]);
			} catch {
				return gradeKeywords(answerText, question);
			}
		}
		default:
			return gradeExact(answerText, question);
	}
}

export function gradeMatching(
	userPairs: Record<string, string>,
	correctPairs: Record<string, string>
): GradingResult {
	let correct = 0;
	const total = Object.keys(correctPairs).length;

	for (const [left, right] of Object.entries(userPairs)) {
		if (correctPairs[left] === right) {
			correct++;
		}
	}

	return {
		score: correct,
		maxScore: total,
		isCorrect: correct === total,
		feedback:
			correct === total
				? 'Perfect! All pairs matched correctly.'
				: `${correct} out of ${total} pairs matched correctly.`,
		gradingType: 'exact',
	};
}
