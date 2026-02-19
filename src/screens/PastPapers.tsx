'use client';

import { BookOpen, Download, Eye, FileText, Filter, Search as SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PAST_PAPERS } from '@/constants/mock-data';

export default function PastPapers() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedYear, setSelectedYear] = useState<number | 'All'>('All');

	const years = ['All', 2024, 2023, 2022, 2021, 2020];

	const filteredPapers = PAST_PAPERS.filter((paper) => {
		const matchesSearch =
			paper.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
			paper.paper.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesYear = selectedYear === 'All' || paper.year === selectedYear;
		return matchesSearch && matchesYear;
	});

	return (
		<div className="flex flex-col h-full bg-background relative overflow-hidden">
			<BackgroundMesh variant="subtle" />
			{/* Header */}
			<header
				className="px-6 py-4 sticky top-0 z-20 shrink-0 bg-card/70 backdrop-blur-xl border-b border-border"
				style={{
					paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
				}}
			>
				<div className="max-w-2xl mx-auto w-full relative z-10 flex flex-col gap-4">
					<div className="flex items-center gap-4 pl-14">
						<h1 className="text-xl font-bold text-muted-foreground">Past Papers</h1>
					</div>

					<div className="space-y-4">
						<div className="relative">
							<SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search subjects or papers..."
								className="pl-10 bg-muted border-none h-10 rounded-xl text-[15px] font-medium backdrop-blur-sm"
							/>
						</div>

						<nav className="flex gap-2 overflow-x-auto no-scrollbar" aria-label="Year filter">
							{years.map((year) => (
								<button
									key={year}
									type="button"
									// biome-ignore lint/suspicious/noExplicitAny: Year type casting
									onClick={() => setSelectedYear(year as any)}
									aria-pressed={selectedYear === year}
									className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-all ${
										selectedYear === year
											? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
											: 'bg-muted text-muted-foreground hover:text-foreground'
									}`}
								>
									{year}
								</button>
							))}
						</nav>
					</div>
				</div>
			</header>

			<ScrollArea className="flex-1 relative z-10">
				<main
					className="px-6 py-8 space-y-4 pb-40 max-w-2xl mx-auto w-full"
					style={{
						paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 160px)',
					}}
				>
					{/* iOS Large Title */}
					<div className="space-y-1 pt-2 mb-6 text-left">
						<h1 className="text-[34px] font-black leading-tight text-foreground tracking-tight">
							Archive
						</h1>
						<p className="text-[17px] font-medium text-muted-foreground">
							Search and download past exam papers.
						</p>
					</div>

					<div className="flex items-center justify-between mb-2">
						<h2 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest px-1">
							{filteredPapers.length} Papers Found
						</h2>
						<Button variant="ghost" size="sm" className="text-xs font-bold text-primary">
							<Filter className="w-3 h-3 mr-1" />
							Refine
						</Button>
					</div>

					{filteredPapers.length > 0 ? (
						<div className="grid grid-cols-1 gap-4">
							{filteredPapers.map((paper) => (
								<Card
									key={paper.id}
									className="p-5 premium-glass border-none rounded-[2rem] group hover:scale-[1.01] transition-all active:scale-[0.99] premium-glass-hover"
								>
									<div className="flex items-start justify-between mb-4">
										<div className="flex items-center gap-3">
											<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
												<FileText className="w-6 h-6 text-primary" />
											</div>
											<div>
												<h3 className="font-bold text-foreground text-[15px] tracking-wide truncate">
													{paper.subject} {paper.paper}
												</h3>
												<p className="text-xs font-semibold text-muted-foreground tracking-wide">
													{paper.month} {paper.year}
												</p>
											</div>
										</div>
									</div>

									<div className="flex items-center gap-4 mb-6 text-xs font-bold text-muted-foreground">
										<Badge
											variant="secondary"
											className="px-3 py-1 text-[10px] uppercase tracking-tighter"
										>
											NSC Grade 12
										</Badge>
										<div className="flex items-center gap-1.5">
											<span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
											{paper.marks} Marks
										</div>
										<div className="flex items-center gap-1.5">
											<span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
											{paper.time}
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Button
											variant="secondary"
											className="grow rounded-xl font-bold text-xs h-10"
											onClick={() => router.push(`/past-paper?id=${paper.id}`)}
										>
											<Eye className="w-4 h-4" />
											Smart view
										</Button>
										<Button
											variant="outline"
											className="grow rounded-xl font-bold text-xs h-10"
											onClick={() => router.push(`/past-paper?id=${paper.id}&mode=read`)}
										>
											<BookOpen className="w-4 h-4" />
											View
										</Button>
										<Button
											size="icon"
											variant="outline"
											className="font-bold text-xs h-10 w-10"
											onClick={() => window.open(paper.downloadUrl, '_blank')}
											aria-label="Download paper"
										>
											<Download className="w-4 h-4" />
										</Button>
									</div>
								</Card>
							))}
						</div>
					) : (
						<div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
							<div className="w-20 h-20 bg-muted rounded-[2.5rem] flex items-center justify-center">
								<FileText className="w-10 h-10 text-muted-foreground" />
							</div>
							<div className="space-y-1">
								<h3 className="font-black text-muted-foreground uppercase tracking-widest text-xs">
									No papers found
								</h3>
								<p className="text-muted-foreground font-bold">Try adjusting your filters</p>
							</div>
						</div>
					)}
				</main>
			</ScrollArea>
		</div>
	);
}
