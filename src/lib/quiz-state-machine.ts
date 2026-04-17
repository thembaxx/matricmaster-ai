export type QuizState = 'IDLE' | 'STARTED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'REVIEWED';

export type QuizAction =
	| 'START'
	| 'NEXT_QUESTION'
	| 'PREV_QUESTION'
	| 'ANSWER'
	| 'PAUSE'
	| 'RESUME'
	| 'COMPLETE'
	| 'TIMEOUT'
	| 'REVIEW'
	| 'NEW_QUIZ'
	| 'ABANDON';

const transitions: Record<QuizState, Partial<Record<QuizAction, QuizState>>> = {
	IDLE: {
		START: 'STARTED',
	},
	STARTED: {
		NEXT_QUESTION: 'IN_PROGRESS',
		ABANDON: 'IDLE',
	},
	IN_PROGRESS: {
		ANSWER: 'IN_PROGRESS',
		NEXT_QUESTION: 'IN_PROGRESS',
		PREV_QUESTION: 'IN_PROGRESS',
		PAUSE: 'PAUSED',
		COMPLETE: 'COMPLETED',
		TIMEOUT: 'COMPLETED',
		ABANDON: 'IDLE',
	},
	PAUSED: {
		RESUME: 'IN_PROGRESS',
		ABANDON: 'IDLE',
	},
	COMPLETED: {
		REVIEW: 'REVIEWED',
		NEW_QUIZ: 'IDLE',
	},
	REVIEWED: {
		NEW_QUIZ: 'IDLE',
	},
};

export function getNextQuizState(currentState: QuizState, action: QuizAction): QuizState {
	return transitions[currentState]?.[action] || currentState;
}
