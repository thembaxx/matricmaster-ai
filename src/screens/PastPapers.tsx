'use client';

import { AnimatePresence, m } from 'framer-motion';
import {
	BookOpen,
	Download,
	Eye,
	FileText,
	Filter,
	Loader2,
	Search as SearchIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { getPastPapersAction } from '@/lib/db/actions';
import type { PastPaper } from '@/lib/db/schema';

export default function PastPapers() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedYear, setSelectedYear] = useState<number | 'All'>('All');
	const [papers, setPapers] = useState<PastPaper[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const years = ['All', 2024, 2023, 2022, 2021, 2020];

	useEffect(() => {
		const fetchPapers = async () => {
			try {
				const data = await getPastPapersAction();
				setPapers(data);
			} catch (error) {
				console.error('Failed to load past papers:', error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchPapers();
	}, []);

	const filteredPapers = papers.filter((paper) => {
		const matchesSearch =
			paper.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
			paper.paper.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesYear = selectedYear === 'All' || paper.year === selectedYear;
		return matchesSearch && matchesYear;
	});

	return (
		<div className="flex flex-col h-full bg-background relative overflow-hidden lg:px-8">
			<BackgroundMesh variant="subtle" />

			{/* Header */}
			<header className="px-6 py-12 bg-background shrink-0 lg:px-0">
				<div className="max-w-7xl mx-auto w-full space-y-12">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
						<div className="space-y-2">
							<h1 className="text-4xl lg:text-7xl font-black text-foreground tracking-tighter uppercase">
								Past Paper Vault
							</h1>
							<p className="text-muted-foreground font-bold lg:text-lg">
								Access thousands of Grade 12 exam papers
							</p>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								className="rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest px-6 h-12"
							>
								<Filter className="w-4 h-4 mr-2" />
								Advanced Filter
							</Button>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
						<div className="lg:col-span-8 relative">
							<SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search subjects or papers..."
								className="pl-16 bg-muted/30 backdrop-blur-md border-2 h-16 rounded-2xl text-lg font-bold shadow-inner"
							/>
						</div>
						<div className="lg:col-span-4 flex gap-3 overflow-x-auto no-scrollbar py-1">
							{years.map((year) => (
								<button
									key={year}
									type="button"
									// biome-ignore lint/suspicious/noExplicitAny: Year type casting
									onClick={() => setSelectedYear(year as any)}
									className={`rounded-2xl px-8 py-3 text-[11px] font-black uppercase tracking-widest transition-all h-16 whitespace-nowrap ${
										selectedYear === year
											? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/30'
											: 'bg-muted/50 text-muted-foreground border-2 border-transparent hover:border-border backdrop-blur-sm'
									}`}
								>
									{year}
								</button>
							))}
						</div>
					</div>
				</div>
			</header>

			<ScrollArea className="flex-1 no-scrollbar">
				<main className="px-6 py-8 max-w-7xl mx-auto w-full space-y-12 pb-32 lg:px-0">
					<div className="flex items-center justify-between border-b-2 border-border/50 pb-4">
						<h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
							Archive Results ({filteredPapers.length})
						</h2>
					</div>

					<AnimatePresence mode="popLayout">
						{isLoading ? (
							<div className="flex items-center justify-center py-20">
								<Loader2 className="w-8 h-8 animate-spin text-primary" />
							</div>
						) : filteredPapers.length > 0 ? (
							<m.div
								variants={STAGGER_CONTAINER}
								initial="hidden"
								animate="visible"
								className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
							>
								{filteredPapers.map((paper) => (
									<m.div key={paper.id} variants={STAGGER_ITEM} layout whileHover={{ y: -8 }}>
										<Card className="p-8 rounded-[3rem] border-2 border-border/50 hover:border-primary/20 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden bg-card/50 backdrop-blur-sm">
											<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

											<div className="space-y-6 relative z-10">
												<div className="flex items-start justify-between">
													<div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
														<FileText className="w-8 h-8 text-primary" />
													</div>
													<div className="text-right">
														<span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block mb-1">
															Total Marks
														</span>
														<span className="text-2xl font-black text-primary tracking-tighter">
															{paper.totalMarks}m
														</span>
													</div>
												</div>

												<div className="space-y-2">
													<h3 className="text-2xl font-black text-foreground tracking-tighter uppercase leading-tight group-hover:text-primary transition-colors">
														{paper.subject} {paper.paper}
													</h3>
													<div className="flex flex-wrap gap-2">
														<Badge
															variant="outline"
															className="rounded-lg font-black text-[9px] uppercase tracking-widest border-2"
														>
															{paper.month} {paper.year}
														</Badge>
														<Badge
															variant="outline"
															className="rounded-lg font-black text-[9px] uppercase tracking-widest border-2"
														>
															NSC Grade 12
														</Badge>
													</div>
												</div>

												<div className="grid grid-cols-2 gap-3 pt-4">
													<Button
														variant="secondary"
														className="rounded-2xl font-black text-[10px] uppercase tracking-widest h-12 shadow-sm"
														onClick={() => router.push(`/past-paper?id=${paper.id}`)}
													>
														<Eye className="w-4 h-4 mr-2" />
														Analyze
													</Button>
													<Button
														variant="outline"
														className="rounded-2xl font-black text-[10px] uppercase tracking-widest h-12 border-2"
														onClick={() => router.push(`/past-paper?id=${paper.id}&mode=read`)}
													>
														<BookOpen className="w-4 h-4 mr-2" />
														Read
													</Button>
												</div>

												<Button
													className="w-full rounded-2xl h-14 bg-muted hover:bg-primary hover:text-primary-foreground text-muted-foreground font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 group/btn"
													onClick={() => window.open(paper.originalPdfUrl, '_blank')}
												>
													<Download className="w-4 h-4 mr-2 group-hover/btn:animate-bounce" />
													Download PDF
												</Button>
											</div>
										</Card>
									</m.div>
								))}
							</m.div>
						) : (
							<m.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								className="py-32 flex flex-col items-center justify-center text-center space-y-6 opacity-40"
							>
								<div className="w-32 h-32 bg-muted rounded-[3.5rem] flex items-center justify-center">
									<FileText className="w-16 h-16 text-muted-foreground" />
								</div>
								<div className="space-y-2">
									<h3 className="font-black text-muted-foreground uppercase tracking-[0.4em] text-xs">
										Empty Archive
									</h3>
									<p className="text-muted-foreground font-bold">
										Refine your filters to see more results
									</p>
								</div>
							</m.div>
						)}
					</AnimatePresence>
				</main>
			</ScrollArea>
		</div>
	);
}
