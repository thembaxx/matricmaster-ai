import { type NextRequest, NextResponse } from 'next/server';
import {
	flagTopicForAI,
	generateFlashcardsForWeakTopic,
	generatePoorPerformanceAlerts,
	processQuizResults,
	scheduleReviewSession,
	suggestPathRetake,
	type TopicResult,
} from '@/services/adaptiveLearningService';

interface ProcessRequestBody {
	quizId: string;
	results: TopicResult[];
}

export async function POST(request: NextRequest) {
	try {
		const body: ProcessRequestBody = await request.json();
		const { quizId, results } = body;

		if (!quizId || !results || !Array.isArray(results)) {
			return NextResponse.json(
				{ error: 'Invalid request body. Required: quizId and results array' },
				{ status: 400 }
			);
		}

		const triggers = await processQuizResults(quizId, results);
		const alerts = await generatePoorPerformanceAlerts(results);

		for (const trigger of triggers) {
			if (trigger.type === 'weak_topic_flagged') {
				await flagTopicForAI([], trigger.topic, trigger.subjectId);
			}
		}

		return NextResponse.json({
			success: true,
			quizId,
			triggers,
			alerts,
			summary: {
				totalTriggers: triggers.length,
				weakTopics: alerts.length,
				poorPerformanceCount: alerts.filter((a) => a.score < 0.6).length,
			},
		});
	} catch (error) {
		console.debug('[Adaptive Learning API] Error processing results:', error);
		return NextResponse.json({ error: 'Failed to process quiz results' }, { status: 500 });
	}
}

export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { action, topic, subject, subjectId, pathId, moduleId, dueDate } = body;

		switch (action) {
			case 'flag_topic': {
				await flagTopicForAI([], topic, subjectId);
				return NextResponse.json({ success: true, action: 'topic_flagged', topic });
			}

			case 'schedule_review': {
				await scheduleReviewSession(topic, subject, new Date(dueDate || Date.now()));
				return NextResponse.json({ success: true, action: 'review_scheduled', topic });
			}

			case 'suggest_retake': {
				const result = await suggestPathRetake(pathId || 'default', topic, moduleId || 'default');
				return NextResponse.json({ success: true, action: 'retake_suggested', ...result });
			}

			case 'generate_flashcards': {
				const result = await generateFlashcardsForWeakTopic(topic, subject);
				return NextResponse.json({
					success: result.success,
					action: 'flashcards_generated',
					cardsCreated: result.cardsCreated,
				});
			}

			default:
				return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
		}
	} catch (error) {
		console.debug('[Adaptive Learning API] Error executing action:', error);
		return NextResponse.json({ error: 'Failed to execute adaptive action' }, { status: 500 });
	}
}
