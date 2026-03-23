import { getUserApsScores, getUserTotalAps, upsertApsScore } from '@/lib/db/aps-actions';
import { getQuizResultsByUser } from '@/lib/db/quiz-results-actions';

export function percentageToGrade(percentage: number): string {
	if (percentage >= 80) return '7';
	if (percentage >= 70) return '6';
	if (percentage >= 60) return '5';
	if (percentage >= 50) return '4';
	if (percentage >= 40) return '3';
	if (percentage >= 30) return '2';
	if (percentage >= 20) return '1';
	return 'U';
}

export async function calculateApsFromQuizResults(
	userId: string,
	subject: string
): Promise<{ grade: string; confidence: number }> {
	const quizResults = await getQuizResultsByUser(userId);

	const subjectQuizzes = quizResults.filter((q: { quizId: string; percentage: string }) =>
		q.quizId.toLowerCase().includes(subject.toLowerCase())
	);

	if (subjectQuizzes.length === 0) {
		return { grade: '0', confidence: 0 };
	}

	const avgPercentage =
		subjectQuizzes.reduce(
			(sum: number, q: { percentage: string }) => sum + Number.parseFloat(q.percentage),
			0
		) / subjectQuizzes.length;

	const grade = percentageToGrade(avgPercentage);
	const confidence = Math.min(subjectQuizzes.length / 10, 1);

	return { grade, confidence };
}

export async function calculateApsFromPastPapers(
	_userId: string,
	_subject: string
): Promise<{ grade: string; confidence: number }> {
	return { grade: '0', confidence: 0 };
}

export async function getUnifiedApsScore(userId: string): Promise<{
	totalAps: number;
	subjectScores: Array<{
		subject: string;
		grade: string;
		points: number;
		lastUpdated: Date;
	}>;
}> {
	const subjectScores = await getUserApsScores(userId);
	const totalAps = await getUserTotalAps(userId);

	return {
		totalAps,
		subjectScores: subjectScores.map((s) => ({
			subject: s.subject,
			grade: s.currentGrade,
			points: s.apsPoints,
			lastUpdated: s.lastUpdatedAt,
		})),
	};
}

export async function syncApsAfterQuiz(
	userId: string,
	subject: string,
	percentage: number
): Promise<{ newGrade: string; totalAps: number; message: string }> {
	const grade = percentageToGrade(percentage);
	await upsertApsScore(userId, subject, grade, 'quiz', Math.round(percentage));

	const totalAps = await getUserTotalAps(userId);

	const gradeNames: Record<string, string> = {
		'7': 'Outstanding',
		'6': 'Excellent',
		'5': 'Very Good',
		'4': 'Good',
		'3': 'Satisfactory',
		'2': 'Elementary',
		'1': 'Not Achieved',
		'0': 'No data',
	};

	const message = `You've reached Level ${grade} (${gradeNames[grade] || 'Unknown'}) in ${subject}!`;

	return { newGrade: grade, totalAps, message };
}

export function getApsProgressMessage(
	currentAps: number,
	targetAps: number,
	universityTarget?: string,
	recentAchievement?: { subject: string; level: number }
): string {
	const gap = targetAps - currentAps;

	if (recentAchievement) {
		return `You just reached Level ${recentAchievement.level} in ${recentAchievement.subject}—your total APS is now ${currentAps}!`;
	}

	if (gap <= 0) {
		return `Amazing! You've reached your APS target of ${targetAps}! You're ready for ${universityTarget || 'university'}!`;
	}

	if (gap <= 5) {
		return `Almost there! Just ${gap} more points to reach your ${targetAps} APS goal for ${universityTarget || 'university'}.`;
	}

	return `You're making great progress! Current APS: ${currentAps}. Target: ${targetAps} for ${universityTarget || 'university'}.`;
}
