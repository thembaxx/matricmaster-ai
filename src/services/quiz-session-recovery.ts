export interface QuizSessionState {
	quizId: string;
	userId: string;
	currentQuestionIndex: number;
	totalQuestions: number;
	answers: Record<
		string,
		{
			selectedOption: string | null;
			isCorrect: boolean | null;
			timeSpent: number;
		}
	>;
	timeRemaining: number;
	startedAt: string;
	lastSavedAt: string;
	subject: string;
	topic?: string;
	difficulty: string;
}

export interface SessionRecoveryResult {
	canRecover: boolean;
	session?: QuizSessionState;
	reason?: string;
}

const SESSION_STORAGE_KEY = 'matricmaster_quiz_session';
const MAX_SESSION_AGE_HOURS = 24;

export function saveQuizSession(session: QuizSessionState): boolean {
	try {
		const sessionData = {
			...session,
			lastSavedAt: new Date().toISOString(),
		};
		localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
		return true;
	} catch (error) {
		console.error('Failed to save quiz session:', error);
		return false;
	}
}

export function getSavedQuizSession(): QuizSessionState | null {
	try {
		const stored = localStorage.getItem(SESSION_STORAGE_KEY);
		if (!stored) return null;

		const session = JSON.parse(stored) as QuizSessionState;
		const sessionAge = Date.now() - new Date(session.lastSavedAt).getTime();
		const maxAge = MAX_SESSION_AGE_HOURS * 60 * 60 * 1000;

		if (sessionAge > maxAge) {
			clearQuizSession();
			return null;
		}

		return session;
	} catch (error) {
		console.error('Failed to retrieve quiz session:', error);
		return null;
	}
}

export function checkSessionRecoverable(quizId?: string): SessionRecoveryResult {
	const session = getSavedQuizSession();

	if (!session) {
		return {
			canRecover: false,
			reason: 'No saved session found',
		};
	}

	if (quizId && session.quizId !== quizId) {
		return {
			canRecover: false,
			reason: 'Saved session is for a different quiz',
		};
	}

	const timeSinceLastSave = Date.now() - new Date(session.lastSavedAt).getTime();
	const maxAllowedGap = 30 * 60 * 1000;

	if (timeSinceLastSave > maxAllowedGap) {
		return {
			canRecover: false,
			reason: 'Session too old to recover',
		};
	}

	const progressPercent = (session.currentQuestionIndex / session.totalQuestions) * 100;

	return {
		canRecover: true,
		session: session,
		reason: `Found saved progress at question ${session.currentQuestionIndex + 1} of ${session.totalQuestions} (${Math.round(progressPercent)}%)`,
	};
}

export function clearQuizSession(): void {
	try {
		localStorage.removeItem(SESSION_STORAGE_KEY);
	} catch (error) {
		console.error('Failed to clear quiz session:', error);
	}
}

export function getQuizProgressSummary(): {
	hasActiveSession: boolean;
	progress: number;
	questionNumber: number;
	totalQuestions: number;
	timeRemaining: number;
	subject: string;
} | null {
	const session = getSavedQuizSession();

	if (!session) {
		return null;
	}

	const answeredCount = Object.keys(session.answers).filter(
		(key) => session.answers[key]?.isCorrect !== null
	).length;

	return {
		hasActiveSession: true,
		progress: (answeredCount / session.totalQuestions) * 100,
		questionNumber: session.currentQuestionIndex + 1,
		totalQuestions: session.totalQuestions,
		timeRemaining: session.timeRemaining,
		subject: session.subject,
	};
}

export function updateSessionAnswer(
	questionId: string,
	selectedOption: string | null,
	isCorrect: boolean | null,
	timeSpent: number
): boolean {
	const session = getSavedQuizSession();

	if (!session) {
		return false;
	}

	session.answers[questionId] = {
		selectedOption,
		isCorrect,
		timeSpent,
	};

	return saveQuizSession(session);
}

export function advanceSessionQuestion(nextIndex: number, timeRemaining: number): boolean {
	const session = getSavedQuizSession();

	if (!session) {
		return false;
	}

	session.currentQuestionIndex = nextIndex;
	session.timeRemaining = timeRemaining;

	return saveQuizSession(session);
}
