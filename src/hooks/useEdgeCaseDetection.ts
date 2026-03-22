'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
	type EdgeCaseResponse,
	type EdgeCaseType,
	edgeCaseService,
} from '@/services/edge-case-service';

export interface EdgeCaseDetectionState {
	isMonitoring: boolean;
	activeEdgeCases: Set<EdgeCaseType>;
	currentEdgeCase: EdgeCaseResponse | null;
	currentEdgeCaseType: EdgeCaseType | null;
	isModalOpen: boolean;
}

export interface UseEdgeCaseDetectionOptions {
	userId: string;
	sessionId?: string;
	enableAutoMonitoring?: boolean;
	checkIntervals?: {
		burnout?: number;
		rapidSuccess?: number;
		offlineConflict?: number;
	};
	onEdgeCaseDetected?: (type: EdgeCaseType, response: EdgeCaseResponse) => void;
}

interface QuizMetrics {
	score: number;
	totalQuestions: number;
	hintsUsed: number;
	correctAnswers: number;
	incorrectAnswers: number;
	consecutivePoorScores: number;
	startTime: number;
	questionTimes: number[];
	questionsPerSession: number[];
}

interface EngagementMetrics {
	sessionsThisWeek: number;
	avgSessionDuration: number;
	lastSessionTime: number;
	consecutivePoorScores: number;
	improvementTrend: number[];
}

const DEFAULT_CHECK_INTERVALS = {
	burnout: 60000,
	rapidSuccess: 30000,
	offlineConflict: 5000,
};

export function useEdgeCaseDetection(options: UseEdgeCaseDetectionOptions) {
	const {
		userId,
		sessionId,
		enableAutoMonitoring = true,
		checkIntervals = DEFAULT_CHECK_INTERVALS,
		onEdgeCaseDetected,
	} = options;

	const [state, setState] = useState<EdgeCaseDetectionState>({
		isMonitoring: false,
		activeEdgeCases: new Set(),
		currentEdgeCase: null,
		currentEdgeCaseType: null,
		isModalOpen: false,
	});

	const quizMetricsRef = useRef<QuizMetrics>({
		score: 0,
		totalQuestions: 0,
		hintsUsed: 0,
		correctAnswers: 0,
		incorrectAnswers: 0,
		consecutivePoorScores: 0,
		startTime: Date.now(),
		questionTimes: [],
		questionsPerSession: [],
	});

	const engagementMetricsRef = useRef<EngagementMetrics>({
		sessionsThisWeek: 0,
		avgSessionDuration: 0,
		lastSessionTime: Date.now(),
		consecutivePoorScores: 0,
		improvementTrend: [],
	});

	const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);
	const lastCheckRef = useRef<Record<string, number>>({});

	const showEdgeCase = useCallback(
		async (type: EdgeCaseType) => {
			const context = { userId, sessionId };
			let response: EdgeCaseResponse;

			switch (type) {
				case 'COMPLETE_FAILURE':
					response = await edgeCaseService.handleCompleteFailure(context);
					break;
				case 'HINT_OVERUSE':
					response = await edgeCaseService.handleHintOveruse(context);
					break;
				case 'RAPID_SUCCESS':
					response = await edgeCaseService.handleRapidSuccess(context);
					break;
				case 'BURNOUT_RISK':
					response = await edgeCaseService.handleBurnoutRisk(context);
					break;
				case 'EMPTY_QUESTION_BANK':
					response = await edgeCaseService.handleEmptyQuestionBank(context);
					break;
				case 'OFFLINE_CONFLICT':
					response = await edgeCaseService.handleOfflineConflict(context);
					break;
				case 'API_RATE_LIMIT':
					response = await edgeCaseService.handleApiRateLimit(context);
					break;
				case 'SESSION_TIMEOUT':
					response = await edgeCaseService.handleSessionTimeout(context);
					break;
				case 'TOXIC_COMPETITION':
					response = await edgeCaseService.handleToxicCompetition(context);
					break;
				case 'COMPARISON_ANXIETY':
					response = await edgeCaseService.handleComparisonAnxiety(context);
					break;
				case 'AI_CONTENT_ERROR':
					response = await edgeCaseService.handleAIContentError(context);
					break;
				case 'CURRICULUM_CHANGE':
					response = await edgeCaseService.handleCurriculumChange(context);
					break;
				case 'CONTRADICTORY_INFO':
					response = await edgeCaseService.handleContradictoryInfo(context);
					break;
				default:
					return;
			}

			if (response.showModal) {
				setState((prev) => ({
					...prev,
					currentEdgeCase: response,
					currentEdgeCaseType: type,
					isModalOpen: true,
					activeEdgeCases: new Set([...prev.activeEdgeCases, type]),
				}));

				onEdgeCaseDetected?.(type, response);
			}
		},
		[userId, sessionId, onEdgeCaseDetected]
	);

	const dismissEdgeCase = useCallback((type: EdgeCaseType) => {
		setState((prev) => {
			const newActive = new Set(prev.activeEdgeCases);
			newActive.delete(type);
			return {
				...prev,
				activeEdgeCases: newActive,
				isModalOpen: false,
				currentEdgeCase: null,
				currentEdgeCaseType: null,
			};
		});
	}, []);

	const closeModal = useCallback(() => {
		setState((prev) => ({
			...prev,
			isModalOpen: false,
		}));
	}, []);

	const handleAction = useCallback(
		(action: string, type: EdgeCaseType) => {
			console.log(`Action: ${action} for edge case: ${type}`);
			dismissEdgeCase(type);
		},
		[dismissEdgeCase]
	);

	const startMonitoring = useCallback(() => {
		if (state.isMonitoring) return;

		edgeCaseService.startAutoSave();
		setState((prev) => ({ ...prev, isMonitoring: true }));

		const burnoutInterval = setInterval(() => {
			if (Date.now() - (lastCheckRef.current.burnout || 0) > checkIntervals.burnout!) {
				lastCheckRef.current.burnout = Date.now();
				showEdgeCase('BURNOUT_RISK');
			}
		}, checkIntervals.burnout);

		const rapidSuccessInterval = setInterval(() => {
			if (Date.now() - (lastCheckRef.current.rapidSuccess || 0) > checkIntervals.rapidSuccess!) {
				lastCheckRef.current.rapidSuccess = Date.now();
				showEdgeCase('RAPID_SUCCESS');
			}
		}, checkIntervals.rapidSuccess);

		const offlineConflictInterval = setInterval(() => {
			if (
				Date.now() - (lastCheckRef.current.offlineConflict || 0) >
				checkIntervals.offlineConflict!
			) {
				lastCheckRef.current.offlineConflict = Date.now();
				if (typeof navigator !== 'undefined' && !navigator.onLine) {
					showEdgeCase('OFFLINE_CONFLICT');
				}
			}
		}, checkIntervals.offlineConflict);

		intervalsRef.current = [burnoutInterval, rapidSuccessInterval, offlineConflictInterval];
	}, [state.isMonitoring, checkIntervals, showEdgeCase]);

	const stopMonitoring = useCallback(() => {
		intervalsRef.current.forEach(clearInterval);
		intervalsRef.current = [];
		edgeCaseService.stopAutoSave();
		setState((prev) => ({ ...prev, isMonitoring: false }));
	}, []);

	const recordQuestionAnswer = useCallback(
		(isCorrect: boolean, usedHint = false) => {
			const metrics = quizMetricsRef.current;
			metrics.totalQuestions += 1;
			metrics.questionTimes.push(Date.now());

			if (isCorrect) {
				metrics.correctAnswers += 1;
				metrics.score = (metrics.correctAnswers / metrics.totalQuestions) * 100;
				metrics.consecutivePoorScores = 0;
			} else {
				metrics.incorrectAnswers += 1;
				metrics.consecutivePoorScores += 1;
			}

			if (usedHint) {
				metrics.hintsUsed += 1;
			}

			edgeCaseService.updateMetrics({
				totalQuestions: metrics.totalQuestions,
				correctAnswers: metrics.correctAnswers,
				hintsUsed: metrics.hintsUsed,
				questionsPerSession: [...metrics.questionsPerSession, metrics.score],
			});

			if (metrics.totalQuestions >= 5 && metrics.correctAnswers === 0) {
				showEdgeCase('COMPLETE_FAILURE');
			}

			const recentQuestions = Math.min(metrics.totalQuestions, 10);
			const recentHints = metrics.questionTimes.slice(-recentQuestions).length;
			if (recentHints / recentQuestions > 0.5 && metrics.totalQuestions >= 10) {
				showEdgeCase('HINT_OVERUSE');
			}
		},
		[showEdgeCase]
	);

	const recordHintUsage = useCallback(() => {
		const metrics = quizMetricsRef.current;
		metrics.hintsUsed += 1;
		edgeCaseService.updateMetrics({ hintsUsed: metrics.hintsUsed });
	}, []);

	const checkForApiRateLimit = useCallback(
		(error: unknown) => {
			if (
				error instanceof Error &&
				(error.message.includes('rate limit') || error.message.includes('429'))
			) {
				showEdgeCase('API_RATE_LIMIT');
			}
		},
		[showEdgeCase]
	);

	const checkForSessionTimeout = useCallback(() => {
		const savedSession = edgeCaseService.getSavedSession();
		if (savedSession) {
			const timeSinceLastSave = Date.now() - savedSession.timestamp;
			if (timeSinceLastSave > 30 * 60 * 1000) {
				showEdgeCase('SESSION_TIMEOUT');
			}
		}
	}, [showEdgeCase]);

	const checkForToxicCompetition = useCallback(
		(reportCount: number) => {
			if (reportCount >= 3) {
				showEdgeCase('TOXIC_COMPETITION');
			}
		},
		[showEdgeCase]
	);

	const checkForComparisonAnxiety = useCallback(
		(timeOnLeaderboard: number, relativeScore: number) => {
			if (timeOnLeaderboard > 300000 && relativeScore < 0.3) {
				showEdgeCase('COMPARISON_ANXIETY');
			}
		},
		[showEdgeCase]
	);

	const checkForAIContentError = useCallback(
		(confidence: number, _contentId?: string) => {
			if (confidence < 0.7) {
				showEdgeCase('AI_CONTENT_ERROR');
			}
		},
		[showEdgeCase]
	);

	const checkForCurriculumChange = useCallback(() => {
		showEdgeCase('CURRICULUM_CHANGE');
	}, [showEdgeCase]);

	const checkForContradictoryInfo = useCallback(
		(contradictions: number, _topic?: string) => {
			if (contradictions > 2) {
				showEdgeCase('CONTRADICTORY_INFO');
			}
		},
		[showEdgeCase]
	);

	const checkForEmptyQuestionBank = useCallback(
		(_topic: string, questionCount: number) => {
			if (questionCount === 0) {
				showEdgeCase('EMPTY_QUESTION_BANK');
			}
		},
		[showEdgeCase]
	);

	const getMetrics = useCallback(() => {
		return {
			quiz: { ...quizMetricsRef.current },
			engagement: { ...engagementMetricsRef.current },
			service: edgeCaseService.getMetrics(),
		};
	}, []);

	const resetQuizMetrics = useCallback(() => {
		quizMetricsRef.current = {
			score: 0,
			totalQuestions: 0,
			hintsUsed: 0,
			correctAnswers: 0,
			incorrectAnswers: 0,
			consecutivePoorScores: 0,
			startTime: Date.now(),
			questionTimes: [],
			questionsPerSession: [],
		};
	}, []);

	useEffect(() => {
		if (enableAutoMonitoring && userId) {
			startMonitoring();
		}

		return () => {
			stopMonitoring();
		};
	}, [enableAutoMonitoring, userId, startMonitoring, stopMonitoring]);

	useEffect(() => {
		const handleOnline = () => {
			dismissEdgeCase('OFFLINE_CONFLICT');
		};

		const handleOffline = () => {
			showEdgeCase('OFFLINE_CONFLICT');
		};

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, [dismissEdgeCase, showEdgeCase]);

	return {
		...state,
		showEdgeCase,
		dismissEdgeCase,
		closeModal,
		handleAction,
		startMonitoring,
		stopMonitoring,
		recordQuestionAnswer,
		recordHintUsage,
		checkForApiRateLimit,
		checkForSessionTimeout,
		checkForToxicCompetition,
		checkForComparisonAnxiety,
		checkForAIContentError,
		checkForCurriculumChange,
		checkForContradictoryInfo,
		checkForEmptyQuestionBank,
		getMetrics,
		resetQuizMetrics,
	};
}

export type UseEdgeCaseDetectionReturn = ReturnType<typeof useEdgeCaseDetection>;

export function useBurnoutDetection(_userId: string) {
	const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
	const [showWarning, setShowWarning] = useState(false);

	const checkBurnoutRisk = useCallback(() => {
		const metrics = edgeCaseService.getMetrics();
		const sessionsThisWeek = metrics.weeklySessions;
		const streakDays = metrics.streakDays;

		let risk: 'low' | 'medium' | 'high' = 'low';

		if (sessionsThisWeek < 2 && streakDays > 0) {
			risk = 'high';
		} else if (sessionsThisWeek < 4) {
			risk = 'medium';
		}

		setRiskLevel(risk);
		if (risk !== 'low') {
			setShowWarning(true);
		}
	}, []);

	const dismissWarning = useCallback(() => {
		setShowWarning(false);
	}, []);

	const acknowledgeRisk = useCallback(() => {
		setShowWarning(false);
	}, []);

	return {
		riskLevel,
		showWarning,
		checkBurnoutRisk,
		dismissWarning,
		acknowledgeRisk,
	};
}

export function useHintUsageTracking() {
	const [hintUsage, setHintUsage] = useState({
		total: 0,
		recent: 0,
		ratio: 0,
	});

	const trackHint = useCallback((questionIndex: number) => {
		setHintUsage((prev) => {
			const newTotal = prev.total + 1;
			const recent = Math.min(prev.recent + 1, 10);
			const newRatio = newTotal / Math.max(questionIndex + 1, 1);
			return {
				total: newTotal,
				recent,
				ratio: newRatio,
			};
		});
	}, []);

	const reset = useCallback(() => {
		setHintUsage({ total: 0, recent: 0, ratio: 0 });
	}, []);

	const isOverusing = hintUsage.recent >= 5 && hintUsage.ratio > 0.5;

	return {
		hintUsage,
		trackHint,
		reset,
		isOverusing,
	};
}
