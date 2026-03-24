'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { m } from 'framer-motion';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AiInsights } from '@/components/Search/AiInsights';
import { SearchHeader } from '@/components/Search/SearchHeader';
import { SearchHistoryList } from '@/components/Search/SearchHistoryList';
import { SearchResults } from '@/components/Search/SearchResults';
import { SuggestedCards } from '@/components/Search/SuggestedCards';
import { TrendingTopics } from '@/components/Search/TrendingTopics';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGeminiQuotaModal } from '@/contexts/GeminiQuotaModalContext';
import { isQuotaError } from '@/lib/ai/quota-error';
import { STAGGER_CONTAINER } from '@/lib/animation-presets';
import { useSession } from '@/lib/auth-client';
import {
	addSearchHistoryAction,
	clearSearchHistoryAction,
	deleteSearchHistoryItemAction,
	getPastPapersAction,
	getSearchHistoryAction,
} from '@/lib/db/actions';
import type { PastPaper } from '@/lib/db/schema';
import { getLessonsBySubject } from '@/lib/lessons';
import { smartSearch } from '@/services/geminiService';

export default function Search() {
	const { data: session } = useSession();
	const { triggerQuotaError } = useGeminiQuotaModal();
	const queryClient = useQueryClient();
	const [query, setQuery] = useState('');
	const [aiResults, setAiResults] = useState<{ suggestions: string[]; tip: string } | null>(null);

	// Search history with useQuery
	const { data: recentSearches = [], isLoading: isLoadingHistory } = useQuery({
		queryKey: ['searchHistory', session?.user?.id],
		queryFn: () => getSearchHistoryAction(),
		enabled: !!session?.user?.id,
	});

	// Papers and lessons with useQuery
	const { data: papers = [] } = useQuery({
		queryKey: ['pastPapers'],
		queryFn: () => getPastPapersAction(),
	});

	// Static lessons data - useMemo since it's from static JSON
	const allLessons = useMemo(() => {
		const subjects = [
			'math',
			'physics',
			'life',
			'accounting',
			'geography',
			'business',
			'history',
			'chemistry',
			'economics',
			'lo',
		];
		return subjects.flatMap((s) => getLessonsBySubject(s));
	}, []);

	const isAiLoading = query.length > 3;

	// eslint-disable-next-line react-hooks/setState-in-use-effect
	useEffect(() => {
		const timer = setTimeout(async () => {
			if (query.length > 3) {
				try {
					const results = await smartSearch(query);
					setAiResults(results);

					if (session?.user?.id) {
						await addSearchHistoryAction(query);
						queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
					}
				} catch (error) {
					if (isQuotaError(error)) {
						triggerQuotaError();
					}
					console.debug('Smart search error:', error);
				}
			} else {
				setAiResults(null);
			}
		}, 800);

		return () => clearTimeout(timer);
	}, [query, session?.user?.id, triggerQuotaError, queryClient]);

	const filteredResults = useMemo(() => {
		if (!query) return { papers: [], lessons: [] };
		const lowerQuery = query.toLowerCase();

		return {
			papers: papers.filter(
				(p: PastPaper) =>
					p.subject.toLowerCase().includes(lowerQuery) || p.paper.toLowerCase().includes(lowerQuery)
			),
			lessons: allLessons.filter(
				(l) =>
					l.title.toLowerCase().includes(lowerQuery) || l.topic.toLowerCase().includes(lowerQuery)
			),
		};
	}, [papers, allLessons, query]);

	const handleDeleteSearch = useCallback(
		async (id: string, e: React.MouseEvent) => {
			e.stopPropagation();
			if (session?.user?.id) {
				await deleteSearchHistoryItemAction(id);
				queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
			}
		},
		[session?.user?.id, queryClient]
	);

	const handleClearAllSearches = useCallback(async () => {
		if (session?.user?.id) {
			await clearSearchHistoryAction();
			queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
		}
	}, [session?.user?.id, queryClient]);

	return (
		<div className="flex flex-col h-full bg-background lg:px-12 relative overflow-hidden">
			<div className="px-4 sm:px-6 py-8 sm:py-12 bg-background shrink-0 lg:px-0">
				<div className="max-w-5xl mx-auto w-full">
					<div className="mb-8 sm:mb-12 space-y-2">
						<h1 className="text-3xl sm:text-4xl lg:text-7xl font-black text-foreground tracking-tighter">
							smart search
						</h1>
						<p className="text-muted-foreground font-bold text-sm sm:text-lg">
							find papers, topics, and helpful insights instantly
						</p>
					</div>
					<SearchHeader query={query} onQueryChange={setQuery} />
				</div>
			</div>

			<ScrollArea className="flex-1 no-scrollbar">
				<main className="px-6 py-8 max-w-5xl mx-auto w-full space-y-12 pb-32 lg:px-0">
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
								query={query}
							/>

							<div className="space-y-8">
								{filteredResults.lessons.length > 0 && (
									<section>
										<h3 className="text-sm font-black text-muted-foreground tracking-widest mb-4">
											lessons
										</h3>
										<div className="grid gap-4 sm:grid-cols-2">
											{filteredResults.lessons.map((l) => (
												<Link key={l.id} href={`/focus?lessonId=${l.id}`}>
													{' '}
													<Card className="p-6 hover:border-primary/50 transition-all group shadow-tiimo">
														<div className="flex items-center justify-between mb-2">
															<span className="text-[10px] font-black text-primary tracking-widest">
																{l.topic.toLowerCase()}
															</span>
															<span className="text-[10px] font-bold text-muted-foreground">
																{l.duration} min
															</span>
														</div>
														<h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
															{l.title.toLowerCase()}
														</h4>
													</Card>
												</Link>
											))}
										</div>
									</section>
								)}

								{filteredResults.papers.length > 0 && (
									<section>
										<h3 className="text-sm font-black text-muted-foreground tracking-widest mb-4">
											past papers
										</h3>
										<SearchResults results={filteredResults.papers} />
									</section>
								)}

								{filteredResults.lessons.length === 0 && filteredResults.papers.length === 0 && (
									<div className="py-20 text-center">
										<p className="text-muted-foreground font-bold text-xs tracking-[0.2em]">
											no matches found for "{query}"
										</p>
									</div>
								)}
							</div>
						</div>
					)}
				</main>
			</ScrollArea>
		</div>
	);
}
