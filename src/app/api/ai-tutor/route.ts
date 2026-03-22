import { type NextRequest, NextResponse } from 'next/server';
import { isStaticFAQ, routeAIQuestionServer } from '@/lib/ai/router';
import { AI_MODELS, generateAI, streamAI } from '@/lib/ai-config';
import { getAuth } from '@/lib/auth';
import { getCachedAIResponse, hashString } from '@/lib/cache/ai-cache';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

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

Remember: Your goal is to help students succeed in their Matric exams!`;

const suggestionsPrompt = `Based on the student's question and the tutor's response, suggest 2-3 relevant follow-up questions the student might want to ask next. 
Return ONLY a JSON array of 2-3 short, specific questions as strings. No explanation, no markdown, just the JSON array.
Examples: ["Can you explain the chain rule?", "Show me a practice problem", "What are common mistakes here?"]`;

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
		const rateLimitResult = checkRateLimit(session.user.id, 'ai-tutor');
		if (!rateLimitResult.success) {
			return NextResponse.json(
				{
					error: `Rate limit exceeded. Please try again in ${rateLimitResult.resetIn} seconds.`,
					retryAfter: rateLimitResult.resetIn,
				},
				{
					status: 429,
					headers: getRateLimitHeaders(rateLimitResult),
				}
			);
		}

		if (!GEMINI_API_KEY) {
			return NextResponse.json(
				{ error: 'AI service not configured. Please set GEMINI_API_KEY.' },
				{ status: 500 }
			);
		}

		const body: RequestBody = await request.json();
		const { message, subject, history, includeSuggestions = true, stream = false, language = 'en' } = body;

		if (!message || message.trim().length === 0) {
			return NextResponse.json({ error: 'Message is required' }, { status: 400 });
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
				console.debug('Cache failed, continuing with AI generation:', error);
			}
		}

		let conversationContext = `${systemPrompt}\n\n`;
		if (language === 'af') {
			conversationContext += `IMPORTANT DIRECTIVE: You MUST provide all explanations and answers entirely in Afrikaans. Do not use English unless directly quoting a provided English text.\n\n`;
		}

		if (history && history.length > 0) {
			const recentHistory = history.slice(-10);
			for (const msg of recentHistory) {
				conversationContext += `${msg.role === 'assistant' ? 'Assistant' : 'Student'}: ${msg.content}\n`;
			}
		}

		const contextualMessage = subject
			? `[Subject: ${subject}] Student asks: ${message}`
			: `Student asks: ${message}`;

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
							if (!result) throw new Error('AI generation failed');
							return result;
						},
						{
							revalidate: 3600,
							tags: [`query-${cacheKey.slice(0, 8)}`],
						}
					);
				} catch (error) {
					console.warn('Cache retrieval failed, generating new response:', error);
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
					prompt: `${suggestionsPrompt}\n\nStudent asked: "${message}"\nTutor responded: "${responseText.slice(0, 500)}..."`,
					model: AI_MODELS.PRIMARY,
				});

				const jsonMatch = suggestionsResult.match(/\[[\s\S]*\]/);
				if (jsonMatch) {
					return JSON.parse(jsonMatch[0]);
				}
			} catch (error) {
				console.warn('Failed to generate suggestions:', error);
			}
			return [];
		};

		const [response, suggestions] = await Promise.all([
			generateMainResponse(),
			generateSuggestions(''),
		]);

		if (!response) {
			return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
		}

		return NextResponse.json({
			response,
			suggestions: suggestions.slice(0, 3),
		});
	} catch (error) {
		console.debug('AI Tutor Error:', error);
		return NextResponse.json(
			{ error: 'An error occurred while processing your request' },
			{ status: 500 }
		);
	}
}
