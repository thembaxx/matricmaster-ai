import { Download, Eye, FileText, Filter, Search as SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
		<div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
			{/* Header */}
			<header
				className="px-6 py-4 ios-glass sticky top-0 z-20 shrink-0"
				style={{
					paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
				}}
			>
				<div className="max-w-2xl mx-auto w-full relative z-10 flex flex-col gap-4">
					<div className="flex items-center gap-4 pl-14">
						<h1 className="text-xl font-bold text-zinc-500">Past Papers</h1>
					</div>

					<div className="space-y-4">
						<div className="relative">
							<SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search subjects or papers..."
								className="pl-10 bg-zinc-200/50 dark:bg-zinc-800/50 border-none h-10 rounded-xl text-[15px] font-medium focus-visible:ring-2 focus-visible:ring-brand-blue backdrop-blur-sm"
							/>
						</div>

						<div className="flex gap-2 overflow-x-auto no-scrollbar">
							{years.map((year) => (
								<button
																				key={year}
																				type="button"
																															// biome-ignore lint/suspicious/noExplicitAny: Year type casting
																															onClick={() => setSelectedYear(year as any)}																				className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-all ${
																					selectedYear === year											? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
											: 'bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
									}`}
								>
									{year}
								</button>
							))}
						</div>
					</div>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main
					className="px-6 py-8 space-y-4 pb-40 max-w-2xl mx-auto w-full"
					style={{
						paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 160px)',
					}}
				>
					{/* iOS Large Title */}
					<div className="space-y-1 pt-2 mb-6 text-left">
						<h1 className="text-[34px] font-black leading-tight text-zinc-900 dark:text-white tracking-tight">
							Archive
						</h1>
						<p className="text-[17px] font-medium text-zinc-500 dark:text-zinc-400">
							Search and download past exam papers.
						</p>
					</div>

					<div className="flex items-center justify-between mb-2">
						<h2 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest px-1">
							{filteredPapers.length} Papers Found
						</h2>
						<Button variant="ghost" size="sm" className="text-xs font-bold text-brand-blue">
							<Filter className="w-3 h-3 mr-1" />
							Refine
						</Button>
					</div>

					{filteredPapers.length > 0 ? (
						<div className="grid grid-cols-1 gap-4">
							{filteredPapers.map((paper) => (
								<Card
									key={paper.id}
									className="p-5 border-none shadow-sm bg-white dark:bg-zinc-900 rounded-[2rem] group hover:shadow-md transition-all active:scale-[0.98]"
								>
									<div className="flex items-start justify-between mb-4">
										<div className="flex items-center gap-3">
											<div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
												<FileText className="w-6 h-6 text-brand-blue" />
											</div>
											<div>
												<h3 className="font-black text-zinc-900 dark:text-white">
													{paper.subject} {paper.paper}
												</h3>
												<p className="text-xs font-bold text-zinc-500">
													{paper.month} {paper.year}
												</p>
											</div>
										</div>
										<Badge
											variant="secondary"
											className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tighter"
										>
											NSC Grade 12
										</Badge>
									</div>

									<div className="flex items-center gap-4 mb-6 text-xs font-bold text-zinc-500">
										<div className="flex items-center gap-1.5">
											<span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
											{paper.marks} Marks
										</div>
										<div className="flex items-center gap-1.5">
											<span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
											{paper.time}
										</div>
									</div>

									<div className="grid grid-cols-2 gap-3">
										<Button
											variant="outline"
											className="rounded-xl border-zinc-200 dark:border-zinc-800 font-bold text-xs h-10"
											onClick={() => router.push(`/past-paper?id=${paper.id}`)}
										>
											<Eye className="w-4 h-4 mr-2" />
											View
										</Button>
										<Button
											className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs h-10"
											onClick={() => window.open(paper.downloadUrl, '_blank')}
										>
											<Download className="w-4 h-4 mr-2" />
											Download
										</Button>
									</div>
								</Card>
							))}
						</div>
					) : (
						<div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
							<div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-[2.5rem] flex items-center justify-center">
								<FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
							</div>
							<div className="space-y-1">
								<h3 className="font-black text-zinc-400 uppercase tracking-widest text-xs">
									No papers found
								</h3>
								<p className="text-zinc-400 font-bold">Try adjusting your filters</p>
							</div>
						</div>
					)}
				</main>
			</ScrollArea>
		</div>
	);
}
