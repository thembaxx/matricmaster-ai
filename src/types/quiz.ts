export interface QuizResult {
	correctAnswers: number;
	totalQuestions: number;
	durationSeconds: number;
	accuracy: number;
	subjectId?: number;
	subjectName: string;
	difficulty: 'easy' | 'medium' | 'hard';
	topic?: string;
	completedAt: Date;
}

export interface QuizAnswer {
	questionId: string;
	selectedOption: string;
	isCorrect: boolean;
	timeSpentSeconds: number;
}

export interface QuizSession {
	quizId: string;
	subjectName: string;
	topic?: string;
	startedAt: Date;
	answers: QuizAnswer[];
	currentQuestionIndex: number;
}

export interface TopicStats {
	topic: string;
	correct: number;
	total: number;
}

export interface WeakTopicAlertData {
	topic: string;
	subject: string;
	score: number;
}

export interface QuizState {
	currentQuestionIndex: number;
	selectedOption: string | null;
	answerText: string;
	shortAnswerScore: number;
	shortAnswerMaxScore: number;
	shortAnswerFeedback: string;
	isChecked: boolean;
	isCorrect: boolean | null;
	elapsedSeconds: number;
	showHint: boolean;
	score: number;
	mode: 'test' | 'practice';
	showSubjectSelector: boolean;
	currentSubject: string;
	showStruggleAlert: boolean;
	currentStruggleCount: number;
	difficulty: 'easy' | 'medium' | 'hard';
	correctCount: number;
	incorrectCount: number;
	topicStats: Map<string, TopicStats>;
	weakTopicAlert: WeakTopicAlertData | null;
	showWeakAlert: boolean;
	questionStartTime: number;
	answerChanges: number;
	antiGamingRiskScore: number;
	antiGamingRiskLevel: 'low' | 'medium' | 'high' | 'critical';
	isGrading: boolean;
}

export type QuizAction =
	| { type: 'SET_QUESTION_INDEX'; payload: number }
	| { type: 'SET_OPTION'; payload: string | null }
	| { type: 'CHECK_ANSWER'; payload: boolean }
	| { type: 'RESET_ANSWER_STATE' }
	| { type: 'SET_ELAPSED'; payload: number }
	| { type: 'TOGGLE_HINT' }
	| { type: 'SET_MODE'; payload: 'test' | 'practice' }
	| { type: 'TOGGLE_SUBJECT_SELECTOR'; payload: boolean }
	| { type: 'SET_SUBJECT'; payload: string }
	| { type: 'SET_STRUGGLE_ALERT'; payload: { show: boolean; count: number } }
	| { type: 'SET_DIFFICULTY'; payload: 'easy' | 'medium' | 'hard' }
	| { type: 'UPDATE_CORRECT_COUNT'; payload: number }
	| { type: 'UPDATE_INCORRECT_COUNT'; payload: number }
	| { type: 'UPDATE_TOPIC_STATS'; payload: { topic: string; correct: number } }
	| { type: 'SET_WEAK_TOPIC_ALERT'; payload: WeakTopicAlertData | null }
	| { type: 'TOGGLE_WEAK_ALERT'; payload: boolean }
	| { type: 'INCREMENT_CORRECT' }
	| { type: 'INCREMENT_INCORRECT' }
	| { type: 'RECORD_ANSWER_CHANGE' }
	| { type: 'SET_QUESTION_START_TIME'; payload: number }
	| {
			type: 'SET_ANTI_GAMING_RISK';
			payload: { score: number; level: 'low' | 'medium' | 'high' | 'critical' };
	  }
	| { type: 'RESET_ANSWER_CHANGES' }
	| { type: 'SET_ANSWER_TEXT'; payload: string }
	| { type: 'SET_GRADING'; payload: boolean }
	| {
			type: 'SET_SHORT_ANSWER_RESULT';
			payload: { score: number; maxScore: number; feedback: string; isCorrect: boolean };
	  }
	| { type: 'RESET_SHORT_ANSWER_STATE' };

export const initialQuizState: QuizState = {
	currentQuestionIndex: 0,
	selectedOption: null,
	answerText: '',
	shortAnswerScore: 0,
	shortAnswerMaxScore: 0,
	shortAnswerFeedback: '',
	isChecked: false,
	isCorrect: null,
	elapsedSeconds: 0,
	showHint: false,
	score: 0,
	mode: 'test',
	showSubjectSelector: false,
	currentSubject: '',
	showStruggleAlert: false,
	currentStruggleCount: 0,
	difficulty: 'medium',
	correctCount: 0,
	incorrectCount: 0,
	topicStats: new Map(),
	weakTopicAlert: null,
	showWeakAlert: false,
	questionStartTime: 0,
	answerChanges: 0,
	antiGamingRiskScore: 0,
	antiGamingRiskLevel: 'low',
	isGrading: false,
};
