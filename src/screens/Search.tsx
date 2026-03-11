'use client';

import { m } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SmartInsights } from '@/components/Search/SmartInsights';
import { SearchHeader } from '@/components/Search/SearchHeader';
import { SearchHistoryList } from '@/components/Search/SearchHistoryList';
import { SearchResults } from '@/components/Search/SearchResults';
import { SuggestedCards } from '@/components/Search/SuggestedCards';
import { TrendingTopics } from '@/components/Search/TrendingTopics';
import { ScrollArea } from '@/components/ui/scroll-area';
import { STAGGER_CONTAINER } from '@/lib/animation-presets';
import { useSession } from '@/lib/auth-client';
import {
	addSearchHistoryAction,
	clearSearchHistoryAction,
	deleteSearchHistoryItemAction,
	getPastPapersAction,
	getSearchHistoryAction,
} from '@/lib/db/actions';
import type { PastPaper, SearchHistory } from '@/lib/db/schema';
import { smartSearch } from '@/services/geminiService';

export default function Search() {
	const { data: session } = useSession();
	const [query, setQuery] = useState('');
	const [smartResults, setSmartResults] = useState<{ suggestions: string[]; tip: string } | null>(null);
	const [isSmartLoading, setIsSmartLoading] = useState(false);
	const [recentSearches, setRecentSearches] = useState<SearchHistory[]>([]);
	const [isLoadingHistory, setIsLoadingHistory] = useState(true);
	const [papers, setPapers] = useState<PastPaper[]>([]);

	useEffect(() => {
		const loadSearchHistory = async () => {
			if (session?.user?.id) {
				setIsLoadingHistory(true);
				const history = await getSearchHistoryAction();
				setRecentSearches(history);
				setIsLoadingHistory(false);
			}
		};
		loadSearchHistory();
	}, [session?.user?.id]);

	useEffect(() => {
		const loadPapers = async () => {
			try {
				const data = await getPastPapersAction();
				setPapers(data);
			} catch (error) {
				console.error('Failed to load papers:', error);
			}
		};
		loadPapers();
	}, []);

	useEffect(() => {
		const timer = setTimeout(async () => {
			if (query.length > 3) {
				setIsSmartLoading(true);
				const results = await smartSearch(query);
				setSmartResults(results);
				setIsSmartLoading(false);

				if (session?.user?.id) {
					await addSearchHistoryAction(query);
					const history = await getSearchHistoryAction();
					setRecentSearches(history);
				}
			} else {
				setSmartResults(null);
			}
		}, 800);

		return () => clearTimeout(timer);
	}, [query, session?.user?.id]);

	// Bolt: Memoize filtered results and pre-normalize search query to avoid O(N) recalculation on every render
	const filteredResults = useMemo(() => {
		if (!query) return [];
		const lowerQuery = query.toLowerCase();
		return papers.filter(
			(p: PastPaper) =>
				p.subject.toLowerCase().includes(lowerQuery) || p.paper.toLowerCase().includes(lowerQuery)
		);
	}, [papers, query]);

	const handleDeleteSearch = useCallback(
		async (id: string, e: React.MouseEvent) => {
			e.stopPropagation();
			if (session?.user?.id) {
				await deleteSearchHistoryItemAction(id);
				setRecentSearches((prev) => prev.filter((s) => s.id !== id));
			}
		},
		[session?.user?.id]
	);

	const handleClearAllSearches = useCallback(async () => {
		if (session?.user?.id) {
			await clearSearchHistoryAction();
			setRecentSearches([]);
		}
	}, [session?.user?.id]);

	return (
		<div className="flex flex-col h-full bg-white dark:bg-zinc-950 lg:px-16 relative overflow-hidden">
			<div className="px-6 sm:px-10 pt-20 sm:pt-32 pb-12 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl shrink-0 lg:px-0">
				<div className="max-w-5xl mx-auto w-full space-y-12">
					<div className="space-y-4">
						<h1 className="text-5xl sm:text-7xl lg:text-9xl font-black text-foreground tracking-tighter leading-none">
							Search
						</h1>
						<p className="text-muted-foreground/40 font-black text-lg sm:text-2xl uppercase tracking-[0.3em] leading-none">
							Intelligent archive
						</p>
					</div>
					<SearchHeader query={query} onQueryChange={setQuery} />
				</div>
			</div>

			<ScrollArea className="flex-1 no-scrollbar px-6 sm:px-10 lg:px-0">
				<main className="max-w-5xl mx-auto w-full space-y-16 sm:space-y-24 pb-64">
					{!query ? (
						<m.div
							variants={STAGGER_CONTAINER}
							initial="hidden"
							animate="visible"
							className="space-y-12"
						>
							<TrendingTopics onTopicClick={setQuery} />
							{session?.user && (
								<SearchHistoryList
									searches={recentSearches}
									isLoading={isLoadingHistory}
									onDelete={handleDeleteSearch}
									onClearAll={handleClearAllSearches}
									onSearchClick={setQuery}
								/>
							)}
							<SuggestedCards />
						</m.div>
					) : (
						<div className="space-y-12">
							<SmartInsights
								isLoading={isSmartLoading}
								suggestions={smartResults?.suggestions}
								tip={smartResults?.tip}
								onSuggestionClick={setQuery}
							/>
							<SearchResults results={filteredResults} />
						</div>
					)}
				</main>
			</ScrollArea>
		</div>
	);
}
