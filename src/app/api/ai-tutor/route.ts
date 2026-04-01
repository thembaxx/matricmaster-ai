import { and, desc, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import {
	type Citation,
	createCitation,
	findCurriculumTopic,
	getSourceById,
	SOURCE_DATABASE,
} from '@/lib/ai/citations';
import { isStaticFAQ, routeAIQuestionServer } from '@/lib/ai/router';
import { AI_MODELS, generateAI, streamAI } from '@/lib/ai-config';
import { handleApiError } from '@/lib/api-error-handler';
import { getAuth } from '@/lib/auth';
import { getCachedAIResponse, hashString } from '@/lib/cache/ai-cache';
import { dbManager } from '@/lib/db';
import { quizResults, studyPlans, subjects, topicMastery } from '@/lib/db/schema';
import { searchPastPaperQuestions } from '@/lib/rag/search';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

function sanitizeUserInput(input: string): string {
	return input
		.replace(/<\/?student_message>/g, '')
		.replace(/<student_message>/g, '')
		.replace(/system:/gi, 'student:')
		.replace(/ignore previous instructions/gi, '')
		.replace(/you are now/gi, 'you were previously');
}

interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

interface RequestBody {
	message: string;
	subject?: string | null;
	history?: ChatMessage[];
	includeSuggestions?: boolean;
	stream?: boolean;
	language?: 'en' | 'af';
	includeCitations?: boolean;
}

const systemPrompt = `You are an expert South African Matriculation (Grade 12) study tutor. Your role is to help students master their subjects through clear explanations, step-by-step guidance, and practice problems.

## Your Expertise
- Mathematics (Calculus, Algebra, Geometry, Trigonometry, Statistics)
- Physical Sciences (Physics, Chemistry)
- Life Sciences (Biology)
- Accounting, Economics, Geography, History
- English Home Language

## Teaching Approach
1. **Clear Explanations**: Break down complex concepts into simple, understandable parts
2. **Step-by-Step Solutions**: Show your work, especially for math and science problems
3. **Examples**: Provide relevant examples to illustrate points
4. **Encouragement**: Motivate students and celebrate their progress
5. **Socratic Method**: Ask guiding questions to help students discover answers themselves

## Guidelines
- Always be patient and encouraging
- Use South African exam context where relevant (NSC papers, CAPS curriculum)
- Provide worked examples from typical exam questions
- If you don't know something, admit it and suggest where to find the answer
- Format mathematical expressions using LaTeX syntax (e.g., $x^2$, $\\frac{dy}{dx}$)
- Use markdown formatting for better readability (headers, lists, code blocks)
- **Interactive Diagrams**: You can include interactive simulations in your responses using these shortcodes:
  - \`[DIAGRAM:force-vector]\` - Use for Newton's Laws, forces, or mechanics.
  - \`[DIAGRAM:wave-motion]\` - Use for waves, light, sound, or frequency/amplitude.
  - \`[DIAGRAM:phase-change]\` - Use for thermodynamics, states of matter (solid/liquid/gas), or latent heat.
- Keep explanations concise but complete

## Response Format
- Use friendly, conversational tone
- Structure longer responses with headings (##)
- Use bullet points for lists
- Include practice problems when appropriate
- Use code blocks for mathematical notation or examples
- End with encouraging words or next steps

## Source Attribution
When providing factual information, include citations using the format:
- For curriculum content: reference the relevant CAPS document or topic
- For exam-related content: reference NSC past papers
- For general knowledge: indicate AI-generated with confidence level

Include inline citation markers like [cite:...] after key claims where you want to indicate source confidence.
The citations should help students understand where the information comes from and how confident you are in its accuracy.

Remember: Your goal is to help students succeed in their Matric exams!`;

interface UserTutorContext {
	weakTopics: Array<{
		name: string;
		subject: string;
		mastery: number;
	}>;
	activeStudyPlan: {
		subject: string;
		targetDate: Date | null;
	} | null;
	recentPerformance: {
		quizzesCount: number;
		trend: 'improving' | 'declining' | 'stable';
		averageScore: number;
	};
}

async function getUserTutorContext(userId: string): Promise<UserTutorContext> {
	const db = await dbManager.getDb();

	const masteryData = await db
		.select({
			subjectId: topicMastery.subjectId,
			subjectName: subjects.name,
			topic: topicMastery.topic,
			masteryLevel: topicMastery.masteryLevel,
		})
		.from(topicMastery)
		.innerJoin(subjects, eq(topicMastery.subjectId, subjects.id))
		.where(eq(topicMastery.userId, userId))
		.orderBy(topicMastery.masteryLevel)
		.limit(10);

	const weakTopics = masteryData
		.filter((m) => Number(m.masteryLevel) < 60)
		.slice(0, 5)
		.map((t) => ({
			name: t.topic,
			subject: t.subjectName,
			mastery: Number(t.masteryLevel),
		}));

	const [activePlan] = await db
		.select({
			id: studyPlans.id,
			title: studyPlans.title,
			targetExamDate: studyPlans.targetExamDate,
		})
		.from(studyPlans)
		.where(and(eq(studyPlans.userId, userId), eq(studyPlans.isActive, true)))
		.limit(1);

	const recentQuizzes = await db
		.select({
			quizId: quizResults.quizId,
			score: quizResults.score,
			percentage: quizResults.percentage,
			completedAt: quizResults.completedAt,
		})
		.from(quizResults)
		.where(eq(quizResults.userId, userId))
		.orderBy(desc(quizResults.completedAt))
		.limit(10);

	const scores = recentQuizzes.map((q) => Number(q.percentage));
	const recentAvg = scores.slice(0, 5).reduce((a, b) => a + b, 0) / Math.min(5, scores.length);
	const olderAvg = scores.slice(5).reduce((a, b) => a + b, 0) / Math.max(1, scores.length - 5);
	const trend: 'improving' | 'declining' | 'stable' =
		recentAvg > olderAvg + 5 ? 'improving' : recentAvg < olderAvg - 5 ? 'declining' : 'stable';

	return {
		weakTopics,
		activeStudyPlan: activePlan
			? {
					subject: activePlan.title,
					targetDate: activePlan.targetExamDate,
				}
			: null,
		recentPerformance: {
			quizzesCount: recentQuizzes.length,
			trend,
			averageScore:
				scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
		},
	};
}

const suggestionsPrompt = `Based on the student's question and the tutor's response, suggest 2-3 relevant follow-up questions the student might want to ask next. 
Return ONLY a JSON array of 2-3 short, specific questions as strings. No explanation, no markdown, just the JSON array.
Examples: ["can you explain the chain rule?", "show me a practice problem", "what are common mistakes here?"]`;

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
		}

		const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
		const rateLimitResult = await checkRateLimit(session.user.id, 'ai-tutor');
		if (!rateLimitResult.success) {
			return NextResponse.json(
				{
					error: `rate limit exceeded. please try again in ${rateLimitResult.resetIn} seconds.`,
					retryAfter: rateLimitResult.resetIn,
				},
				{
					status: 429,
					headers: getRateLimitHeaders(rateLimitResult),
				}
			);
		}

		if (!GEMINI_API_KEY) {
			return NextResponse.json({ error: 'ai service not configured' }, { status: 500 });
		}

		const body: RequestBody = await request.json();
		const {
			message,
			subject,
			history,
			includeSuggestions = true,
			stream = false,
			language = 'en',
			includeCitations = true,
		} = body;

		if (!message || message.trim().length === 0) {
			return NextResponse.json({ error: 'message is required' }, { status: 400 });
		}

		if (isStaticFAQ(message)) {
			try {
				const cachedResponse = await routeAIQuestionServer(message);
				return NextResponse.json({
					response: cachedResponse,
					suggestions: [],
					cached: true,
				});
			} catch (error) {
				console.debug('cache failed, continuing with ai generation', error);
			}
		}

		let enhancedPrompt = systemPrompt;
		if (session?.user?.id) {
			try {
				const context = await getUserTutorContext(session.user.id);

				if (context.weakTopics.length > 0) {
					enhancedPrompt += `

## Student's Weak Areas (Prioritize these)
${context.weakTopics.map((t) => `- ${t.name} (${t.subject}, ${t.mastery}% mastery)`).join('\n')}`;
				}

				if (context.activeStudyPlan?.targetDate) {
					enhancedPrompt += `

## Current Study Plan
- Subject: ${context.activeStudyPlan.subject}
- Target: ${new Date(context.activeStudyPlan.targetDate).toLocaleDateString()}`;
				}

				enhancedPrompt += `

## Student Context
- Recent performance: ${context.recentPerformance.quizzesCount} quizzes, trend: ${context.recentPerformance.trend}, avg: ${context.recentPerformance.averageScore}%`;
			} catch (error) {
				console.debug('Failed to load user context:', error);
			}
		}

		let conversationContext = `${enhancedPrompt}\n\n`;
		if (language === 'af') {
			conversationContext +=
				'IMPORTANT DIRECTIVE: You MUST provide all explanations and answers entirely in Afrikaans. Do not use English unless directly quoting a provided English text.\n\n';
		}

		try {
			const topicMatch = findCurriculumTopic(subject ?? null, message);
			if (topicMatch) {
				const ragResults = await searchPastPaperQuestions({
					query: message.substring(0, 100),
					subject: topicMatch.subjectId,
					topic: topicMatch.topicName,
					limit: 5,
				});

				if (ragResults.length > 0) {
					const ragContext = ragResults
						.map(
							(r) =>
								`Q: ${r.questionText}\nA: ${r.answerText || '(Answer not available)'}\nYear: ${r.year}, Subject: ${r.subject}`
						)
						.join('\n\n');

					conversationContext += `\n\n## Reference Material (Past Papers)\n${ragContext}\n\nUse this reference material to support your answer where relevant.\n`;
				}
			}
		} catch (error) {
			console.debug('RAG search failed, continuing without context:', error);
		}

		if (history && history.length > 0) {
			const recentHistory = history.slice(-10);
			for (const msg of recentHistory) {
				conversationContext += `${msg.role === 'assistant' ? 'assistant' : 'student'}: ${msg.role === 'user' ? sanitizeUserInput(msg.content) : msg.content}\n`;
			}
		}

		const contextualMessage = subject
			? `[subject: ${subject}] student asks: <student_message>${sanitizeUserInput(message)}</student_message>`
			: `student asks: <student_message>${sanitizeUserInput(message)}</student_message>`;

		conversationContext += `\n${contextualMessage}`;

		if (stream) {
			const result = streamAI({
				prompt: conversationContext,
				model: AI_MODELS.PRIMARY,
			});

			return result.toTextStreamResponse();
		}

		const cacheKey = await hashString(message);
		const isCacheable =
			!history || (history.length === 0 && message.length < 200 && !includeSuggestions);

		const generateMainResponse = async (): Promise<string> => {
			if (isCacheable) {
				try {
					return await getCachedAIResponse(
						`${systemPrompt}\n\n${contextualMessage}`,
						async () => {
							const result = await generateAI({
								prompt: conversationContext,
								model: AI_MODELS.PRIMARY,
							});
							if (!result) throw new Error('ai generation failed');
							return result;
						},
						{
							revalidate: 3600,
							tags: [`query-${cacheKey.slice(0, 8)}`],
						}
					);
				} catch (error) {
					console.warn('cache retrieval failed, generating new response', error);
					return await generateAI({
						prompt: conversationContext,
						model: AI_MODELS.PRIMARY,
					});
				}
			}
			return await generateAI({
				prompt: conversationContext,
				model: AI_MODELS.PRIMARY,
			});
		};

		const generateSuggestions = async (responseText: string): Promise<string[]> => {
			if (!includeSuggestions) return [];
			try {
				const suggestionsResult = await generateAI({
					prompt: `${suggestionsPrompt}\n\nstudent asked: "${message}"\ntutor responded: "${responseText.slice(0, 500)}..."`,
					model: AI_MODELS.PRIMARY,
				});

				const jsonMatch = suggestionsResult.match(/\[[\s\S]*\]/);
				if (jsonMatch) {
					return JSON.parse(jsonMatch[0]);
				}
			} catch (error) {
				console.warn('failed to generate suggestions', error);
			}
			return [];
		};

		const generateCitations = async (
			responseText: string,
			subjectName: string | null
		): Promise<Citation[]> => {
			if (!includeCitations) return [];

			const citations: Citation[] = [];

			const topicMatch = findCurriculumTopic(subjectName, message);
			if (topicMatch) {
				const capsSource = SOURCE_DATABASE.find(
					(s) =>
						s.id === `caps-${subjectName?.toLowerCase().replace(/\s+/g, '-')}` ||
						s.id.startsWith('caps-')
				);

				if (capsSource) {
					citations.push(
						createCitation(capsSource, {
							topic: topicMatch.topicName,
							confidence: 0.95,
						})
					);
				} else {
					const defaultCapsSource = getSourceById('caps-math') || SOURCE_DATABASE[0];
					citations.push(
						createCitation(defaultCapsSource, {
							topic: topicMatch.topicName,
							confidence: 0.85,
						})
					);
				}
			}

			const nscSource = getSourceById('nsc-papers');
			if (nscSource && /exam|question|paper|memo|marking/i.test(responseText)) {
				citations.push(
					createCitation(nscSource, {
						topic: topicMatch?.topicName,
						confidence: 0.9,
						year: 2024,
					})
				);
			}

			const aiSource: Citation = {
				id: 'ai-tutor',
				source: {
					id: 'ai-generated',
					name: 'ai-generated explanation',
					type: 'ai-generated',
					description: 'generated by ai tutor based on curriculum knowledge',
				},
				confidence: 0.75,
				confidenceLevel: 'medium',
			};
			citations.push(aiSource);

			return citations;
		};

		const response = await generateMainResponse();

		if (!response) {
			throw new Error('failed to generate response');
		}

		const suggestions = await generateSuggestions(response);

		const citations = await generateCitations(response, subject ?? null);

		return NextResponse.json({
			response,
			suggestions: suggestions.slice(0, 3),
			citations,
		});
	} catch (error) {
		return handleApiError(error);
	}
}
