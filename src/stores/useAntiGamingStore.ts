'use client';

import { create } from 'zustand';

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

export interface AntiGamingState {
	riskScore: number;
	riskLevel: 'low' | 'medium' | 'high' | 'critical';
	answerTimings: AnswerTiming[];
	hintsUsed: number;
	totalQuestions: number;
	suspiciousPatterns: SuspiciousPattern[];
	isAlertDismissed: boolean;
	wasSpeedConfirmed: boolean;
	hasReportedImprovement: boolean;
	networkIssueDetected: boolean;

	recordAnswerTiming: (timing: AnswerTiming) => void;
	incrementHints: () => void;
	resetHints: () => void;
	setTotalQuestions: (count: number) => void;
	analyzePatterns: () => SuspiciousPattern[];
	calculateRiskScore: () => { score: number; level: 'low' | 'medium' | 'high' | 'critical' };
	dismissAlert: (confirmed: boolean) => void;
	reportImprovement: () => void;
	flagNetworkIssue: () => void;
	reset: () => void;
}

const THRESHOLDS = {
	FAST_ANSWER: {
		easy: 2,
		medium: 3,
		hard: 5,
	},
	HINT_ABUSE_PER_10: 3,
	PERFECT_HARD_SCORE: 100,
	RISK_LEVELS: {
		low: 30,
		medium: 70,
		high: 100,
	},
	POINTS: {
		speed: 25,
		perfectScore: 30,
		hintAbuse: 20,
		uncertain: 10,
	},
} as const;

const initialState = {
	riskScore: 0,
	riskLevel: 'low' as const,
	answerTimings: [],
	hintsUsed: 0,
	totalQuestions: 0,
	suspiciousPatterns: [],
	isAlertDismissed: false,
	wasSpeedConfirmed: false,
	hasReportedImprovement: false,
	networkIssueDetected: false,
};

export const useAntiGamingStore = create<AntiGamingState>()((set, get) => ({
	...initialState,

	recordAnswerTiming: (timing: AnswerTiming) => {
		set((state) => ({
			answerTimings: [...state.answerTimings, timing],
		}));
	},

	incrementHints: () => {
		set((state) => ({ hintsUsed: state.hintsUsed + 1 }));
	},

	resetHints: () => {
		set({ hintsUsed: 0 });
	},

	setTotalQuestions: (count: number) => {
		set({ totalQuestions: count });
	},

	analyzePatterns: () => {
		const state = get();
		const patterns: SuspiciousPattern[] = [];

		const speedFlags = state.answerTimings.filter((timing) => {
			const threshold = THRESHOLDS.FAST_ANSWER[timing.difficulty];
			return timing.timeSpentSeconds < threshold && timing.timeSpentSeconds > 0;
		});

		if (speedFlags.length > 0) {
			const avgTime =
				speedFlags.reduce((sum, t) => sum + t.timeSpentSeconds, 0) / speedFlags.length;
			const severity =
				speedFlags.length >= state.totalQuestions * 0.5
					? 'high'
					: speedFlags.length >= state.totalQuestions * 0.25
						? 'medium'
						: 'low';

			patterns.push({
				type: 'speed',
				severity,
				points:
					THRESHOLDS.POINTS.speed * (severity === 'high' ? 2 : severity === 'medium' ? 1.5 : 1),
				description: `${speedFlags.length} answers completed suspiciously fast (avg ${avgTime.toFixed(1)}s)`,
				questionIds: speedFlags.map((t) => t.questionId),
			});
		}

		const changedAnswers = state.answerTimings.filter((t) => t.wasChanged);
		if (changedAnswers.length >= state.totalQuestions * 0.5 && changedAnswers.length > 3) {
			patterns.push({
				type: 'uncertain',
				severity: 'low',
				points: THRESHOLDS.POINTS.uncertain,
				description: `${changedAnswers.length} answers were changed during the quiz`,
				questionIds: changedAnswers.map((t) => t.questionId),
			});
		}

		const hardQuestions = state.answerTimings.filter((t) => t.difficulty === 'hard');
		if (hardQuestions.length >= 3) {
			const allHardCorrect = hardQuestions.every((t) => t.isCorrect);
			if (allHardCorrect) {
				const veryFastHard = hardQuestions.filter(
					(t) => t.timeSpentSeconds < THRESHOLDS.FAST_ANSWER.hard
				);
				const severity = veryFastHard.length >= hardQuestions.length * 0.7 ? 'high' : 'medium';

				patterns.push({
					type: 'score',
					severity,
					points: THRESHOLDS.POINTS.perfectScore * (severity === 'high' ? 1.5 : 1),
					description: `Perfect score on ${hardQuestions.length} hard questions`,
					questionIds: hardQuestions.map((t) => t.questionId),
				});
			}
		}

		const hintRate = state.hintsUsed / Math.max(state.totalQuestions, 1);
		if (hintRate > THRESHOLDS.HINT_ABUSE_PER_10 / 10) {
			const severity = hintRate > THRESHOLDS.HINT_ABUSE_PER_10 / 5 ? 'high' : 'medium';

			patterns.push({
				type: 'hints',
				severity,
				points: THRESHOLDS.POINTS.hintAbuse,
				description: `${state.hintsUsed} hints used for ${state.totalQuestions} questions (${(hintRate * 10).toFixed(1)} per 10)`,
			});
		}

		if (state.wasSpeedConfirmed) {
			const speedPattern = patterns.find((p) => p.type === 'speed');
			if (speedPattern) {
				speedPattern.points = Math.floor(speedPattern.points * 0.5);
			}
		}

		if (state.hasReportedImprovement) {
			const scorePattern = patterns.find((p) => p.type === 'score');
			if (scorePattern) {
				scorePattern.points = Math.floor(scorePattern.points * 0.5);
			}
		}

		if (state.networkIssueDetected) {
			patterns.forEach((p) => {
				p.points = Math.floor(p.points * 0.3);
			});
		}

		set({ suspiciousPatterns: patterns });
		return patterns;
	},

	calculateRiskScore: () => {
		const state = get();
		state.analyzePatterns();

		const currentPatterns = state.suspiciousPatterns;
		let totalPoints = currentPatterns.reduce((sum, p) => sum + p.points, 0);

		if (state.totalQuestions < 5) {
			totalPoints = Math.floor(totalPoints * 0.5);
		}

		const cappedScore = Math.min(totalPoints, 100);
		const level =
			cappedScore <= THRESHOLDS.RISK_LEVELS.low
				? 'low'
				: cappedScore <= THRESHOLDS.RISK_LEVELS.medium
					? 'medium'
					: cappedScore <= THRESHOLDS.RISK_LEVELS.high
						? 'high'
						: 'critical';

		set({ riskScore: cappedScore, riskLevel: level });
		return { score: cappedScore, level };
	},

	dismissAlert: (confirmed: boolean) => {
		set({ isAlertDismissed: true, wasSpeedConfirmed: confirmed });
	},

	reportImprovement: () => {
		set({ hasReportedImprovement: true });
	},

	flagNetworkIssue: () => {
		set({ networkIssueDetected: true });
	},

	reset: () => {
		set(initialState);
	},
}));

export function useAntiGaming() {
	const store = useAntiGamingStore();
	return {
		riskScore: store.riskScore,
		riskLevel: store.riskLevel,
		answerTimings: store.answerTimings,
		hintsUsed: store.hintsUsed,
		suspiciousPatterns: store.suspiciousPatterns,
		isAlertDismissed: store.isAlertDismissed,
		recordAnswerTiming: store.recordAnswerTiming,
		incrementHints: store.incrementHints,
		resetHints: store.resetHints,
		setTotalQuestions: store.setTotalQuestions,
		analyzePatterns: store.analyzePatterns,
		calculateRiskScore: store.calculateRiskScore,
		dismissAlert: store.dismissAlert,
		reportImprovement: store.reportImprovement,
		flagNetworkIssue: store.flagNetworkIssue,
		reset: store.reset,
	};
}
