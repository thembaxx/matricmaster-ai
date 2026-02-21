import { create } from 'zustand';

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

interface PracticeState {
	currentIndex: number;
	answers: Record<string, string>;
	answerStates: Record<string, AnswerState>;
	showExplanation: boolean;
	showAllAnswers: boolean;

	selectAnswer: (problemId: string, answer: string) => void;
	checkAnswer: (problemId: string, correctAnswer: string) => void;
	goNext: (totalProblems: number) => void;
	goPrevious: () => void;
	showResults: () => void;
	reset: () => void;
}

const initialState = {
	currentIndex: 0,
	answers: {} as Record<string, string>,
	answerStates: {} as Record<string, AnswerState>,
	showExplanation: false,
	showAllAnswers: false,
};

export const usePracticeStore = create<PracticeState>((set, get) => ({
	...initialState,

	selectAnswer: (problemId: string, answer: string) => {
		set((state) => ({
			answers: { ...state.answers, [problemId]: answer },
		}));
	},

	checkAnswer: (problemId: string, correctAnswer: string) => {
		const userAnswer = get().answers[problemId];
		if (!userAnswer) return;

		const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
		set((state) => ({
			answerStates: {
				...state.answerStates,
				[problemId]: isCorrect ? 'correct' : 'incorrect',
			},
			showExplanation: true,
		}));
	},

	goNext: (totalProblems: number) => {
		const { currentIndex } = get();
		if (currentIndex < totalProblems - 1) {
			set({ currentIndex: currentIndex + 1, showExplanation: false });
		}
	},

	goPrevious: () => {
		const { currentIndex } = get();
		if (currentIndex > 0) {
			set({ currentIndex: currentIndex - 1, showExplanation: false });
		}
	},

	showResults: () => {
		set({ showAllAnswers: true });
	},

	reset: () => set(initialState),
}));
