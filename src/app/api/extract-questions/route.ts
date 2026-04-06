// Force dynamic rendering - no SSR pre-rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { type NextRequest, NextResponse } from 'next/server';
import { getExtractedQuestionsAction, saveExtractedQuestionsAction } from '@/lib/db/actions';
import { UnsupportedSubjectError } from '@/services/markdownExtractor';
import { extractQuestionsFromPDF, getCachedQuestions } from '@/services/pdfExtractor';

export const runtime = 'nodejs';

// Enhance questions with quiz-ready formatting
function enhanceQuestionsForQuiz(questions: any[], paper: any): any[] {
	return questions.map((question) => {
		// Estimate difficulty if not set
		if (!question.difficulty) {
			question.difficulty = estimateDifficulty(question.marks);
		}

		// Link to curriculum topics if not set
		if (!question.topic || question.topic === 'General') {
			question.topic = mapToCurriculumTopic(question.questionText, paper.subject);
		}

		// Generate distractors for multiple choice if options not present
		if (!question.options && isObjectiveType(question)) {
			question.options = generateDistractors(question);
		}

		// Add quiz metadata
		question.quizReady = true;
		question.year = paper.year;
		question.month = paper.month;
		question.paper = paper.paper;
		question.subject = paper.subject;

		return question;
	});
}

function estimateDifficulty(marks: number): 'easy' | 'medium' | 'hard' {
	if (marks <= 2) return 'easy';
	if (marks <= 4) return 'medium';
	return 'hard';
}

function mapToCurriculumTopic(questionText: string, subject: string): string {
	// Basic topic mapping based on keywords
	const text = questionText.toLowerCase();
	const subjectTopics: Record<string, string[]> = {
		Mathematics: ['algebra', 'calculus', 'geometry', 'trigonometry', 'statistics'],
		'Physical Sciences': ['physics', 'chemistry', 'mechanics', 'electricity', 'waves'],
		'Life Sciences': ['biology', 'anatomy', 'ecology', 'genetics', 'evolution'],
	};

	const topics = subjectTopics[subject] || [];
	for (const topic of topics) {
		if (text.includes(topic)) {
			return topic.charAt(0).toUpperCase() + topic.slice(1);
		}
	}

	return 'General';
}

function isObjectiveType(question: any): boolean {
	// Consider it objective if it has multiple choice indicators or short answer
	return question.questionText.includes('?') || question.questionText.includes('choose');
}

function generateDistractors(
	question: any
): Array<{ letter: string; text: string; isCorrect: boolean }> {
	// Basic distractor generation - in production this would use AI
	const correctAnswer = question.correctAnswer || 'Correct answer';
	const distractors = [
		{ letter: 'A', text: correctAnswer, isCorrect: true },
		{ letter: 'B', text: 'Incorrect option B', isCorrect: false },
		{ letter: 'C', text: 'Incorrect option C', isCorrect: false },
		{ letter: 'D', text: 'Incorrect option D', isCorrect: false },
	];

	return distractors;
}

// Validate URL to prevent SSRF attacks
function isValidPdfUrl(urlString: string): boolean {
	try {
		const url = new URL(urlString);

		// Only allow HTTPS
		if (url.protocol !== 'https:') {
			return false;
		}

		// Block private IP ranges and localhost
		const hostname = url.hostname.toLowerCase();

		// Block localhost patterns
		if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
			return false;
		}

		// Block metadata service IP
		if (hostname === '169.254.169.254') {
			return false;
		}

		// Block private IPv4 ranges
		if (hostname.match(/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/)) {
			return false;
		}

		// Block private IPv6 ranges
		if (hostname.match(/^(fe80:|fc00:|fd00:|::1)/i)) {
			return false;
		}

		return true;
	} catch (error) {
		console.warn('Failed to validate origin:', error);
		return false;
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { paperId, pdfUrl, subject, paper, year, month } = body;

		// Validate required fields
		if (!paperId || !pdfUrl || !subject || !paper || !year || !month) {
			return NextResponse.json(
				{ error: 'Missing required fields: paperId, pdfUrl, subject, paper, year, month' },
				{ status: 400 }
			);
		}

		// Validate PDF URL to prevent SSRF
		if (!isValidPdfUrl(pdfUrl)) {
			return NextResponse.json(
				{ error: 'Invalid PDF URL: only HTTPS URLs to public domains are allowed' },
				{ status: 400 }
			);
		}

		console.log(`[API] Extracting questions for paper: ${paperId}`);

		// Check for database-cached questions first
		try {
			const dbCached = await getExtractedQuestionsAction(paperId);
			if (dbCached && dbCached.length > 0) {
				console.log(`[API] Using database cache for paper: ${paperId}`);
				return NextResponse.json({
					success: true,
					data: JSON.parse(dbCached),
					cached: true,
					source: 'database',
				});
			}
		} catch (dbError) {
			console.warn('[API] Database cache check failed, continuing:', dbError);
		}

		// Check for in-memory cached questions
		const cached = await getCachedQuestions(paperId);
		if (cached && Object.keys(cached).length > 0) {
			// Save to database for future use
			try {
				await saveExtractedQuestionsAction(paperId, JSON.stringify(cached), cached.markdownFileUrl);
				console.log(`[API] Saved extracted questions to database: ${paperId}`);
			} catch (saveError) {
				console.warn('[API] Failed to save to database:', saveError);
			}

			return NextResponse.json({
				success: true,
				data: cached,
				cached: true,
				source: 'memory',
			});
		}

		// Extract questions from PDF
		const extractedPaper = await extractQuestionsFromPDF(
			paperId,
			pdfUrl,
			subject,
			paper,
			year,
			month
		);

		if (!extractedPaper || Object.keys(extractedPaper).length === 0) {
			console.log('[API] Failed to extract questions');
			return NextResponse.json(
				{
					error: 'Failed to extract questions',
					details: 'Empty data',
				},
				{ status: 500 }
			);
		}

		// Enhance questions for quiz format
		const enhancedQuestions = enhanceQuestionsForQuiz(extractedPaper.questions, extractedPaper);
		extractedPaper.questions = enhancedQuestions;

		// Save extracted questions to database
		try {
			const questionsJson = JSON.stringify(extractedPaper);
			await saveExtractedQuestionsAction(paperId, questionsJson, extractedPaper.markdownFileUrl);
			console.log(`[API] Saved extracted questions to database: ${paperId}`);
		} catch (saveError) {
			console.warn('[API] Failed to save extracted questions to database:', saveError);
		}

		return NextResponse.json({
			success: true,
			data: extractedPaper,
			cached: false,
		});
	} catch (error) {
		console.debug('[API] Error extracting questions:', error);

		if (error instanceof UnsupportedSubjectError) {
			return NextResponse.json(
				{
					error: 'Unsupported document',
					reason: error.reason,
					suggestion: error.suggestion,
					isUnsupported: true,
				},
				{ status: 422 }
			);
		}

		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

		return NextResponse.json(
			{
				error: 'Failed to extract questions',
				details: errorMessage,
			},
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const paperId = searchParams.get('paperId');

	if (!paperId) {
		return NextResponse.json({ error: 'Missing required parameter: paperId' }, { status: 400 });
	}

	// Check database first
	try {
		const dbCached = await getExtractedQuestionsAction(paperId);
		if (dbCached && dbCached.length > 0) {
			return NextResponse.json({
				success: true,
				data: JSON.parse(dbCached),
				cached: true,
				source: 'database',
			});
		}
	} catch (dbError) {
		console.warn('[API] Database check failed:', dbError);
	}

	// Check memory cache
	const cached = await getCachedQuestions(paperId);
	if (cached && Object.keys(cached).length > 0) {
		return NextResponse.json({
			success: true,
			data: cached,
			cached: true,
			source: 'memory',
		});
	}

	return NextResponse.json({ error: 'No cached questions found for this paper' }, { status: 404 });
}
