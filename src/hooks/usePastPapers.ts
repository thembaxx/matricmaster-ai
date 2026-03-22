import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useReducer } from 'react';
import { getPastPapersAction } from '@/lib/db/actions';

export type FilterState = {
	selectedSubjects: string[];
	selectedPapers: string[];
	selectedMonths: string[];
	extractedOnly: boolean;
};

type FilterAction =
	| { type: 'TOGGLE_SUBJECT'; payload: string }
	| { type: 'TOGGLE_PAPER'; payload: string }
	| { type: 'TOGGLE_MONTH'; payload: string }
	| { type: 'TOGGLE_EXTRACTED'; payload: boolean }
	| { type: 'CLEAR_ALL' };

function filterReducer(state: FilterState, action: FilterAction): FilterState {
	switch (action.type) {
		case 'TOGGLE_SUBJECT':
			return {
				...state,
				selectedSubjects: state.selectedSubjects.includes(action.payload)
					? state.selectedSubjects.filter((s) => s !== action.payload)
					: [...state.selectedSubjects, action.payload],
			};
		case 'TOGGLE_PAPER':
			return {
				...state,
				selectedPapers: state.selectedPapers.includes(action.payload)
					? state.selectedPapers.filter((p) => p !== action.payload)
					: [...state.selectedPapers, action.payload],
			};
		case 'TOGGLE_MONTH':
			return {
				...state,
				selectedMonths: state.selectedMonths.includes(action.payload)
					? state.selectedMonths.filter((m) => m !== action.payload)
					: [...state.selectedMonths, action.payload],
			};
		case 'TOGGLE_EXTRACTED':
			return { ...state, extractedOnly: action.payload };
		case 'CLEAR_ALL':
			return { selectedSubjects: [], selectedPapers: [], selectedMonths: [], extractedOnly: false };
		default:
			return state;
	}
}

export type UIState = {
	searchQuery: string;
	selectedYear: number | 'All';
	isAdvancedFilterOpen: boolean;
};

type UIAction =
	| { type: 'SET_SEARCH_QUERY'; payload: string }
	| { type: 'SET_YEAR'; payload: number | 'All' }
	| { type: 'TOGGLE_FILTER_PANEL'; payload: boolean };

function uiReducer(state: UIState, action: UIAction): UIState {
	switch (action.type) {
		case 'SET_SEARCH_QUERY':
			return { ...state, searchQuery: action.payload };
		case 'SET_YEAR':
			return { ...state, selectedYear: action.payload };
		case 'TOGGLE_FILTER_PANEL':
			return { ...state, isAdvancedFilterOpen: action.payload };
		default:
			return state;
	}
}

export function usePastPapers() {
	const [uiState, uiDispatch] = useReducer(uiReducer, {
		searchQuery: '',
		selectedYear: 'All',
		isAdvancedFilterOpen: false,
	});

	const [filterState, filterDispatch] = useReducer(filterReducer, {
		selectedSubjects: [],
		selectedPapers: [],
		selectedMonths: [],
		extractedOnly: false,
	});

	const years = useMemo(() => ['All', 2024, 2023, 2022, 2021, 2020], []);

	const { data: papers = [], isLoading } = useQuery({
		queryKey: ['past-papers'],
		queryFn: async () => getPastPapersAction(),
	});

	const availableSubjects = useMemo(
		() => [...new Set(papers.map((p) => p.subject))].sort(),
		[papers]
	);
	const availablePapers = useMemo(() => [...new Set(papers.map((p) => p.paper))].sort(), [papers]);
	const availableMonths = useMemo(() => [...new Set(papers.map((p) => p.month))].sort(), [papers]);

	const activeFilterCount =
		filterState.selectedSubjects.length +
		filterState.selectedPapers.length +
		filterState.selectedMonths.length +
		(filterState.extractedOnly ? 1 : 0);

	const clearAllFilters = useCallback(() => {
		filterDispatch({ type: 'CLEAR_ALL' });
	}, []);

	const filteredPapers = useMemo(() => {
		return papers.filter((paper) => {
			const matchesSearch =
				paper.subject.toLowerCase().includes(uiState.searchQuery.toLowerCase()) ||
				paper.paper.toLowerCase().includes(uiState.searchQuery.toLowerCase());
			const matchesYear = uiState.selectedYear === 'All' || paper.year === uiState.selectedYear;
			const matchesSubjects =
				filterState.selectedSubjects.length === 0 ||
				filterState.selectedSubjects.includes(paper.subject);
			const matchesPapers =
				filterState.selectedPapers.length === 0 || filterState.selectedPapers.includes(paper.paper);
			const matchesMonths =
				filterState.selectedMonths.length === 0 || filterState.selectedMonths.includes(paper.month);
			const matchesExtracted = !filterState.extractedOnly || paper.isExtracted;
			return (
				matchesSearch &&
				matchesYear &&
				matchesSubjects &&
				matchesPapers &&
				matchesMonths &&
				matchesExtracted
			);
		});
	}, [
		papers,
		uiState.searchQuery,
		uiState.selectedYear,
		filterState.selectedSubjects,
		filterState.selectedPapers,
		filterState.selectedMonths,
		filterState.extractedOnly,
	]);

	return {
		uiState,
		uiDispatch,
		filterState,
		filterDispatch,
		years,
		availableSubjects,
		availablePapers,
		availableMonths,
		activeFilterCount,
		clearAllFilters,
		filteredPapers,
		isLoading,
	};
}
