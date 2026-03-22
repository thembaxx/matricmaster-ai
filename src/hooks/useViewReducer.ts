import type { ElementType, TrendMode } from '@/constants/periodic-table';

export type ViewState = {
	searchQuery: string;
	selectedGroup: string;
	isDesktop: boolean;
	trendsMode: TrendMode;
	compareMode: boolean;
	compareElements: ElementType[];
};

export type ViewAction =
	| { type: 'SET_SEARCH_QUERY'; payload: string }
	| { type: 'SET_GROUP'; payload: string }
	| { type: 'SET_DESKTOP'; payload: boolean }
	| { type: 'SET_TRENDS_MODE'; payload: TrendMode }
	| { type: 'SET_COMPARE_MODE'; payload: boolean }
	| { type: 'ADD_COMPARE_ELEMENT'; payload: ElementType }
	| { type: 'REMOVE_COMPARE_ELEMENT'; payload: ElementType }
	| { type: 'CLEAR_COMPARE' };

export function viewReducer(state: ViewState, action: ViewAction): ViewState {
	switch (action.type) {
		case 'SET_SEARCH_QUERY':
			return { ...state, searchQuery: action.payload };
		case 'SET_GROUP':
			return { ...state, selectedGroup: action.payload };
		case 'SET_DESKTOP':
			return { ...state, isDesktop: action.payload };
		case 'SET_TRENDS_MODE':
			return { ...state, trendsMode: action.payload };
		case 'SET_COMPARE_MODE':
			return {
				...state,
				compareMode: action.payload,
				compareElements: action.payload ? state.compareElements : [],
			};
		case 'ADD_COMPARE_ELEMENT':
			if (state.compareElements.length >= 2) return state;
			if (state.compareElements.find((e) => e.num === action.payload.num)) return state;
			return { ...state, compareElements: [...state.compareElements, action.payload] };
		case 'REMOVE_COMPARE_ELEMENT':
			return {
				...state,
				compareElements: state.compareElements.filter((e) => e.num !== action.payload.num),
			};
		case 'CLEAR_COMPARE':
			return { ...state, compareElements: [] };
		default:
			return state;
	}
}
