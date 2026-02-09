// import type { Screen } from '@/types'; // Removed unused import

import { Icon } from '@iconify/react';
import { Clock, FileText, Loader2, Search as SearchIcon, Sparkles, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PAST_PAPERS } from '@/constants/mock-data';
import { useSession } from '@/lib/auth-client';
import {
	addSearchHistoryAction,
	clearSearchHistoryAction,
	deleteSearchHistoryItemAction,
	getSearchHistoryAction,
} from '@/lib/db/actions';
import type { SearchHistory } from '@/lib/db/schema';
import { smartSearch } from '@/services/geminiService';

export default function Search() {
	const router = useRouter();
	const { data: session } = useSession();
	const [query, setQuery] = useState('');
	const [aiResults, setAiResults] = useState<{ suggestions: string[]; tip: string } | null>(null);
	const [isAiLoading, setIsAiLoading] = useState(false);
	const [recentSearches, setRecentSearches] = useState<SearchHistory[]>([]);
	const [isLoadingHistory, setIsLoadingHistory] = useState(true);

	// Load recent searches on mount
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

	// Trigger AI search when query changes
	useEffect(() => {
		const timer = setTimeout(async () => {
			if (query.length > 3) {
				setIsAiLoading(true);
				const results = await smartSearch(query);
				setAiResults(results);
				setIsAiLoading(false);

				// Save to search history if user is logged in
				if (session?.user?.id) {
					await addSearchHistoryAction(session.user.id, query);
					// Reload search history
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
		? PAST_PAPERS.filter(
				(p) =>
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

	const handleSearchClick = (searchQuery: string) => {
		setQuery(searchQuery);
	};

	return (
		<div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
			<div className="px-6 py-4 ios-glass shrink-0">
				<div className="max-w-2xl mx-auto w-full flex flex-col gap-4">
					<div className="flex items-center gap-4 pl-1 text-left">
						<h1 className="text-xl font-bold text-zinc-500">Search</h1>
					</div>
					<div className="relative">
						<SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Topics, questions, past papers..."
							className="pl-11 bg-zinc-200/50 dark:bg-zinc-800/50 border-none h-12 rounded-xl text-[17px] font-medium focus-visible:ring-2 focus-visible:ring-brand-blue backdrop-blur-sm"
						/>
						{query && (
							<button
								title="Clear search"
								type="button"
								onClick={() => setQuery('')}
								className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
							>
								<X className="w-5 h-5" />
							</button>
						)}
					</div>
				</div>
			</div>

			<ScrollArea className="flex-1">
				<main className="px-6 py-8 max-w-2xl mx-auto w-full space-y-10 pb-40">
					{/* iOS Large Title */}
					<div className="space-y-1 pt-2">
						<h1 className="text-[34px] font-black leading-tight text-zinc-900 dark:text-white tracking-tight">
							Discover
						</h1>
						<p className="text-[17px] font-medium text-zinc-500 dark:text-zinc-400">
							Explore topics and past papers.
						</p>
					</div>
					{!query ? (
						<>
							{/* Trending Section */}
							<div className="space-y-6">
								<div className="flex items-center gap-2 px-1">
									<Icon icon="fluent-emoji-flat:fire" className="w-5 h-5" />
									<h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
										Trending Topics
									</h2>
								</div>
								<div className="flex flex-wrap gap-2">
									{[
										'Calculus P1',
										'Newtonian Mechanics',
										'Organic Chemistry',
										'Ecology',
										'Financial Maths',
										'Trigonometry',
									].map((topic) => (
										<Badge
											key={topic}
											variant="secondary"
											className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-xs font-bold hover:border-brand-blue transition-colors cursor-pointer"
											onClick={() => setQuery(topic)}
										>
											{topic}
										</Badge>
									))}
								</div>
							</div>

							{/* Recent Searches */}
							{session?.user && (
								<div className="space-y-4">
									<div className="flex items-center justify-between px-1">
										<div className="flex items-center gap-2">
											<Clock className="w-4 h-4 text-zinc-400" />
											<h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
												Recent Searches
											</h2>
										</div>
										{recentSearches.length > 0 && (
											<Button
												variant="ghost"
												size="sm"
												onClick={handleClearAllSearches}
												className="h-7 px-2 text-[10px] text-zinc-400 hover:text-red-500 dark:hover:text-red-400"
											>
												<Trash2 className="w-3 h-3 mr-1" />
												Clear All
											</Button>
										)}
									</div>
									<div className="space-y-2">
										{isLoadingHistory ? (
											<div className="flex items-center justify-center py-8">
												<Loader2 className="w-5 h-5 text-brand-blue animate-spin" />
											</div>
										) : recentSearches.length > 0 ? (
											recentSearches.map((search) => (
												<button
													key={search.id}
													type="button"
													onClick={() => handleSearchClick(search.query)}
													className="flex w-full items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-50 dark:border-zinc-800/50 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors cursor-pointer group"
												>
													<span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white">
														{search.query}
													</span>
													<button
														title="Delete search item"
														type="button"
														onClick={(e) => handleDeleteSearch(search.id, e)}
														className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500 dark:hover:text-red-400"
													>
														<X className="w-4 h-4" />
													</button>
												</button>
											))
										) : (
											<p className="text-center text-sm text-zinc-400 py-4">
												No recent searches yet
											</p>
										)}
									</div>
								</div>
							)}

							{/* Suggested for You */}
							<div className="space-y-4">
								<h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
									Suggested for You
								</h2>
								<Card className="p-6 bg-linear-to-br from-brand-blue/5 to-brand-purple/5 border-none rounded-[2.5rem] relative overflow-hidden group cursor-pointer">
									<div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 rounded-full -mr-16 -mt-16 blur-3xl" />
									<div className="relative z-10 flex items-center gap-6">
										<div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
											<Sparkles className="w-8 h-8 text-brand-blue" />
										</div>
										<div>
											<h3 className="font-black text-zinc-900 dark:text-white">
												Mastering Physics P2
											</h3>
											<p className="text-xs text-zinc-500 font-bold">
												Based on your recent activity
											</p>
										</div>
									</div>
								</Card>
							</div>
						</>
					) : (
						<div className="space-y-10">
							{/* AI Suggestions */}
							{(isAiLoading || aiResults) && (
								<div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
									<div className="flex items-center gap-2 px-1">
										<Sparkles className="w-4 h-4 text-brand-blue" />
										<h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
											MatricMaster AI Suggestions
										</h2>
									</div>
									<Card className="p-6 bg-linear-to-br from-brand-blue/5 to-brand-purple/5 border-none rounded-[2.5rem] relative overflow-hidden">
										{isAiLoading ? (
											<div className="flex items-center justify-center py-4">
												<Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
											</div>
										) : (
											<div className="space-y-4">
												{aiResults?.tip && (
													<p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 italic">
														"{aiResults.tip}"
													</p>
												)}
												<div className="flex flex-wrap gap-2">
													{aiResults?.suggestions.map((suggestion) => (
														<Badge
															key={suggestion}
															variant="secondary"
															className="px-3 py-1.5 rounded-lg bg-white/50 dark:bg-zinc-900/50 border border-brand-blue/10 text-[11px] font-bold hover:bg-brand-blue/10 transition-colors cursor-pointer"
															onClick={() => setQuery(suggestion)}
														>
															{suggestion}
														</Badge>
													))}
												</div>
											</div>
										)}
									</Card>
								</div>
							)}

							<div className="space-y-6">
								<h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
									Database Results for "{query}"
								</h2>
								{filteredResults.length > 0 ? (
									<div className="space-y-3">
										{filteredResults.map((paper) => (
											<Card
												key={paper.id}
												className="p-4 border-none shadow-sm bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-between group cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
												onClick={() => router.push(`/past-paper?id=${paper.id}`)}
											>
												<div className="flex items-center gap-4">
													<div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
														<FileText className="w-5 h-5 text-brand-blue" />
													</div>
													<div>
														<h4 className="font-black text-zinc-900 dark:text-white text-sm">
															{paper.subject} {paper.paper}
														</h4>
														<p className="text-[10px] font-bold text-zinc-500 uppercase">
															{paper.month} {paper.year}
														</p>
													</div>
												</div>
												<Sparkles className="w-4 h-4 text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity" />
											</Card>
										))}
									</div>
								) : (
									<div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
										<div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-[2.5rem] flex items-center justify-center">
											<SearchIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
										</div>
										<div className="space-y-1">
											<h3 className="font-black text-zinc-400 uppercase tracking-widest text-xs">
												No matches found
											</h3>
											<p className="text-zinc-400 font-bold">Try searching for something else</p>
										</div>
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
