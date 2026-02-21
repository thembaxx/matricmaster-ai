'use client';

import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
	ChevronRight,
	Clock,
	FileText,
	Loader2,
	Search as SearchIcon,
	Sparkles,
	Trash2,
	X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
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
	const router = useRouter();
	const { data: session } = useSession();
	const [query, setQuery] = useState('');
	const [aiResults, setAiResults] = useState<{ suggestions: string[]; tip: string } | null>(null);
	const [isAiLoading, setIsAiLoading] = useState(false);
	const [recentSearches, setRecentSearches] = useState<SearchHistory[]>([]);
	const [isLoadingHistory, setIsLoadingHistory] = useState(true);
	const [papers, setPapers] = useState<PastPaper[]>([]);
	const [_isLoadingPapers, setIsLoadingPapers] = useState(true);

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

	// Load past papers
	useEffect(() => {
		const loadPapers = async () => {
			try {
				const data = await getPastPapersAction();
				setPapers(data);
			} catch (error) {
				console.error('Failed to load papers:', error);
			} finally {
				setIsLoadingPapers(false);
			}
		};
		loadPapers();
	}, []);

	// Filter papers based on search query

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

	const handleSearchClick = (searchQuery: string) => {
		setQuery(searchQuery);
	};

	return (
		<div className="flex flex-col h-full bg-background lg:px-8">
			<div className="px-6 py-6 bg-background shrink-0 lg:px-0">
				<div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
					<div className="space-y-1">
						<h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">
							Search
						</h1>
						<p className="text-muted-foreground font-bold text-sm">
							Find topics, questions, and past papers
						</p>
					</div>
					<motion.div
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className="relative"
					>
						<SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="What are you looking for?"
							className="pl-14 bg-muted/30 h-16 rounded-[1.5rem] border-2 text-lg font-bold focus:ring-primary/20"
						/>
						<AnimatePresence>
							{query && (
								<motion.button
									initial={{ scale: 0, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0, opacity: 0 }}
									title="Clear search"
									aria-label="Clear search"
									type="button"
									onClick={() => setQuery('')}
									className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
								>
									<X className="w-6 h-6" />
								</motion.button>
							)}
						</AnimatePresence>
					</motion.div>
				</div>
			</div>

			<ScrollArea className="flex-1 no-scrollbar">
				<main className="px-6 py-8 max-w-4xl mx-auto w-full space-y-12 pb-32 lg:px-0">
					{!query ? (
						<motion.div
							variants={STAGGER_CONTAINER}
							initial="hidden"
							animate="visible"
							className="space-y-12"
						>
							{/* Trending Section */}
							<motion.div variants={STAGGER_ITEM} className="space-y-6">
								<div className="flex items-center gap-2">
									<Icon icon="fluent-emoji-flat:fire" className="w-5 h-5" />
									<h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
										Trending Now
									</h2>
								</div>
								<div className="flex flex-wrap gap-3">
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
												className="px-6 py-3 rounded-2xl bg-card text-sm font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer border-2 border-border shadow-sm"
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
								<motion.div variants={STAGGER_ITEM} className="space-y-6">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Clock className="w-4 h-4 text-muted-foreground" />
											<h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
												History
											</h2>
										</div>
										{recentSearches.length > 0 && (
											<Button
												variant="ghost"
												size="sm"
												onClick={handleClearAllSearches}
												className="h-8 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-rose-500"
											>
												<Trash2 className="w-4 h-4 mr-2" />
												Clear All
											</Button>
										)}
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										<AnimatePresence mode="popLayout">
											{isLoadingHistory ? (
												<div className="col-span-full flex items-center justify-center py-12">
													<Loader2 className="w-8 h-8 text-primary animate-spin" />
												</div>
											) : recentSearches.length > 0 ? (
												recentSearches.map((search) => (
													<motion.button
														key={search.id}
														variants={STAGGER_ITEM}
														layout
														initial={{ opacity: 0, scale: 0.9 }}
														animate={{ opacity: 1, scale: 1 }}
														exit={{ opacity: 0, scale: 0.9 }}
														whileHover={{ x: 4 }}
														type="button"
														onClick={() => handleSearchClick(search.query)}
														className="flex items-center justify-between p-5 bg-card rounded-[1.5rem] border-2 border-border/50 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group"
													>
														<span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
															{search.query}
														</span>
														<button
															title="Delete search item"
															type="button"
															onClick={(e) => handleDeleteSearch(search.id, e)}
															className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-rose-500 p-2"
														>
															<X className="w-5 h-5" />
														</button>
													</motion.button>
												))
											) : (
												<div className="col-span-full py-12 text-center opacity-40">
													<p className="text-sm font-bold uppercase tracking-widest">
														No history yet
													</p>
												</div>
											)}
										</AnimatePresence>
									</div>
								</motion.div>
							)}

							{/* Suggested Section */}
							<motion.div variants={STAGGER_ITEM} className="space-y-6">
								<h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
									Suggested for You
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<motion.div whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}>
										<Card className="p-8 bg-linear-to-br from-primary/10 to-brand-purple/10 border-none rounded-[2.5rem] relative overflow-hidden group cursor-pointer h-full">
											<div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-125 transition-transform duration-700" />
											<div className="relative z-10 flex items-center gap-8">
												<div className="w-20 h-20 rounded-[1.5rem] bg-card flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform">
													<Sparkles className="w-10 h-10 text-brand-amber" />
												</div>
												<div className="space-y-1">
													<h3 className="text-xl font-black text-foreground tracking-tighter uppercase">
														Physics Mastery
													</h3>
													<p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
														Personalized Challenges
													</p>
												</div>
											</div>
										</Card>
									</motion.div>
									<motion.div whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}>
										<Card className="p-8 bg-linear-to-br from-emerald-500/10 to-primary/10 border-none rounded-[2.5rem] relative overflow-hidden group cursor-pointer h-full">
											<div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-125 transition-transform duration-700" />
											<div className="relative z-10 flex items-center gap-8">
												<div className="w-20 h-20 rounded-[1.5rem] bg-card flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform">
													<Icon
														icon="fluent:hat-graduation-24-filled"
														className="w-10 h-10 text-emerald-500"
													/>
												</div>
												<div className="space-y-1">
													<h3 className="text-xl font-black text-foreground tracking-tighter uppercase">
														Past Paper Vault
													</h3>
													<p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
														Over 10,000 resources
													</p>
												</div>
											</div>
										</Card>
									</motion.div>
								</div>
							</motion.div>
						</motion.div>
					) : (
						<div className="space-y-12">
							{/* AI Insights */}
							<AnimatePresence mode="wait">
								{(isAiLoading || aiResults) && (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										className="space-y-6"
									>
										<div className="flex items-center gap-2">
											<Sparkles className="w-5 h-5 text-primary" />
											<h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
												AI Insights
											</h2>
										</div>
										<Card className="p-8 bg-zinc-900 text-white rounded-[3rem] relative overflow-hidden border-none shadow-2xl">
											<div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32" />
											{isAiLoading ? (
												<div className="flex items-center justify-center py-12">
													<Loader2 className="w-10 h-10 text-primary animate-spin" />
												</div>
											) : (
												<div className="space-y-8 relative z-10">
													{aiResults?.tip && (
														<p className="text-lg md:text-xl font-bold leading-relaxed text-white/90 italic">
															"{aiResults.tip}"
														</p>
													)}
													<div className="flex flex-wrap gap-3">
														{aiResults?.suggestions.map((suggestion) => (
															<motion.div
																key={suggestion}
																whileHover={{ scale: 1.05 }}
																whileTap={{ scale: 0.95 }}
															>
																<Badge
																	variant="secondary"
																	className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-zinc-900 transition-all cursor-pointer"
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

							{/* Search Results */}
							<motion.div
								variants={STAGGER_CONTAINER}
								initial="hidden"
								animate="visible"
								className="space-y-6"
							>
								<h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
									Database Findings ({filteredResults.length})
								</h2>
								<AnimatePresence mode="popLayout">
									{filteredResults.length > 0 ? (
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{filteredResults.map((paper) => (
												<motion.div
													key={paper.id}
													variants={STAGGER_ITEM}
													layout
													initial={{ opacity: 0, scale: 0.9 }}
													animate={{ opacity: 1, scale: 1 }}
													whileHover={{ y: -4, scale: 1.02 }}
													whileTap={{ scale: 0.98 }}
												>
													<Card
														className="p-6 border-2 border-border/50 shadow-sm bg-card rounded-[2rem] flex items-center justify-between group cursor-pointer hover:border-primary/20 hover:shadow-2xl transition-all"
														onClick={() => router.push(`/past-paper?id=${paper.id}`)}
													>
														<div className="flex items-center gap-5">
															<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
																<FileText className="w-6 h-6 text-primary" />
															</div>
															<div>
																<h4 className="font-black text-foreground text-base tracking-tight uppercase">
																	{paper.subject} {paper.paper}
																</h4>
																<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
																	{paper.month} {paper.year}
																</p>
															</div>
														</div>
														<div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-all">
															<ChevronRight className="w-5 h-5" />
														</div>
													</Card>
												</motion.div>
											))}
										</div>
									) : (
										<motion.div
											key="no-results"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											className="py-32 flex flex-col items-center justify-center text-center space-y-6 opacity-40"
										>
											<div className="w-32 h-32 bg-muted rounded-[3.5rem] flex items-center justify-center">
												<SearchIcon className="w-16 h-16 text-muted-foreground" />
											</div>
											<div className="space-y-2">
												<h3 className="font-black text-muted-foreground uppercase tracking-widest text-sm">
													Nothing here
												</h3>
												<p className="text-muted-foreground font-bold">
													Try a different search term
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
