import { GoogleGenAI } from '@google/genai';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { getLearningStats, getTopicsNeedingReview } from '@/lib/db/adaptive-question-actions';

interface RecommendationRequest {
	subjectId?: number;
	includeFlashcards?: boolean;
}

interface StudyRecommendation {
	type: 'weak_topic' | 'review' | 'practice' | 'flashcard' | 'new_topic';
	priority: 'high' | 'medium' | 'low';
	topic: string;
	reason: string;
	action: string;
	estimatedTime: string;
}

interface RecommendationsResponse {
	recommendations: StudyRecommendation[];
	summary: string;
	overdueReviews: number;
	totalWeakTopics: number;
}

const recommendationsPrompt = `You are an expert learning advisor for South African Matric students. Based on the student's learning data, generate personalized study recommendations.

## Input Data
You will receive:
- Learning statistics (weak topics, strong topics, improving topics, topics needing review)
- Overall accuracy and question counts
- Overdue reviews count

## Task
Generate 3-5 actionable study recommendations in JSON format. Each recommendation should be specific and motivating.

## Output Format
Return ONLY a JSON object with this structure:
{
  "recommendations": [
    {
      "type": "weak_topic" | "review" | "practice" | "flashcard" | "new_topic",
      "priority": "high" | "medium" | "low",
      "topic": "specific topic name",
      "reason": "why this is important (1 sentence)",
      "action": "specific action to take",
      "estimatedTime": "estimated study time (e.g., '15 min')"
    }
  ],
  "summary": "A 1-2 sentence encouraging summary of the student's progress and what to focus on"
}

## Guidelines
- Prioritize weak topics and overdue reviews
- Be specific about which topics to study
- Estimate realistic study times (5-30 minutes)
- Use encouraging, motivating language
- Consider spaced repetition principles
- Reference South African curriculum context where relevant`;

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
		if (!GEMINI_API_KEY) {
			return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
		}

		const body: RecommendationRequest = await request.json();
		const { subjectId } = body;

		const [learningStats, overdueReviews] = await Promise.all([
			getLearningStats(session.user.id),
			getTopicsNeedingReview(session.user.id),
		]);

		const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

		const studentData = {
			totalQuestions: learningStats.totalQuestions,
			totalCorrect: learningStats.totalCorrect,
			overallAccuracy: learningStats.overallAccuracy.toFixed(1),
			weakTopics: learningStats.weakTopics.slice(0, 5).map((t) => ({
				topic: t.topic,
				accuracy: t.accuracy.toFixed(0),
				attempted: t.questionsAttempted,
			})),
			improvingTopics: learningStats.improvingTopics.slice(0, 3).map((t) => ({
				topic: t.topic,
				accuracy: t.accuracy.toFixed(0),
			})),
			strongTopics: learningStats.strongTopics.slice(0, 3).map((t) => ({
				topic: t.topic,
				accuracy: t.accuracy.toFixed(0),
			})),
			needsReview: learningStats.needsReview.slice(0, 3).map((t) => ({
				topic: t.topic,
				lastPracticed: t.lastPracticed,
			})),
			overdueReviewsCount: overdueReviews.length,
		};

		const result = await genAI.models.generateContent({
			model: 'gemini-2.5-flash',
			contents: [
				{
					role: 'user',
					parts: [
						{
							text: `${recommendationsPrompt}\n\nStudent Learning Data:\n${JSON.stringify(studentData, null, 2)}${subjectId ? `\n\nFocus on subject ID: ${subjectId}` : ''}`,
						},
					],
				},
			],
		});

		const responseText = result.text;

		if (!responseText) {
			return generateFallbackRecommendations(learningStats, overdueReviews);
		}

		try {
			const jsonMatch = responseText.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				const parsed: RecommendationsResponse = JSON.parse(jsonMatch[0]);
				return NextResponse.json({
					...parsed,
					overdueReviews: overdueReviews.length,
					totalWeakTopics: learningStats.weakTopics.length,
				});
			}
		} catch (parseError) {
			console.warn('[Recommendations] Failed to parse AI response:', parseError);
		}

		return generateFallbackRecommendations(learningStats, overdueReviews);
	} catch (error) {
		console.debug('[Recommendations] Error:', error);
		return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
	}
}

function generateFallbackRecommendations(
	learningStats: Awaited<ReturnType<typeof getLearningStats>>,
	overdueReviews: Awaited<ReturnType<typeof getTopicsNeedingReview>>
): NextResponse<RecommendationsResponse> {
	const recommendations: StudyRecommendation[] = [];

	if (learningStats.weakTopics.length > 0) {
		const topic = learningStats.weakTopics[0];
		recommendations.push({
			type: 'weak_topic',
			priority: 'high',
			topic: topic.topic,
			reason: `Your accuracy is ${topic.accuracy.toFixed(0)}% - this needs attention`,
			action: `Practice ${topic.topic} questions with step-by-step hints`,
			estimatedTime: '20 min',
		});
	}

	if (overdueReviews.length > 0) {
		recommendations.push({
			type: 'review',
			priority: 'high',
			topic: overdueReviews[0].topic,
			reason: 'This topic is due for spaced repetition review',
			action: 'Review flashcards and practice problems',
			estimatedTime: '15 min',
		});
	}

	if (learningStats.improvingTopics.length > 0) {
		const topic = learningStats.improvingTopics[0];
		recommendations.push({
			type: 'practice',
			priority: 'medium',
			topic: topic.topic,
			reason: `You're improving! Keep the momentum going`,
			action: `Continue practicing ${topic.topic} to build mastery`,
			estimatedTime: '15 min',
		});
	}

	recommendations.push({
		type: 'new_topic',
		priority: 'low',
		topic: 'General Practice',
		reason: 'Regular practice builds long-term retention',
		action: 'Try a mixed practice quiz across all topics',
		estimatedTime: '25 min',
	});

	return NextResponse.json({
		recommendations: recommendations.slice(0, 4),
		summary: `You've answered ${learningStats.totalQuestions} questions with ${learningStats.overallAccuracy.toFixed(0)}% accuracy. Focus on your weak topics first, then review overdue material.`,
		overdueReviews: overdueReviews.length,
		totalWeakTopics: learningStats.weakTopics.length,
	});
}
