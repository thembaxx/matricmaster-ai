'use client';

export interface AnswerTiming {
	questionId: string;
	startTime: number;
	answerTime: number;
	timeSpentSeconds: number;
	difficulty: 'easy' | 'medium' | 'hard';
	isCorrect: boolean;
	wasChanged: boolean;
}

export interface SuspiciousPattern {
	type: 'speed' | 'score' | 'hints' | 'uncertain';
	severity: 'low' | 'medium' | 'high';
	points: number;
	description: string;
	questionIds?: string[];
}

export interface AntiGamingAnalysis {
	riskScore: number;
	riskLevel: 'low' | 'medium' | 'high' | 'critical';
	patterns: SuspiciousPattern[];
	totalQuestions: number;
	fastAnswers: number;
	hintsUsed: number;
	perfectHardScore: boolean;
	avgTimePerQuestion: number;
}

export interface AntiGamingResult {
	xpMultiplier: number;
	isVerified: boolean;
	shouldReduceXP: boolean;
	shouldBlockXP: boolean;
	reason: string;
}

const THRESHOLDS = {
	FAST_ANSWER: {
		easy: 2,
		medium: 3,
		hard: 5,
	},
	HINT_ABUSE_PER_10: 3,
	RISK_LEVELS: {
		low: 30,
		medium: 70,
		high: 100,
	},
} as const;

export function analyzeAntiGaming(params: {
	answerTimings: AnswerTiming[];
	hintsUsed: number;
	totalQuestions: number;
	wasSpeedConfirmed?: boolean;
	hasReportedImprovement?: boolean;
	networkIssueDetected?: boolean;
}): AntiGamingAnalysis {
	const {
		answerTimings,
		hintsUsed,
		totalQuestions,
		wasSpeedConfirmed,
		hasReportedImprovement,
		networkIssueDetected,
	} = params;

	const patterns: SuspiciousPattern[] = [];
	let riskScore = 0;

	const fastAnswers = answerTimings.filter((timing) => {
		const threshold = THRESHOLDS.FAST_ANSWER[timing.difficulty];
		return timing.timeSpentSeconds < threshold && timing.timeSpentSeconds > 0;
	});

	if (fastAnswers.length > 0) {
		const fastRate = fastAnswers.length / Math.max(totalQuestions, 1);
		let severity: 'low' | 'medium' | 'high' = 'low';
		let points = 0;

		if (fastRate >= 0.7) {
			severity = 'high';
			points = 40;
		} else if (fastRate >= 0.4) {
			severity = 'medium';
			points = 25;
		} else if (fastRate >= 0.2) {
			severity = 'low';
			points = 15;
		}

		if (wasSpeedConfirmed) {
			points = Math.floor(points * 0.5);
		}

		if (networkIssueDetected) {
			points = Math.floor(points * 0.3);
		}

		riskScore += points;
		patterns.push({
			type: 'speed',
			severity,
			points,
			description: `${fastAnswers.length}/${totalQuestions} answers completed suspiciously fast`,
			questionIds: fastAnswers.map((t) => t.questionId),
		});
	}

	const changedAnswers = answerTimings.filter((t) => t.wasChanged);
	if (changedAnswers.length >= totalQuestions * 0.5 && changedAnswers.length > 3) {
		riskScore += 10;
		patterns.push({
			type: 'uncertain',
			severity: 'low',
			points: 10,
			description: `${changedAnswers.length} answers were changed`,
			questionIds: changedAnswers.map((t) => t.questionId),
		});
	}

	const hardQuestions = answerTimings.filter((t) => t.difficulty === 'hard');
	const perfectHardScore = hardQuestions.length >= 3 && hardQuestions.every((t) => t.isCorrect);

	if (perfectHardScore) {
		const veryFastHard = hardQuestions.filter(
			(t) => t.timeSpentSeconds < THRESHOLDS.FAST_ANSWER.hard
		);
		let severity: 'low' | 'medium' | 'high' = 'medium';
		let points = 25;

		if (veryFastHard.length >= hardQuestions.length * 0.7) {
			severity = 'high';
			points = 40;
		}

		if (hasReportedImprovement) {
			points = Math.floor(points * 0.5);
		}

		riskScore += points;
		patterns.push({
			type: 'score',
			severity,
			points,
			description: `Perfect score on ${hardQuestions.length} hard questions`,
			questionIds: hardQuestions.map((t) => t.questionId),
		});
	}

	const hintRate = hintsUsed / Math.max(totalQuestions, 1);
	if (hintRate > THRESHOLDS.HINT_ABUSE_PER_10 / 10) {
		let severity: 'low' | 'medium' | 'high' = 'medium';
		let points = 15;

		if (hintRate > THRESHOLDS.HINT_ABUSE_PER_10 / 5) {
			severity = 'high';
			points = 25;
		} else if (hintRate > THRESHOLDS.HINT_ABUSE_PER_10 / 7) {
			severity = 'medium';
			points = 15;
		} else {
			severity = 'low';
			points = 10;
		}

		riskScore += points;
		patterns.push({
			type: 'hints',
			severity,
			points,
			description: `${hintsUsed} hints for ${totalQuestions} questions (${(hintRate * 10).toFixed(1)} per 10)`,
		});
	}

	if (totalQuestions < 5) {
		riskScore = Math.floor(riskScore * 0.5);
	}

	const cappedScore = Math.min(riskScore, 100);
	const riskLevel =
		cappedScore <= THRESHOLDS.RISK_LEVELS.low
			? 'low'
			: cappedScore <= THRESHOLDS.RISK_LEVELS.medium
				? 'medium'
				: cappedScore <= THRESHOLDS.RISK_LEVELS.high
					? 'high'
					: 'critical';

	const avgTimePerQuestion =
		answerTimings.length > 0
			? answerTimings.reduce((sum, t) => sum + t.timeSpentSeconds, 0) / answerTimings.length
			: 0;

	return {
		riskScore: cappedScore,
		riskLevel,
		patterns,
		totalQuestions,
		fastAnswers: fastAnswers.length,
		hintsUsed,
		perfectHardScore,
		avgTimePerQuestion,
	};
}

export function calculateAntiGamingXP(params: {
	analysis: AntiGamingAnalysis;
	baseXP: number;
}): AntiGamingResult {
	const { analysis } = params;

	if (analysis.riskLevel === 'critical') {
		return {
			xpMultiplier: 0,
			isVerified: false,
			shouldReduceXP: true,
			shouldBlockXP: true,
			reason: 'Critical anti-gaming risk detected - XP blocked',
		};
	}

	if (analysis.riskLevel === 'high') {
		return {
			xpMultiplier: 0.5,
			isVerified: false,
			shouldReduceXP: true,
			shouldBlockXP: false,
			reason: 'High anti-gaming risk - XP reduced by 50%',
		};
	}

	if (analysis.riskLevel === 'medium') {
		const hasSpeedOnly = analysis.patterns.length === 1 && analysis.patterns[0].type === 'speed';

		if (hasSpeedOnly) {
			return {
				xpMultiplier: 0.75,
				isVerified: false,
				shouldReduceXP: true,
				shouldBlockXP: false,
				reason: 'Speed anomaly detected - XP reduced by 25%',
			};
		}

		return {
			xpMultiplier: 0.8,
			isVerified: false,
			shouldReduceXP: true,
			shouldBlockXP: false,
			reason: 'Medium risk detected - XP reduced by 20%',
		};
	}

	return {
		xpMultiplier: 1,
		isVerified: true,
		shouldReduceXP: false,
		shouldBlockXP: false,
		reason: 'No suspicious patterns detected',
	};
}

export function getRiskLevelColor(level: AntiGamingAnalysis['riskLevel']): string {
	switch (level) {
		case 'low':
			return 'text-green-500';
		case 'medium':
			return 'text-yellow-500';
		case 'high':
			return 'text-orange-500';
		case 'critical':
			return 'text-red-500';
	}
}

export function getRiskLevelBgColor(level: AntiGamingAnalysis['riskLevel']): string {
	switch (level) {
		case 'low':
			return 'bg-green-500/10';
		case 'medium':
			return 'bg-yellow-500/10';
		case 'high':
			return 'bg-orange-500/10';
		case 'critical':
			return 'bg-red-500/10';
	}
}

export function formatRiskScore(score: number): string {
	return `${score}/100`;
}
