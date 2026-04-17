import type { QuizAction, QuizState } from '@/types/quiz';

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
	switch (action.type) {
		case 'SET_QUESTION_INDEX':
			return {
				...state,
				currentQuestionIndex: action.payload,
				questionStartTime: Date.now(),
				answerChanges: 0,
			};
		case 'SET_OPTION': {
			const wasNull = state.selectedOption === null;
			return {
				...state,
				selectedOption: action.payload,
				answerChanges: wasNull ? state.answerChanges : state.answerChanges + 1,
			};
		}
		case 'SET_CONFIDENCE':
			return { ...state, confidenceLevel: action.payload };
		case 'SET_INTERACTIVE_ANSWER':
			return { ...state, interactiveAnswer: action.payload };
		case 'CHECK_ANSWER':
			return { ...state, isChecked: true, isCorrect: action.payload };
		case 'RESET_ANSWER_STATE':
			return {
				...state,
				selectedOption: null,
				confidenceLevel: null,
				interactiveAnswer: null,
				isChecked: false,
				isCorrect: null,
				showHint: false,
				questionStartTime: Date.now(),
				answerChanges: 0,
				isConfidentError: false,
			};
		case 'SET_ELAPSED':
			return { ...state, elapsedSeconds: action.payload };
		case 'TOGGLE_HINT':
			return { ...state, showHint: !state.showHint };
		case 'SET_MODE':
			return { ...state, mode: action.payload };
		case 'TOGGLE_SUBJECT_SELECTOR':
			return { ...state, showSubjectSelector: action.payload };
		case 'SET_SUBJECT':
			return { ...state, currentSubject: action.payload };
		case 'SET_STRUGGLE_ALERT':
			return {
				...state,
				showStruggleAlert: action.payload.show,
				currentStruggleCount: action.payload.count,
			};
		case 'SET_DIFFICULTY':
			return { ...state, difficulty: action.payload };
		case 'UPDATE_CORRECT_COUNT':
			return { ...state, correctCount: action.payload };
		case 'UPDATE_INCORRECT_COUNT':
			return { ...state, incorrectCount: action.payload };
		case 'UPDATE_TOPIC_STATS': {
			const newTopicStats = new Map(state.topicStats);
			const existing = newTopicStats.get(action.payload.topic) || {
				topic: action.payload.topic,
				correct: 0,
				total: 0,
			};
			newTopicStats.set(action.payload.topic, {
				topic: action.payload.topic,
				correct: existing.correct + action.payload.correct,
				total: existing.total + 1,
			});
			return { ...state, topicStats: newTopicStats };
		}
		case 'LOAD_TOPIC_STATS':
			return { ...state, topicStats: action.payload };
		case 'SET_WEAK_TOPIC_ALERT':
			return { ...state, weakTopicAlert: action.payload };
		case 'TOGGLE_WEAK_ALERT':
			return { ...state, showWeakAlert: action.payload };
		case 'INCREMENT_CORRECT':
			return { ...state, score: state.score + 1, correctCount: state.correctCount + 1 };
		case 'INCREMENT_INCORRECT':
			return { ...state, incorrectCount: state.incorrectCount + 1 };
		case 'RECORD_ANSWER_CHANGE':
			return { ...state, answerChanges: state.answerChanges + 1 };
		case 'SET_QUESTION_START_TIME':
			return { ...state, questionStartTime: action.payload };
		case 'SET_ANTI_GAMING_RISK':
			return {
				...state,
				antiGamingRiskScore: action.payload.score,
				antiGamingRiskLevel: action.payload.level,
			};
		case 'RESET_ANSWER_CHANGES':
			return { ...state, answerChanges: 0 };
		case 'SET_ANSWER_TEXT':
			return { ...state, answerText: action.payload };
		case 'SET_GRADING':
			return { ...state, isGrading: action.payload };
		case 'SET_SHORT_ANSWER_RESULT':
			return {
				...state,
				shortAnswerScore: action.payload.score,
				shortAnswerMaxScore: action.payload.maxScore,
				shortAnswerFeedback: action.payload.feedback,
				isChecked: true,
				isCorrect: action.payload.isCorrect,
				isGrading: false,
			};
		case 'RESET_SHORT_ANSWER_STATE':
			return {
				...state,
				answerText: '',
				shortAnswerScore: 0,
				shortAnswerMaxScore: 0,
				shortAnswerFeedback: '',
			};
		case 'SET_CONFIDENT_ERROR':
			return { ...state, isConfidentError: action.payload };
		case 'SET_QUIZ_FINISHED':
			return {
				...state,
				isQuizFinished: true,
				bridgeRecommendations: action.payload.recommendations,
			};
		case 'SET_MACHINE_STATE':
			// This is handled externally for now, but we could sync it to state if needed
			return state;
		default:
			return state;
	}
}
