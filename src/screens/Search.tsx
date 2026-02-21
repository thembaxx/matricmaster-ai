'use client';

import { m } from 'framer-motion';
import { useEffect, useState } from 'react';
import { AiInsights } from '@/components/Search/AiInsights';
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
	const [aiResults, setAiResults] = useState<{ suggestions: string[]; tip: string } | null>(null);
	const [isAiLoading, setIsAiLoading] = useState(false);
	const [recentSearches, setRecentSearches] = useState<SearchHistory[]>([]);
	const [isLoadingHistory, setIsLoadingHistory] = useState(true);
	const [papers, setPapers] = useState<PastPaper[]>([]);

	useEffect(() => {
		const loadSearchHistory = async () => {
			if (session?.user?.id) {
				setIsLoadingHistory(true);
				const history = await getSearchHistoryAction(session.user.id);
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
				setIsAiLoading(true);
				const results = await smartSearch(query);
				setAiResults(results);
				setIsAiLoading(false);

				if (session?.user?.id) {
					await addSearchHistoryAction(session.user.id, query);
					const history = await getSearchHistoryAction(session.user.id);
					setRecentSearches(history);
				}
			} else {
				setAiResults(null);
			}
		}, 800);

		return () => clearTimeout(timer);
	}, [query, session?.user?.id]);

	const filteredResults = query
		? papers.filter(
				(p: PastPaper) =>
					p.subject.toLowerCase().includes(query.toLowerCase()) ||
					p.paper.toLowerCase().includes(query.toLowerCase())
			)
		: [];

	const handleDeleteSearch = async (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		if (session?.user?.id) {
			await deleteSearchHistoryItemAction(id, session.user.id);
			setRecentSearches((prev) => prev.filter((s) => s.id !== id));
		}
	};

	const handleClearAllSearches = async () => {
		if (session?.user?.id) {
			await clearSearchHistoryAction(session.user.id);
			setRecentSearches([]);
		}
	};

	return (
		<div className="flex flex-col h-full bg-background lg:px-8">
			<div className="px-6 py-6 bg-background shrink-0 lg:px-0">
				<div className="max-w-4xl mx-auto w-full">
					<SearchHeader query={query} onQueryChange={setQuery} />
				</div>
			</div>

			<ScrollArea className="flex-1 no-scrollbar">
				<main className="px-6 py-8 max-w-4xl mx-auto w-full space-y-12 pb-32 lg:px-0">
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
							<AiInsights
								isLoading={isAiLoading}
								suggestions={aiResults?.suggestions}
								tip={aiResults?.tip}
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
