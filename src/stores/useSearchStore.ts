import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
	addSearchHistoryAction,
	clearSearchHistoryAction,
	deleteSearchHistoryItemAction,
	getPastPapersAction,
	getSearchHistoryAction,
} from '@/lib/db/actions';
import type { PastPaper, SearchHistory } from '@/lib/db/schema';
import { smartSearch } from '@/services/geminiService';

interface AiResults {
	suggestions: string[];
	tip: string;
}

interface SearchState {
	query: string;
	aiResults: AiResults | null;
	isAiLoading: boolean;
	recentSearches: SearchHistory[];
	isLoadingHistory: boolean;
	papers: PastPaper[];
	isLoadingPapers: boolean;

	setQuery: (q: string) => void;
	searchWithAI: (q: string) => Promise<void>;
	loadHistory: (userId: string) => Promise<void>;
	addToHistory: (userId: string, q: string) => Promise<void>;
	removeFromHistory: (userId: string, id: string) => Promise<void>;
	clearHistory: (userId: string) => Promise<void>;
	loadPapers: () => Promise<void>;
}

export const useSearchStore = create<SearchState>()(
	persist(
		(set) => ({
			query: '',
			aiResults: null,
			isAiLoading: false,
			recentSearches: [],
			isLoadingHistory: true,
			papers: [],
			isLoadingPapers: true,

			setQuery: (q: string) => set({ query: q }),

			searchWithAI: async (q: string) => {
				if (q.length <= 3) return;
				set({ isAiLoading: true });
				try {
					const results = await smartSearch(q);
					set({ aiResults: results, isAiLoading: false });
				} catch (error) {
					console.error('AI search failed:', error);
					set({ isAiLoading: false });
				}
			},

			loadHistory: async (userId: string) => {
				set({ isLoadingHistory: true });
				try {
					const history = await getSearchHistoryAction(userId);
					set({ recentSearches: history, isLoadingHistory: false });
				} catch (error) {
					console.error('Failed to load search history:', error);
					set({ isLoadingHistory: false });
				}
			},

			addToHistory: async (userId: string, q: string) => {
				try {
					await addSearchHistoryAction(userId, q);
					const history = await getSearchHistoryAction(userId);
					set({ recentSearches: history });
				} catch (error) {
					console.error('Failed to add search history:', error);
				}
			},

			removeFromHistory: async (userId: string, id: string) => {
				try {
					await deleteSearchHistoryItemAction(userId, id);
					const history = await getSearchHistoryAction(userId);
					set({ recentSearches: history });
				} catch (error) {
					console.error('Failed to remove search history item:', error);
				}
			},

			clearHistory: async (userId: string) => {
				try {
					await clearSearchHistoryAction(userId);
					set({ recentSearches: [] });
				} catch (error) {
					console.error('Failed to clear search history:', error);
				}
			},

			loadPapers: async () => {
				set({ isLoadingPapers: true });
				try {
					const data = await getPastPapersAction();
					set({ papers: data, isLoadingPapers: false });
				} catch (error) {
					console.error('Failed to load papers:', error);
					set({ isLoadingPapers: false });
				}
			},
		}),
		{
			name: 'search-store',
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				recentSearches: state.recentSearches,
			}),
		}
	)
);
