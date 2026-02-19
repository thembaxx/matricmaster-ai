'use client';

// import type { Screen } from '@/types'; // Removed unused import

import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, FileText, Loader2, Search as SearchIcon, Sparkles, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SmoothWords } from '@/components/Transition/SmoothText';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PAST_PAPERS } from '@/constants/mock-data';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
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
		<div className="flex flex-col h-full bg-background">
			<div className="px-6 py-4 bg-card/80 backdrop-blur-xl border-b border-border shrink-0">
				<div className="max-w-2xl mx-auto w-full flex flex-col gap-4">
					<div className="flex items-center gap-4 pl-1 text-left">
						<h1 className="text-xl font-bold text-muted-foreground">Search</h1>
					</div>
					<motion.div
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className="relative"
					>
						<SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Topics, questions, past papers..."
							className="pl-11 bg-muted/50 h-12"
						/>
						<AnimatePresence>
							{query && (
								<motion.button
									initial={{ scale: 0, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0, opacity: 0 }}
									title="Clear search"
									type="button"
									onClick={() => setQuery('')}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
								>
									<X className="w-5 h-5" />
								</motion.button>
							)}
						</AnimatePresence>
					</motion.div>
				</div>
			</div>

			<ScrollArea className="flex-1">
				<main className="px-6 py-8 max-w-2xl mx-auto w-full space-y-10 pb-40">
					{/* iOS Large Title */}
					<div className="space-y-1 pt-2">
						<SmoothWords
							as="h1"
							text="Discover"
							className="text-[34px] font-black leading-tight text-foreground tracking-tight"
						/>
						<motion.p
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="text-[17px] font-medium text-muted-foreground"
						>
							Explore topics and past papers.
						</motion.p>
					</div>
					{!query ? (
						<motion.div
							variants={STAGGER_CONTAINER}
							initial="hidden"
							animate="visible"
							className="space-y-10"
						>
							{/* Trending Section */}
							<motion.div variants={STAGGER_ITEM} className="space-y-6">
								<div className="flex items-center gap-2 px-1">
									<Icon icon="fluent-emoji-flat:fire" className="w-5 h-5" />
									<h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
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
										<motion.div key={topic} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
											<Badge
												variant="secondary"
												className="px-4 py-2 rounded-xl bg-card text-xs font-bold hover:border-primary transition-colors cursor-pointer border border-border"
												onClick={() => setQuery(topic)}
											>
												{topic}
											</Badge>
										</motion.div>
									))}
								</div>
							</motion.div>

							{/* Recent Searches */}
							{session?.user && (
								<motion.div variants={STAGGER_ITEM} className="space-y-4">
									<div className="flex items-center justify-between px-1">
										<div className="flex items-center gap-2">
											<Clock className="w-4 h-4 text-muted-foreground" />
											<h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
												Recent Searches
											</h2>
										</div>
										{recentSearches.length > 0 && (
											<Button
												variant="ghost"
												size="sm"
												onClick={handleClearAllSearches}
												className="h-7 px-2 text-[10px] text-muted-foreground hover:text-destructive"
											>
												<Trash2 className="w-3 h-3 mr-1" />
												Clear All
											</Button>
										)}
									</div>
									<div className="space-y-2">
										<AnimatePresence mode="popLayout">
											{isLoadingHistory ? (
												<motion.div
													key="loader"
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													className="flex items-center justify-center py-8"
												>
													<Loader2 className="w-5 h-5 text-primary animate-spin" />
												</motion.div>
											) : recentSearches.length > 0 ? (
												recentSearches.map((search) => (
													<motion.button
														key={search.id}
														variants={STAGGER_ITEM}
														layout
														initial={{ opacity: 0, x: -20 }}
														animate={{ opacity: 1, x: 0 }}
														exit={{ opacity: 0, x: 20 }}
														whileHover={{ x: 4 }}
														type="button"
														onClick={() => handleSearchClick(search.query)}
														className="flex w-full items-center justify-between p-4 bg-card rounded-2xl border border-border/50 hover:border-border hover:shadow-md transition-all cursor-pointer group"
													>
														<span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
															{search.query}
														</span>
														<button
															title="Delete search item"
															type="button"
															onClick={(e) => handleDeleteSearch(search.id, e)}
															className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
														>
															<X className="w-4 h-4" />
														</button>
													</motion.button>
												))
											) : (
												<motion.p
													key="empty"
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													className="text-center text-sm text-muted-foreground py-4"
												>
													No recent searches yet
												</motion.p>
											)}
										</AnimatePresence>
									</div>
								</motion.div>
							)}

							{/* Suggested for You */}
							<motion.div variants={STAGGER_ITEM} className="space-y-4">
								<h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
									Suggested for You
								</h2>
								<motion.div whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}>
									<Card className="p-6 bg-linear-to-br from-primary/5 to-brand-purple/5 border-none rounded-[2.5rem] relative overflow-hidden group cursor-pointer">
										<div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl" />
										<div className="relative z-10 flex items-center gap-6">
											<motion.div
												animate={{ rotate: [0, 10, 0] }}
												transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
												className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center shadow-sm"
											>
												<Sparkles className="w-8 h-8 text-primary" />
											</motion.div>
											<div>
												<h3 className="font-black text-foreground">Mastering Physics P2</h3>
												<p className="text-xs text-muted-foreground font-bold">
													Based on your recent activity
												</p>
											</div>
										</div>
									</Card>
								</motion.div>
							</motion.div>
						</motion.div>
					) : (
						<div className="space-y-10">
							{/* AI Suggestions */}
							<AnimatePresence mode="wait">
								{(isAiLoading || aiResults) && (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										className="space-y-4"
									>
										<div className="flex items-center gap-2 px-1">
											<Sparkles className="w-4 h-4 text-primary" />
											<h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
												MatricMaster AI Suggestions
											</h2>
										</div>
										<Card className="p-6 bg-linear-to-br from-primary/5 to-brand-purple/5 border-none rounded-[2.5rem] relative overflow-hidden">
											{isAiLoading ? (
												<div className="flex items-center justify-center py-4">
													<Loader2 className="w-6 h-6 text-primary animate-spin" />
												</div>
											) : (
												<div className="space-y-4">
													{aiResults?.tip && (
														<p className="text-sm font-medium text-muted-foreground italic">
															"{aiResults.tip}"
														</p>
													)}
													<div className="flex flex-wrap gap-2">
														{aiResults?.suggestions.map((suggestion) => (
															<motion.div
																key={suggestion}
																whileHover={{ scale: 1.05 }}
																whileTap={{ scale: 0.95 }}
															>
																<Badge
																	variant="secondary"
																	className="px-3 py-1.5 rounded-lg bg-card/50 border border-primary/10 text-[11px] font-bold hover:bg-primary/10 transition-colors cursor-pointer"
																	onClick={() => setQuery(suggestion)}
																>
																	{suggestion}
																</Badge>
															</motion.div>
														))}
													</div>
												</div>
											)}
										</Card>
									</motion.div>
								)}
							</AnimatePresence>

							<motion.div
								variants={STAGGER_CONTAINER}
								initial="hidden"
								animate="visible"
								className="space-y-6"
							>
								<h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
									Database Results for "{query}"
								</h2>
								<AnimatePresence mode="popLayout">
									{filteredResults.length > 0 ? (
										<div className="space-y-3">
											{filteredResults.map((paper) => (
												<motion.div
													key={paper.id}
													variants={STAGGER_ITEM}
													layout
													initial={{ opacity: 0, scale: 0.9 }}
													animate={{ opacity: 1, scale: 1 }}
													whileHover={{ y: -2, scale: 1.01 }}
													whileTap={{ scale: 0.99 }}
												>
													<Card
														className="p-4 border-border/50 shadow-sm bg-card rounded-2xl flex items-center justify-between group cursor-pointer hover:shadow-md transition-all"
														onClick={() => router.push(`/past-paper?id=${paper.id}`)}
													>
														<div className="flex items-center gap-4">
															<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
																<FileText className="w-5 h-5 text-primary" />
															</div>
															<div>
																<h4 className="font-black text-foreground text-sm">
																	{paper.subject} {paper.paper}
																</h4>
																<p className="text-[10px] font-bold text-muted-foreground uppercase">
																	{paper.month} {paper.year}
																</p>
															</div>
														</div>
														<Sparkles className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
													</Card>
												</motion.div>
											))}
										</div>
									) : (
										<motion.div
											key="no-results"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-40"
										>
											<div className="w-20 h-20 bg-muted rounded-[2.5rem] flex items-center justify-center">
												<SearchIcon className="w-10 h-10 text-muted-foreground" />
											</div>
											<div className="space-y-1">
												<h3 className="font-black text-muted-foreground uppercase tracking-widest text-xs">
													No matches found
												</h3>
												<p className="text-muted-foreground font-bold">
													Try searching for something else
												</p>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						</div>
					)}
				</main>
			</ScrollArea>
		</div>
	);
}
