import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export type EdgeCaseType =
	| 'COMPLETE_FAILURE'
	| 'HINT_OVERUSE'
	| 'RAPID_SUCCESS'
	| 'BURNOUT_RISK'
	| 'EMPTY_QUESTION_BANK'
	| 'OFFLINE_CONFLICT'
	| 'API_RATE_LIMIT'
	| 'SESSION_TIMEOUT'
	| 'TOXIC_COMPETITION'
	| 'COMPARISON_ANXIETY'
	| 'AI_CONTENT_ERROR'
	| 'CURRICULUM_CHANGE'
	| 'CONTRADICTORY_INFO';

export interface EdgeCaseEvent {
	id: string;
	userId: string;
	edgeCaseType: EdgeCaseType;
	severity: 'low' | 'medium' | 'high' | 'critical';
	metadata: Record<string, unknown>;
	triggeredAt: Date;
	resolvedAt?: Date;
	resolution?: string;
}

export interface EdgeCaseContext {
	userId: string;
	sessionId?: string;
	quizId?: string;
	questionId?: string;
	metadata?: Record<string, unknown>;
}

export interface EdgeCaseResponse {
	showModal: boolean;
	title: string;
	message: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
	actions: EdgeCaseAction[];
	options?: EdgeCaseOption[];
	enableChallengeMode?: boolean;
	suggestContent?: string;
}

export interface EdgeCaseAction {
	label: string;
	onClick: () => void;
	variant?: 'primary' | 'secondary' | 'destructive';
}

export interface EdgeCaseOption {
	label: string;
	value: string;
	description?: string;
	icon?: string;
}

const EDGE_CASE_STORAGE_KEY = 'matricmaster_edge_case_state';
const SESSION_SAVE_KEY = 'matricmaster_quiz_session';
const AUTOSAVE_INTERVAL = 30000;

interface LearnerMetrics {
	totalQuestions: number;
	correctAnswers: number;
	hintsUsed: number;
	sessionStartTime: number;
	questionsPerSession: number[];
	streakDays: number;
	weeklySessions: number;
	lastWeekSessions: number[];
}

interface SessionRecovery {
	quizId: string;
	currentQuestionIndex: number;
	answers: Map<string, string>;
	timestamp: number;
	userId: string;
}

class EdgeCaseService {
	private metrics: LearnerMetrics = {
		totalQuestions: 0,
		correctAnswers: 0,
		hintsUsed: 0,
		sessionStartTime: Date.now(),
		questionsPerSession: [],
		streakDays: 0,
		weeklySessions: 0,
		lastWeekSessions: [],
	};

	private eventQueue: EdgeCaseEvent[] = [];
	private autoSaveInterval: ReturnType<typeof setInterval> | null = null;

	async handleCompleteFailure(context: EdgeCaseContext): Promise<EdgeCaseResponse> {
		const score =
			this.metrics.totalQuestions > 0
				? (this.metrics.correctAnswers / this.metrics.totalQuestions) * 100
				: 0;

		if (score === 0 && this.metrics.totalQuestions >= 5) {
			await this.trackEdgeCase({
				...context,
				edgeCaseType: 'COMPLETE_FAILURE',
				severity: 'high',
				metadata: {
					totalQuestions: this.metrics.totalQuestions,
					correctAnswers: this.metrics.correctAnswers,
					score,
				},
			});

			return {
				showModal: true,
				title: "don't give up",
				message:
					"hey, struggling with these questions doesn't mean you're not capable. let's take a step back and build a stronger foundation together.",
				severity: 'high',
				actions: [
					{
						label: 'start easier questions',
						onClick: () => this.redirectToEasierContent(context),
						variant: 'primary',
					},
					{
						label: 'review the topic first',
						onClick: () => this.redirectToTopicReview(context),
						variant: 'secondary',
					},
					{
						label: 'try a different topic',
						onClick: () => this.suggestAlternativeTopic(context),
						variant: 'secondary',
					},
				],
				suggestContent: 'foundational concepts',
			};
		}

		return { showModal: false, title: '', message: '', severity: 'low', actions: [] };
	}

	async handleHintOveruse(context: EdgeCaseContext): Promise<EdgeCaseResponse> {
		const questionsAnswered = this.metrics.totalQuestions;
		const hintRatio =
			questionsAnswered > 0 ? this.metrics.hintsUsed / Math.max(questionsAnswered, 1) : 0;

		if (hintRatio > 0.5 && questionsAnswered >= 10) {
			await this.trackEdgeCase({
				...context,
				edgeCaseType: 'HINT_OVERUSE',
				severity: 'medium',
				metadata: {
					hintsUsed: this.metrics.hintsUsed,
					questionsAnswered,
					hintRatio,
				},
			});

			return {
				showModal: true,
				title: 'challenge yourself',
				message:
					"we've noticed you're relying heavily on hints. that's okay for learning, but have you tried a challenge mode with no hints?",
				severity: 'medium',
				actions: [
					{
						label: 'enable no-hints challenge',
						onClick: () => this.enableChallengeMode(context),
						variant: 'primary',
					},
					{
						label: 'keep using hints',
						onClick: () => this.dismissEdgeCase(context),
						variant: 'secondary',
					},
				],
				enableChallengeMode: true,
			};
		}

		return { showModal: false, title: '', message: '', severity: 'low', actions: [] };
	}

	async handleRapidSuccess(context: EdgeCaseContext): Promise<EdgeCaseResponse> {
		const recentScore = this.metrics.questionsPerSession.slice(-5);
		if (recentScore.length < 3) {
			return { showModal: false, title: '', message: '', severity: 'low', actions: [] };
		}

		const avgRecent = recentScore.reduce((a, b) => a + b, 0) / recentScore.length;
		const previousAvg =
			recentScore.slice(0, -1).reduce((a, b) => a + b, 0) / Math.max(recentScore.length - 1, 1);
		const improvement = avgRecent - previousAvg;

		if (improvement > 40 && previousAvg < 50) {
			await this.trackEdgeCase({
				...context,
				edgeCaseType: 'RAPID_SUCCESS',
				severity: 'low',
				metadata: {
					improvement,
					previousAvg,
					avgRecent,
				},
			});

			return {
				showModal: true,
				title: 'impressive progress!',
				message:
					"wow, that's a big jump! we're happy for your success. just to be sure everything's on the up and up, keep doing what you're doing - you're crushing it!",
				severity: 'low',
				actions: [
					{
						label: 'keep going',
						onClick: () => this.dismissEdgeCase(context),
						variant: 'primary',
					},
					{
						label: 'review my answers',
						onClick: () => this.reviewAnswers(context),
						variant: 'secondary',
					},
				],
			};
		}

		return { showModal: false, title: '', message: '', severity: 'low', actions: [] };
	}

	async handleBurnoutRisk(context: EdgeCaseContext): Promise<EdgeCaseResponse> {
		const sessionsThisWeek = this.getSessionsThisWeek();
		const timeSpentTrend = this.getTimeSpentTrend();

		if (sessionsThisWeek < 3 && timeSpentTrend < 0.7) {
			await this.trackEdgeCase({
				...context,
				edgeCaseType: 'BURNOUT_RISK',
				severity: 'medium',
				metadata: {
					sessionsThisWeek,
					timeSpentTrend,
					streakDays: this.metrics.streakDays,
				},
			});

			return {
				showModal: true,
				title: 'take a break',
				message:
					"we've noticed your study sessions have been getting shorter. that's completely normal - rest is part of learning. try some lighter content or take a short break.",
				severity: 'medium',
				actions: [
					{
						label: 'try fun flashcards',
						onClick: () => this.redirectToLighterContent('flashcards'),
						variant: 'primary',
					},
					{
						label: 'quick 5-min drill',
						onClick: () => this.redirectToLighterContent('quick-drill'),
						variant: 'secondary',
					},
					{
						label: 'take a break',
						onClick: () => this.dismissEdgeCase(context),
						variant: 'secondary',
					},
				],
			};
		}

		return { showModal: false, title: '', message: '', severity: 'low', actions: [] };
	}

	async handleEmptyQuestionBank(context: EdgeCaseContext): Promise<EdgeCaseResponse> {
		await this.trackEdgeCase({
			...context,
			edgeCaseType: 'EMPTY_QUESTION_BANK',
			severity: 'high',
			metadata: {
				topic: context.metadata?.topic,
				subject: context.metadata?.subject,
			},
		});

		return {
			showModal: true,
			title: 'new topic coming',
			message:
				"we're working on adding more questions for this topic. in the meantime, try generating some questions with ai or explore related topics.",
			severity: 'high',
			actions: [
				{
					label: 'generate questions with ai',
					onClick: () => this.triggerProceduralGeneration(context),
					variant: 'primary',
				},
				{
					label: 'explore related topics',
					onClick: () => this.showRelatedTopics(context),
					variant: 'secondary',
				},
				{
					label: 'unlock manually',
					onClick: () => this.manualUnlock(context),
					variant: 'secondary',
				},
			],
		};
	}

	async handleOfflineConflict(context: EdgeCaseContext): Promise<EdgeCaseResponse> {
		const localData = this.getLocalData();
		const serverData = await this.fetchServerData(context);

		if (localData && serverData && this.hasConflict(localData, serverData)) {
			await this.trackEdgeCase({
				...context,
				edgeCaseType: 'OFFLINE_CONFLICT',
				severity: 'medium',
				metadata: {
					localTimestamp: localData.timestamp,
					serverTimestamp: serverData.timestamp,
				},
			});

			return {
				showModal: true,
				title: 'sync conflict detected',
				message:
					'we found differences between your offline progress and the server. which version would you like to keep?',
				severity: 'medium',
				actions: [
					{
						label: 'keep local changes',
						onClick: () => this.resolveConflict('local', context),
						variant: 'primary',
					},
					{
						label: 'use server version',
						onClick: () => this.resolveConflict('server', context),
						variant: 'secondary',
					},
					{
						label: 'merge both',
						onClick: () => this.resolveConflict('merge', context),
						variant: 'secondary',
					},
				],
			};
		}

		return { showModal: false, title: '', message: '', severity: 'low', actions: [] };
	}

	async handleApiRateLimit(context: EdgeCaseContext): Promise<EdgeCaseResponse> {
		await this.trackEdgeCase({
			...context,
			edgeCaseType: 'API_RATE_LIMIT',
			severity: 'medium',
			metadata: {
				timestamp: Date.now(),
				fallbackUsed: false,
			},
		});

		return {
			showModal: true,
			title: 'ai is taking a breather',
			message:
				"our ai tutor is temporarily unavailable due to high demand. we've queued your request and will notify you when it's ready. try webllm mode for instant responses.",
			severity: 'medium',
			actions: [
				{
					label: 'use webllm mode',
					onClick: () => this.enableWebLLMMode(),
					variant: 'primary',
				},
				{
					label: 'join the queue',
					onClick: () => this.joinQueue(context),
					variant: 'secondary',
				},
				{
					label: 'try again later',
					onClick: () => this.dismissEdgeCase(context),
					variant: 'secondary',
				},
			],
		};
	}

	async handleSessionTimeout(_context: EdgeCaseContext): Promise<EdgeCaseResponse> {
		const savedSession = this.getSavedSession();

		if (savedSession && this.isSessionRecoverable(savedSession)) {
			return {
				showModal: true,
				title: 'welcome back',
				message: `we saved your progress. you were on question ${savedSession.currentQuestionIndex + 1}. want to continue where you left off?`,
				severity: 'low',
				actions: [
					{
						label: 'continue session',
						onClick: () => this.recoverSession(savedSession),
						variant: 'primary',
					},
					{
						label: 'start fresh',
						onClick: () => this.clearSession(),
						variant: 'secondary',
					},
				],
			};
		}

		return { showModal: false, title: '', message: '', severity: 'low', actions: [] };
	}

	async handleToxicCompetition(context: EdgeCaseContext): Promise<EdgeCaseResponse> {
		const reports = await this.getReportCount(context.userId);

		if (reports >= 3) {
			await this.trackEdgeCase({
				...context,
				edgeCaseType: 'TOXIC_COMPETITION',
				severity: 'high',
				metadata: { reports },
			});

			return {
				showModal: true,
				title: 'community guidelines',
				message:
					"we've noticed some concerning behavior on the leaderboard. let's keep things supportive and focused on personal growth rather than comparison.",
				severity: 'high',
				actions: [
					{
						label: 'hide leaderboard',
						onClick: () => this.optOutLeaderboard(context),
						variant: 'primary',
					},
					{
						label: 'go anonymous mode',
						onClick: () => this.enableAnonymousMode(context),
						variant: 'secondary',
					},
					{
						label: 'i understand',
						onClick: () => this.dismissEdgeCase(context),
						variant: 'secondary',
					},
				],
			};
		}

		return { showModal: false, title: '', message: '', severity: 'low', actions: [] };
	}

	async handleComparisonAnxiety(context: EdgeCaseContext): Promise<EdgeCaseResponse> {
		const timeOnLeaderboard = this.getTimeOnLeaderboard();
		const scoreComparison = this.getScoreComparison();

		if (timeOnLeaderboard > 300000 && scoreComparison < 0.3) {
			await this.trackEdgeCase({
				...context,
				edgeCaseType: 'COMPARISON_ANXIETY',
				severity: 'medium',
				metadata: {
					timeOnLeaderboard,
					scoreComparison,
				},
			});

			return {
				showModal: true,
				title: 'your journey matters',
				message:
					"we see you've been comparing yourself to others. remember, everyone learns at their own pace. let's focus on your personal progress instead.",
				severity: 'medium',
				actions: [
					{
						label: 'show my progress',
						onClick: () => this.showPersonalProgress(context),
						variant: 'primary',
					},
					{
						label: 'hide leaderboard',
						onClick: () => this.hideLeaderboard(context),
						variant: 'secondary',
					},
					{
						label: 'relative ranking only',
						onClick: () => this.enableRelativeRanking(context),
						variant: 'secondary',
					},
				],
			};
		}

		return { showModal: false, title: '', message: '', severity: 'low', actions: [] };
	}

	async handleAIContentError(context: EdgeCaseContext): Promise<EdgeCaseResponse> {
		const confidence = (context.metadata?.confidence as number) || 0.5;

		if (confidence < 0.7) {
			await this.trackEdgeCase({
				...context,
				edgeCaseType: 'AI_CONTENT_ERROR',
				severity: 'medium',
				metadata: {
					confidence,
					contentType: context.metadata?.contentType,
				},
			});

			return {
				showModal: false,
				title: '',
				message: '',
				severity: 'low',
				actions: [],
			};
		}

		return { showModal: false, title: '', message: '', severity: 'low', actions: [] };
	}

	async handleCurriculumChange(context: EdgeCaseContext): Promise<EdgeCaseResponse> {
		const lastCheck = this.getCurriculumCheckDate();
		const now = Date.now();

		if (lastCheck && now - lastCheck > 7 * 24 * 60 * 60 * 1000) {
			await this.trackEdgeCase({
				...context,
				edgeCaseType: 'CURRICULUM_CHANGE',
				severity: 'low',
				metadata: {
					lastCheck,
					daysSinceCheck: Math.floor((now - lastCheck) / (24 * 60 * 60 * 1000)),
				},
			});

			return {
				showModal: true,
				title: 'curriculum update available',
				message:
					"the nsc curriculum may have been updated. review your content to ensure you're studying the latest requirements.",
				severity: 'low',
				actions: [
					{
						label: 'refresh content',
						onClick: () => this.refreshCurriculum(context),
						variant: 'primary',
					},
					{
						label: 'remind me later',
						onClick: () => this.dismissEdgeCase(context),
						variant: 'secondary',
					},
				],
			};
		}

		return { showModal: false, title: '', message: '', severity: 'low', actions: [] };
	}

	async handleContradictoryInfo(context: EdgeCaseContext): Promise<EdgeCaseResponse> {
		const contradictions = (context.metadata?.contradictions as number) || 0;

		if (contradictions > 2) {
			await this.trackEdgeCase({
				...context,
				edgeCaseType: 'CONTRADICTORY_INFO',
				severity: 'high',
				metadata: {
					contradictions,
					sources: context.metadata?.sources,
				},
			});

			return {
				showModal: true,
				title: 'we noticed a discrepancy',
				message:
					"we found some conflicting information in the study materials. we'll flag this for review. for now, the official nsc textbook is the most reliable source.",
				severity: 'high',
				actions: [
					{
						label: 'use official source',
						onClick: () => this.showOfficialSource(context),
						variant: 'primary',
					},
					{
						label: 'report error',
						onClick: () => this.reportError(context),
						variant: 'secondary',
					},
					{
						label: 'dismiss',
						onClick: () => this.dismissEdgeCase(context),
						variant: 'secondary',
					},
				],
				options: [
					{
						label: 'official nsc textbook',
						value: 'official',
						description: 'most reliable source for exams',
						icon: 'book',
					},
					{
						label: 'alternative explanation',
						value: 'alternative',
						description: 'different perspective on the topic',
						icon: 'lightbulb',
					},
				],
			};
		}

		return { showModal: false, title: '', message: '', severity: 'low', actions: [] };
	}

	private async trackEdgeCase(
		context: EdgeCaseContext & {
			edgeCaseType: EdgeCaseType;
			severity: 'low' | 'medium' | 'high' | 'critical';
			metadata?: Record<string, unknown>;
		}
	): Promise<void> {
		const event: EdgeCaseEvent = {
			id: crypto.randomUUID(),
			userId: context.userId,
			edgeCaseType: context.edgeCaseType,
			severity: context.severity,
			metadata: context.metadata || {},
			triggeredAt: new Date(),
		};

		this.eventQueue.push(event);

		try {
			await apiClient.post(API_ENDPOINTS.edgeCaseEvents, {
				...event,
				triggeredAt: event.triggeredAt.toISOString(),
			});
		} catch (error) {
			console.error('Failed to track edge case event:', error);
			this.saveEventLocally(event);
		}
	}

	private saveEventLocally(event: EdgeCaseEvent): void {
		try {
			const stored = localStorage.getItem(EDGE_CASE_STORAGE_KEY);
			const events = stored ? JSON.parse(stored) : [];
			events.push(event);
			localStorage.setItem(EDGE_CASE_STORAGE_KEY, JSON.stringify(events));
		} catch (error) {
			console.error('Failed to save edge case event locally:', error);
		}
	}

	private saveSession(): void {
		const session: Partial<SessionRecovery> = {
			quizId: this.metrics.sessionStartTime.toString(),
			timestamp: Date.now(),
		};
		try {
			localStorage.setItem(SESSION_SAVE_KEY, JSON.stringify(session));
		} catch (error) {
			console.error('Failed to save session:', error);
		}
	}

	getSavedSession(): SessionRecovery | null {
		try {
			const stored = localStorage.getItem(SESSION_SAVE_KEY);
			return stored ? JSON.parse(stored) : null;
		} catch {
			return null;
		}
	}

	private isSessionRecoverable(session: SessionRecovery): boolean {
		const maxAge = 24 * 60 * 60 * 1000;
		return Date.now() - session.timestamp < maxAge;
	}

	startAutoSave(): void {
		if (this.autoSaveInterval) return;

		this.autoSaveInterval = setInterval(() => {
			this.saveSession();
		}, AUTOSAVE_INTERVAL);
	}

	stopAutoSave(): void {
		if (this.autoSaveInterval) {
			clearInterval(this.autoSaveInterval);
			this.autoSaveInterval = null;
		}
	}

	updateMetrics(update: Partial<LearnerMetrics>): void {
		this.metrics = { ...this.metrics, ...update };
	}

	getMetrics(): LearnerMetrics {
		return { ...this.metrics };
	}

	private getSessionsThisWeek(): number {
		return this.metrics.lastWeekSessions.reduce((a, b) => a + b, 0);
	}

	private getTimeSpentTrend(): number {
		if (this.metrics.questionsPerSession.length < 2) return 1;
		const recent = this.metrics.questionsPerSession.slice(-3);
		const older = this.metrics.questionsPerSession.slice(-6, -3);
		if (older.length === 0) return 1;
		return (
			recent.reduce((a, b) => a + b, 0) /
			recent.length /
			(older.reduce((a, b) => a + b, 0) / older.length)
		);
	}

	private getLocalData(): { timestamp: number } | null {
		try {
			const stored = localStorage.getItem('offline_data');
			return stored ? JSON.parse(stored) : null;
		} catch {
			return null;
		}
	}

	private async fetchServerData(context: EdgeCaseContext): Promise<{ timestamp: number } | null> {
		try {
			const response = await apiClient.get<{ timestamp: number }>(
				`${API_ENDPOINTS.userProgress}/${context.userId}`
			);
			return response;
		} catch {
			return null;
		}
	}

	private hasConflict(local: unknown, server: unknown): boolean {
		return JSON.stringify(local) !== JSON.stringify(server);
	}

	private getReportCount(_userId: string): number {
		return 0;
	}

	private getTimeOnLeaderboard(): number {
		const start = sessionStorage.getItem('leaderboard_start');
		return start ? Date.now() - Number.parseInt(start, 10) : 0;
	}

	private getScoreComparison(): number {
		return 0.5;
	}

	private getCurriculumCheckDate(): number | null {
		try {
			const stored = localStorage.getItem('curriculum_check');
			return stored ? Number.parseInt(stored, 10) : null;
		} catch {
			return null;
		}
	}

	private redirectToEasierContent(context: EdgeCaseContext): void {
		console.log('Redirecting to easier content:', context);
	}

	private redirectToTopicReview(context: EdgeCaseContext): void {
		console.log('Redirecting to topic review:', context);
	}

	private suggestAlternativeTopic(context: EdgeCaseContext): void {
		console.log('Suggesting alternative topic:', context);
	}

	private enableChallengeMode(context: EdgeCaseContext): void {
		console.log('Enabling challenge mode:', context);
	}

	private dismissEdgeCase(context: EdgeCaseContext): void {
		console.log('Dismissing edge case:', context);
	}

	private reviewAnswers(context: EdgeCaseContext): void {
		console.log('Reviewing answers:', context);
	}

	private redirectToLighterContent(type: string): void {
		console.log('Redirecting to lighter content:', type);
	}

	private triggerProceduralGeneration(context: EdgeCaseContext): void {
		console.log('Triggering procedural generation:', context);
	}

	private showRelatedTopics(context: EdgeCaseContext): void {
		console.log('Showing related topics:', context);
	}

	private manualUnlock(context: EdgeCaseContext): void {
		console.log('Manual unlock:', context);
	}

	private resolveConflict(strategy: 'local' | 'server' | 'merge', context: EdgeCaseContext): void {
		console.log('Resolving conflict with strategy:', strategy, context);
	}

	private enableWebLLMMode(): void {
		console.log('Enabling WebLLM mode');
	}

	private joinQueue(context: EdgeCaseContext): void {
		console.log('Joining queue:', context);
	}

	private optOutLeaderboard(context: EdgeCaseContext): void {
		console.log('Opting out of leaderboard:', context);
	}

	private enableAnonymousMode(context: EdgeCaseContext): void {
		console.log('Enabling anonymous mode:', context);
	}

	private showPersonalProgress(context: EdgeCaseContext): void {
		console.log('Showing personal progress:', context);
	}

	private hideLeaderboard(context: EdgeCaseContext): void {
		console.log('Hiding leaderboard:', context);
	}

	private enableRelativeRanking(context: EdgeCaseContext): void {
		console.log('Enabling relative ranking:', context);
	}

	private refreshCurriculum(context: EdgeCaseContext): void {
		console.log('Refreshing curriculum:', context);
		localStorage.setItem('curriculum_check', Date.now().toString());
	}

	private showOfficialSource(context: EdgeCaseContext): void {
		console.log('Showing official source:', context);
	}

	private reportError(context: EdgeCaseContext): void {
		console.log('Reporting error:', context);
	}

	private recoverSession(session: SessionRecovery): void {
		console.log('Recovering session:', session);
		localStorage.removeItem(SESSION_SAVE_KEY);
	}

	private clearSession(): void {
		localStorage.removeItem(SESSION_SAVE_KEY);
	}
}

export const edgeCaseService = new EdgeCaseService();
