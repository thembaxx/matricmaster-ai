import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useReducer } from 'react';
import { getPastPapersAction, getUserPastPaperUsageAction } from '@/lib/db/actions';

export type FilterState = {
	selectedSubjects: string[];
	selectedPapers: string[];
	selectedMonths: string[];
	extractedOnly: boolean;
	bookmarkedOnly: boolean;
};

type FilterAction =
	| { type: 'TOGGLE_SUBJECT'; payload: string }
	| { type: 'TOGGLE_PAPER'; payload: string }
	| { type: 'TOGGLE_MONTH'; payload: string }
	| { type: 'TOGGLE_EXTRACTED'; payload: boolean }
	| { type: 'TOGGLE_BOOKMARKED' }
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
		case 'TOGGLE_BOOKMARKED':
			return { ...state, bookmarkedOnly: !state.bookmarkedOnly };
		case 'CLEAR_ALL':
			return {
				selectedSubjects: [],
				selectedPapers: [],
				selectedMonths: [],
				extractedOnly: false,
				bookmarkedOnly: false,
			};
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
		bookmarkedOnly: false,
	});

	const years = useMemo(() => ['All', 2024, 2023, 2022, 2021, 2020], []);

	const { data: papersData, isLoading } = useQuery({
		queryKey: ['past-papers'],
		queryFn: async () => getPastPapersAction(),
	});

	const { data: usageData } = useQuery({
		queryKey: ['user-past-paper-usage'],
		queryFn: async () => getUserPastPaperUsageAction(),
	});

	const papers = papersData?.papers ?? [];

	const papersWithUsage = useMemo(() => {
		const usageMap = new Map(
			(usageData?.usage ?? []).map((u) => [
				u.paperId,
				{ viewCount: u.viewCount, lastViewedAt: u.lastViewedAt, isBookmarked: u.isBookmarked },
			])
		);

		return papers.map((paper) => ({
			...paper,
			viewCount: usageMap.get(paper.id)?.viewCount ?? 0,
			lastViewedAt: usageMap.get(paper.id)?.lastViewedAt,
			isBookmarked: usageMap.get(paper.id)?.isBookmarked ?? false,
		}));
	}, [papers, usageData]);

	const availableSubjects = useMemo<string[]>(
		() => [...new Set(papersWithUsage.map((p: { subject: string }) => p.subject))].sort(),
		[papersWithUsage]
	);
	const availablePapers = useMemo<string[]>(
		() => [...new Set(papersWithUsage.map((p: { paper: string }) => p.paper))].sort(),
		[papersWithUsage]
	);
	const availableMonths = useMemo<string[]>(
		() => [...new Set(papersWithUsage.map((p: { month: string }) => p.month))].sort(),
		[papersWithUsage]
	);

	const activeFilterCount =
		filterState.selectedSubjects.length +
		filterState.selectedPapers.length +
		filterState.selectedMonths.length +
		(filterState.extractedOnly ? 1 : 0) +
		(filterState.bookmarkedOnly ? 1 : 0);

	const clearAllFilters = useCallback(() => {
		filterDispatch({ type: 'CLEAR_ALL' });
	}, []);

	const filteredPapers = useMemo(() => {
		return papersWithUsage.filter(
			(paper: {
				subject: string;
				paper: string;
				year: number;
				month: string;
				isExtracted: boolean;
				isBookmarked: boolean;
			}) => {
				const matchesSearch =
					paper.subject.toLowerCase().includes(uiState.searchQuery.toLowerCase()) ||
					paper.paper.toLowerCase().includes(uiState.searchQuery.toLowerCase());
				const matchesYear = uiState.selectedYear === 'All' || paper.year === uiState.selectedYear;
				const matchesSubjects =
					filterState.selectedSubjects.length === 0 ||
					filterState.selectedSubjects.includes(paper.subject);
				const matchesPapers =
					filterState.selectedPapers.length === 0 ||
					filterState.selectedPapers.includes(paper.paper);
				const matchesMonths =
					filterState.selectedMonths.length === 0 ||
					filterState.selectedMonths.includes(paper.month);
				const matchesExtracted = !filterState.extractedOnly || paper.isExtracted;
				const matchesBookmarked = !filterState.bookmarkedOnly || paper.isBookmarked;
				return (
					matchesSearch &&
					matchesYear &&
					matchesSubjects &&
					matchesPapers &&
					matchesMonths &&
					matchesExtracted &&
					matchesBookmarked
				);
			}
		);
	}, [
		papersWithUsage,
		uiState.searchQuery,
		uiState.selectedYear,
		filterState.selectedSubjects,
		filterState.selectedPapers,
		filterState.selectedMonths,
		filterState.extractedOnly,
		filterState.bookmarkedOnly,
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
		papersWithUsage,
		isLoading,
	};
}
