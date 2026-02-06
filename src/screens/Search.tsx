// import type { Screen } from '@/types'; // Removed unused import
import { Clock, FileText, Loader2, Search as SearchIcon, Sparkles, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PAST_PAPERS } from '@/constants/mock-data';
import { smartSearch } from '@/services/geminiService';

export default function Search() {
	const router = useRouter();
	const [query, setQuery] = useState('');
	const [aiResults, setAiResults] = useState<{ suggestions: string[]; tip: string } | null>(null);
	const [isAiLoading, setIsAiLoading] = useState(false);

	useEffect(() => {
		const timer = setTimeout(async () => {
			if (query.length > 3) {
				setIsAiLoading(true);
				const results = await smartSearch(query);
				setAiResults(results);
				setIsAiLoading(false);
			} else {
				setAiResults(null);
			}
		}, 800);

		return () => clearTimeout(timer);
	}, [query]);

	const filteredResults = query
		? PAST_PAPERS.filter(
				(p) =>
					p.subject.toLowerCase().includes(query.toLowerCase()) ||
					p.paper.toLowerCase().includes(query.toLowerCase())
			)
		: [];

	return (
		<div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 font-lexend">
			<div className="px-6 pt-12 pb-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
				<div className="max-w-2xl mx-auto w-full">
					<h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-6">Search</h1>
					<div className="relative">
						<SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-400" />
						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Topics, questions, past papers..."
							className="pl-12 bg-zinc-100 dark:bg-zinc-800 border-none h-14 rounded-2xl text-base font-medium focus-visible:ring-2 focus-visible:ring-brand-blue"
						/>
					</div>
				</div>
			</div>

			<ScrollArea className="flex-1">
				<main className="px-6 py-8 max-w-2xl mx-auto w-full space-y-10 pb-40">
					{!query ? (
						<>
							{/* Trending Section */}
							<div className="space-y-6">
								<div className="flex items-center gap-2 px-1">
									<TrendingUp className="w-4 h-4 text-brand-blue" />
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
							<div className="space-y-4">
								<div className="flex items-center gap-2 px-1">
									<Clock className="w-4 h-4 text-zinc-400" />
									<h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
										Recent Searches
									</h2>
								</div>
								<div className="space-y-2">
									{[
										'Euclidean Geometry Grade 12',
										'Internal Resistance Experiments',
										'DNA Replication Steps',
									].map((search) => (
										<div
											key={search}
											className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-50 dark:border-zinc-800/50 hover:border-zinc-200 transition-colors cursor-pointer group"
										>
											<span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white">
												{search}
											</span>
											<SearchIcon className="w-4 h-4 text-zinc-300" />
										</div>
									))}
								</div>
							</div>

							{/* Suggested for You */}
							<div className="space-y-4">
								<h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
									Suggested for You
								</h2>
								<Card className="p-6 bg-gradient-to-br from-brand-blue/5 to-brand-purple/5 border-none rounded-[2.5rem] relative overflow-hidden group cursor-pointer">
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
									<Card className="p-6 bg-gradient-to-br from-brand-blue/5 to-brand-purple/5 border-none rounded-[2.5rem] relative overflow-hidden">
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
