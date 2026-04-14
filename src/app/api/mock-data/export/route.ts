import { type NextRequest, NextResponse } from 'next/server';
import { isMockDataEnabled } from '@/lib/feature-flags';
import { createMockDataGeneratorV2 } from '@/lib/mock-data/generator-v2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/mock-data/export
 *
 * Exports generated mock data in JSON or CSV format.
 * Query params:
 *   - seed (number, required): Random seed for reproducibility
 *   - format ('json' | 'csv', default 'json'): Output format
 */
export async function GET(request: NextRequest) {
	try {
		if (!isMockDataEnabled()) {
			return NextResponse.json({ error: 'Mock data generation is disabled' }, { status: 403 });
		}

		const searchParams = request.nextUrl.searchParams;
		const seedParam = searchParams.get('seed');
		const format = (searchParams.get('format') as 'json' | 'csv') ?? 'json';

		if (!seedParam) {
			return NextResponse.json(
				{ error: 'Missing required query parameter: seed' },
				{ status: 400 }
			);
		}

		const seed = Number(seedParam);
		if (Number.isNaN(seed) || !Number.isFinite(seed)) {
			return NextResponse.json(
				{ error: 'Invalid seed parameter: must be a number' },
				{ status: 400 }
			);
		}

		if (format !== 'json' && format !== 'csv') {
			return NextResponse.json(
				{ error: 'Invalid format parameter: must be "json" or "csv"' },
				{ status: 400 }
			);
		}

		const generator = createMockDataGeneratorV2(undefined, { seed });
		const data = generator.generateAllWithFlag();

		if (format === 'csv') {
			const csvContent = convertToCsv(data);
			return new NextResponse(csvContent, {
				status: 200,
				headers: {
					'Content-Type': 'text/csv',
					'Content-Disposition': 'attachment; filename="mock-data-export.csv"',
				},
			});
		}

		return NextResponse.json({
			seed,
			generatedAt: new Date().toISOString(),
			users: data.users,
			quizResults: data.quizResults,
			studySessions: data.studySessions,
			topicMasteries: data.topicMasteries,
			achievements: data.achievements,
		});
	} catch (error) {
		return NextResponse.json(
			{ error: 'Export failed', details: error instanceof Error ? error.message : String(error) },
			{ status: 500 }
		);
	}
}

/**
 * Convert generated mock data to a tabular CSV string.
 * Produces one section per data type with headers.
 */
function convertToCsv(
	data: ReturnType<ReturnType<typeof createMockDataGeneratorV2>['generateAllWithFlag']>
): string {
	const lines: string[] = [];

	// Users section
	lines.push('# users');
	lines.push('id,email,name,createdAt');
	for (const u of data.users) {
		lines.push([u.id, u.email, escapeCsv(u.name ?? ''), u.createdAt.toISOString()].join(','));
	}

	lines.push('');

	// Quiz results section
	lines.push('# quizResults');
	lines.push(
		'id,userId,quizId,subjectId,topic,score,totalQuestions,percentage,timeTaken,completedAt,source,isReviewMode'
	);
	for (const q of data.quizResults) {
		lines.push(
			[
				q.id,
				q.userId,
				q.quizId,
				String(q.subjectId ?? ''),
				escapeCsv(q.topic ?? ''),
				String(q.score),
				String(q.totalQuestions),
				String(q.percentage),
				String(q.timeTaken),
				q.completedAt.toISOString(),
				q.source ?? '',
				String(q.isReviewMode),
			].join(',')
		);
	}

	lines.push('');

	// Study sessions section
	lines.push('# studySessions');
	lines.push(
		'id,userId,subjectId,sessionType,topic,durationMinutes,questionsAttempted,correctAnswers,marksEarned,startedAt,completedAt'
	);
	for (const s of data.studySessions) {
		lines.push(
			[
				s.id,
				s.userId,
				String(s.subjectId ?? ''),
				s.sessionType,
				escapeCsv(s.topic ?? ''),
				String(s.durationMinutes),
				String(s.questionsAttempted),
				String(s.correctAnswers),
				String(s.marksEarned ?? ''),
				s.startedAt.toISOString(),
				s.completedAt.toISOString(),
			].join(',')
		);
	}

	lines.push('');

	// Topic masteries section
	lines.push('# topicMasteries');
	lines.push(
		'id,userId,subjectId,topic,masteryLevel,questionsAttempted,questionsCorrect,consecutiveCorrect,lastPracticed,createdAt,updatedAt'
	);
	for (const t of data.topicMasteries) {
		lines.push(
			[
				t.id,
				t.userId,
				String(t.subjectId),
				escapeCsv(t.topic),
				String(t.masteryLevel),
				String(t.questionsAttempted),
				String(t.questionsCorrect),
				String(t.consecutiveCorrect),
				t.lastPracticed.toISOString(),
				t.createdAt.toISOString(),
				t.updatedAt.toISOString(),
			].join(',')
		);
	}

	lines.push('');

	// Achievements section
	lines.push('# achievements');
	lines.push('id,userId,achievementId,title,description,icon,unlockedAt');
	for (const a of data.achievements) {
		lines.push(
			[
				a.id,
				a.userId,
				a.achievementId,
				escapeCsv(a.title),
				escapeCsv(a.description),
				a.icon ?? '',
				a.unlockedAt.toISOString(),
			].join(',')
		);
	}

	return lines.join('\n');
}

/**
 * Escape a CSV field value (wrap in quotes if it contains commas, quotes, or newlines).
 */
function escapeCsv(value: string): string {
	if (value.includes(',') || value.includes('"') || value.includes('\n')) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}
