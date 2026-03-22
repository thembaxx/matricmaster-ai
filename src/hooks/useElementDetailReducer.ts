import type { ElementType } from '@/constants/periodic-table';

export type ElementDetailState = {
	selectedElement: ElementType | null;
	selectedAnswer: number | null;
	showAnswer: boolean;
};

export type ElementDetailAction =
	| { type: 'SELECT_ELEMENT'; payload: ElementType }
	| { type: 'SET_ANSWER'; payload: number | null }
	| { type: 'SET_SHOW_ANSWER'; payload: boolean }
	| { type: 'CLOSE' };

export function elementDetailReducer(
	state: ElementDetailState,
	action: ElementDetailAction
): ElementDetailState {
	switch (action.type) {
		case 'SELECT_ELEMENT':
			return { selectedElement: action.payload, selectedAnswer: null, showAnswer: false };
		case 'SET_ANSWER':
			return { ...state, selectedAnswer: action.payload };
		case 'SET_SHOW_ANSWER':
			return { ...state, showAnswer: action.payload };
		case 'CLOSE':
			return { selectedElement: null, selectedAnswer: null, showAnswer: false };
		default:
			return state;
	}
}
