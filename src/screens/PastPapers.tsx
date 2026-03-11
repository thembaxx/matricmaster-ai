'use client';

import { Icon } from '@iconify/react';
import { BookOpen01Icon as BookOpen, Loading03Icon as CircleNotch, FilterIcon as Faders, File01Icon as FileText, Cancel01Icon as X, Search01Icon as MagnifyingGlass, CloudDownloadIcon as Download, SparklesIcon as Sparkle } from 'hugeicons-react';
import { AnimatePresence, m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { getPastPapersAction } from '@/lib/db/actions';
import type { PastPaper } from '@/lib/db/schema';
import { cn } from '@/lib/utils';

interface FilterContentProps {
	availableSubjects: string[];
	availablePapers: string[];
	availableMonths: string[];
	selectedSubjects: string[];
	selectedPapers: string[];
	selectedMonths: string[];
	extractedOnly: boolean;
	onToggleSubject: (subject: string) => void;
	onTogglePaper: (paper: string) => void;
	onToggleMonth: (month: string) => void;
	onToggleExtracted: (value: boolean) => void;
}

const FilterContent = memo(function FilterContent({
	availableSubjects,
	availablePapers,
	availableMonths,
	selectedSubjects,
	selectedPapers,
	selectedMonths,
	extractedOnly,
	onToggleSubject,
	onTogglePaper,
	onToggleMonth,
	onToggleExtracted,
}: FilterContentProps) {
	return (
		<div className="space-y-8">
			<div className="space-y-4">
				<h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-label-tertiary">
					Subjects
				</h4>
				<div className="grid grid-cols-2 gap-3">
					{availableSubjects.map((subject) => (
						<div key={subject} className="flex items-center gap-3 cursor-pointer ios-active-scale">
							<Checkbox
								id={`subject-${subject}`}
								checked={selectedSubjects.includes(subject)}
								onCheckedChange={() => onToggleSubject(subject)}
							/>
							<label
								htmlFor={`subject-${subject}`}
								className="text-sm font-black uppercase tracking-tight cursor-pointer text-label-secondary"
							>
								{subject}
							</label>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-4">
				<h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-label-tertiary">
					Paper TextT
				</h4>
				<div className="grid grid-cols-2 gap-3">
					{availablePapers.map((paper) => (
						<div key={paper} className="flex items-center gap-3 cursor-pointer ios-active-scale">
							<Checkbox
								id={`paper-${paper}`}
								checked={selectedPapers.includes(paper)}
								onCheckedChange={() => onTogglePaper(paper)}
							/>
							<label
								htmlFor={`paper-${paper}`}
								className="text-sm font-black uppercase tracking-tight cursor-pointer text-label-secondary"
							>
								{paper}
							</label>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-4">
				<h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-label-tertiary">
					Month
				</h4>
				<div className="grid grid-cols-2 gap-3">
					{availableMonths.map((month) => (
						<div key={month} className="flex items-center gap-3 cursor-pointer ios-active-scale">
							<Checkbox
								id={`month-${month}`}
								checked={selectedMonths.includes(month)}
								onCheckedChange={() => onToggleMonth(month)}
							/>
							<label
								htmlFor={`month-${month}`}
								className="text-sm font-black uppercase tracking-tight cursor-pointer text-label-secondary"
							>
								{month}
							</label>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-label-tertiary">
							Extracted Only
						</h4>
						<p className="text-[10px] text-label-tertiary mt-1 uppercase tracking-wider">
							Show papers with digitised questions
						</p>
					</div>
					<Switch checked={extractedOnly} onCheckedChange={onToggleExtracted} />
				</div>
			</div>
		</div>
	);
});

export default function PastPapers() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedYear, setSelectedYear] = useState<number | 'All'>('All');
	const [papers, setPapers] = useState<PastPaper[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
	const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
	const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
	const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
	const [extractedOnly, setExtractedOnly] = useState(false);

	const years = useMemo(() => ['All', 2024, 2023, 2022, 2021, 2020], []);

	// Performance: Memoize extracted fields to avoid O(N) recalculation on every render
	const availableSubjects = useMemo(
		() => [...new Set(papers.map((p) => p.subject))].sort(),
		[papers]
	);
	const availablePapers = useMemo(() => [...new Set(papers.map((p) => p.paper))].sort(), [papers]);
	const availableMonths = useMemo(() => [...new Set(papers.map((p) => p.month))].sort(), [papers]);

	const activeFilterCount =
		selectedSubjects.length +
		selectedPapers.length +
		selectedMonths.length +
		(extractedOnly ? 1 : 0);

	const clearAllFilters = useCallback(() => {
		setSelectedSubjects([]);
		setSelectedPapers([]);
		setSelectedMonths([]);
		setExtractedOnly(false);
	}, []);

	const toggleArrayItem = useCallback(
		(setArr: (v: string[] | ((prev: string[]) => string[])) => void, item: string) => {
			setArr((prev) => {
				if (prev.includes(item)) {
					return prev.filter((i) => i !== item);
				}
				return [...prev, item];
			});
		},
		[]
	);

	const handleToggleSubject = useCallback(
		(subject: string) => toggleArrayItem(setSelectedSubjects, subject),
		[toggleArrayItem]
	);

	const handleTogglePaper = useCallback(
		(paper: string) => toggleArrayItem(setSelectedPapers, paper),
		[toggleArrayItem]
	);

	const handleToggleMonth = useCallback(
		(month: string) => toggleArrayItem(setSelectedMonths, month),
		[toggleArrayItem]
	);

	const handleToggleExtracted = useCallback((value: boolean) => setExtractedOnly(value), []);

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

	// Performance: Memoize filtered results to avoid re-filtering on every render
	// (e.g. when opening drawers or clicking unrelated UI elements)
	const filteredPapers = useMemo(() => {
		return papers.filter((paper) => {
			const matchesSearch =
				paper.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
				paper.paper.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesYear = selectedYear === 'All' || paper.year === selectedYear;
			const matchesSubjects =
				selectedSubjects.length === 0 || selectedSubjects.includes(paper.subject);
			const matchesPapers = selectedPapers.length === 0 || selectedPapers.includes(paper.paper);
			const matchesMonths = selectedMonths.length === 0 || selectedMonths.includes(paper.month);
			const matchesExtracted = !extractedOnly || paper.isExtracted;
			return (
				matchesSearch &&
				matchesYear &&
				matchesSubjects &&
				matchesPapers &&
				matchesMonths &&
				matchesExtracted
			);
		});
	}, [
		papers,
		searchQuery,
		selectedYear,
		selectedSubjects,
		selectedPapers,
		selectedMonths,
		extractedOnly,
	]);

	return (
		<div className="flex flex-col h-full min-w-0 bg-white dark:bg-zinc-950 relative overflow-x-hidden lg:px-12">
			<BackgroundMesh variant="subtle" />

			{/* Header */}
			<header className="px-6 sm:px-10 pb-10 sm:py-20 pt-32 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl shrink-0 lg:px-0">
				<div className="max-w-7xl mx-auto w-full space-y-12 sm:space-y-16">
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-12">
						<div className="space-y-3">
							<h1 className="text-5xl sm:text-7xl lg:text-9xl font-black text-foreground tracking-tighter leading-none">
								Vault
							</h1>
							<p className="text-muted-foreground/40 font-black text-lg sm:text-2xl uppercase tracking-[0.3em] leading-none">
								Grade 12 archive
							</p>
						</div>
						<div className="flex items-center gap-3">
							{activeFilterCount > 0 && (
								<Button
									variant="ghost"
									onClick={clearAllFilters}
									className="h-14 px-6 rounded-2xl bg-tiimo-pink/10 text-tiimo-pink font-black text-xs uppercase tracking-widest hover:bg-tiimo-pink hover:text-white transition-all ios-active-scale"
								>
									<X size={20} className="mr-2 stroke-[3px]" />
									Reset
								</Button>
							)}
							<Button
								variant="ghost"
								onClick={() => setIsAdvancedFilterOpen(true)}
								className={cn(
									'h-14 px-8 rounded-2xl bg-muted/10 font-black text-xs uppercase tracking-widest transition-all ios-active-scale border-none shadow-sm',
									activeFilterCount > 0 && 'bg-primary text-white shadow-xl shadow-primary/20'
								)}
							>
								<Faders size={20} className="mr-3 stroke-[3px]" />
								<span>Filters</span>
								{activeFilterCount > 0 && (
									<div className="ml-3 h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center text-[10px]">
										{activeFilterCount}
									</div>
								)}
							</Button>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
						<div className="lg:col-span-8 flex items-center relative group">
							<MagnifyingGlass
								size={24}
								className="absolute left-6 z-10 text-muted-foreground/30 stroke-[3px] group-focus-within:text-primary transition-colors"
							/>
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search papers..."
								className="h-20 pl-16 pr-16 bg-muted/10 border-none rounded-[2.5rem] text-xl font-bold placeholder:text-muted-foreground/30 focus:ring-4 focus:ring-primary/5 transition-all"
								aria-label="Search past papers"
							/>
							<AnimatePresence>
								{searchQuery && (
									<m.button
										initial={{ scale: 0.8, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										exit={{ scale: 0.8, opacity: 0 }}
										onClick={() => setSearchQuery('')}
										className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-tiimo-pink transition-colors ios-active-scale"
									>
										<X size={24} className="stroke-[3px]" />
									</m.button>
								)}
							</AnimatePresence>
						</div>
						<div className="lg:col-span-4 flex gap-3 overflow-x-auto no-scrollbar py-2">
							{years.map((year) => (
								<button
									key={year}
									type="button"
									// biome-ignore lint/suspicious/noExplicitAny: Year type casting
									onClick={() => setSelectedYear(year as any)}
									className={cn(
										"h-20 min-w-[100px] rounded-[1.75rem] px-8 text-lg font-black transition-all ios-active-scale shadow-sm",
										selectedYear === year
											? 'bg-primary text-white shadow-xl shadow-primary/30 scale-105'
											: 'bg-muted/10 text-muted-foreground/40 hover:bg-muted/20'
									)}
								>
									{year}
								</button>
							))}
						</div>
					</div>
				</div>
			</header>

			<ScrollArea className="flex-1 no-scrollbar px-6 sm:px-10 lg:px-0">
				<main className="max-w-7xl mx-auto w-full space-y-12 sm:space-y-16 pb-64">
					<div className="flex items-center justify-between border-b border-muted/10 pb-6 px-2">
						<h2 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">
							Available sessions ({filteredPapers.length})
						</h2>
					</div>

					<AnimatePresence mode="popLayout">
						{isLoading ? (
							<div className="flex items-center justify-center py-40">
								<CircleNotch size={64} className="animate-spin text-primary opacity-20" />
							</div>
						) : filteredPapers.length > 0 ? (
							<m.div
								variants={STAGGER_CONTAINER}
								initial="hidden"
								animate="visible"
								className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12"
							>
								{filteredPapers.map((paper) => (
									<m.div key={paper.id} variants={STAGGER_ITEM} layout whileHover={{ y: -12 }}>
										<Card className="p-10 rounded-[3.5rem] border-none bg-card shadow-[0_20px_60px_rgba(0,0,0,0.06)] hover:shadow-[0_40px_100px_rgba(0,0,0,0.12)] transition-all duration-700 group relative overflow-hidden">
											<div className="absolute -top-10 -right-10 w-40 h-40 bg-tiimo-blue/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

											<div className="space-y-8 relative z-10">
												<div className="flex items-start justify-between">
													<div className="w-20 h-20 rounded-[1.5rem] bg-tiimo-blue text-white flex items-center justify-center group-hover:rotate-12 transition-transform duration-700 shadow-xl shadow-tiimo-blue/20">
														<FileText size={36} className="stroke-[3px]" />
													</div>
													<div className="text-right space-y-1">
														<span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] block">
															Value
														</span>
														<span className="text-3xl font-black text-tiimo-blue tracking-tighter">
															{paper.totalMarks}m
														</span>
													</div>
												</div>

												<div className="space-y-4">
													<h3 className="text-3xl font-black text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors">
														{paper.subject} <br />
														<span className="text-muted-foreground/40">{paper.paper}</span>
													</h3>
													<div className="flex flex-wrap gap-2">
														<div className="h-8 px-4 rounded-xl bg-muted/10 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
															{paper.month} {paper.year}
														</div>
														<div className="h-8 px-4 rounded-xl bg-muted/10 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
															NSC Exam
														</div>
													</div>
												</div>

												<div className="grid grid-cols-2 gap-4 pt-4">
													<Button
														onClick={() => router.push(`/past-paper?id=${paper.id}`)}
														className="h-14 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all gap-2"
													>
														<Sparkle size={18} className="stroke-[3.5px]" />
														Focus
													</Button>
													<Button
														variant="ghost"
														onClick={() => router.push(`/past-paper?id=${paper.id}&mode=read`)}
														className="h-14 rounded-2xl bg-muted/10 font-black text-xs uppercase tracking-widest hover:bg-muted/20 transition-all gap-2"
													>
														<BookOpen size={18} className="stroke-[3px]" />
														Read
													</Button>
												</div>

												<Button
													variant="ghost"
													onClick={() => window.open(paper.originalPdfUrl, '_blank')}
													className="w-full h-14 rounded-2xl bg-muted/5 hover:bg-tiimo-blue hover:text-white font-black text-[10px] uppercase tracking-widest transition-all duration-500 gap-3 group/dl"
												>
													<Download size={20} className="stroke-[3px] group-hover/dl:translate-y-0.5 transition-transform" />
													PDF download
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
								className="py-40 flex flex-col items-center justify-center text-center space-y-8"
							>
								<div className="w-32 h-32 bg-muted/10 rounded-[2.5rem] flex items-center justify-center">
									<FileText size={48} className="text-muted-foreground/20 stroke-[3px]" />
								</div>
								<div className="space-y-2">
									<h3 className="text-2xl font-black text-muted-foreground/30 uppercase tracking-[0.4em]">
										Vault empty
									</h3>
									<p className="text-muted-foreground/20 font-bold">
										Try adjusting your search criteria
									</p>
								</div>
							</m.div>
						)}
					</AnimatePresence>
				</main>
			</ScrollArea>

			<Sheet open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
				<SheetContent className="w-full sm:max-w-lg hidden lg:block">
					<SheetHeader>
						<SheetTitle className="text-xl font-black uppercase tracking-tight">
							Advanced filters
						</SheetTitle>
					</SheetHeader>
					<div className="py-6 overflow-y-auto">
						<FilterContent
							availableSubjects={availableSubjects}
							availablePapers={availablePapers}
							availableMonths={availableMonths}
							selectedSubjects={selectedSubjects}
							selectedPapers={selectedPapers}
							selectedMonths={selectedMonths}
							extractedOnly={extractedOnly}
							onToggleSubject={handleToggleSubject}
							onTogglePaper={handleTogglePaper}
							onToggleMonth={handleToggleMonth}
							onToggleExtracted={handleToggleExtracted}
						/>
					</div>
					<div className="border-t pt-4 flex gap-3">
						<Button
							variant="outline"
							onClick={clearAllFilters}
							className="flex-1 rounded-2xl font-black text-[10px] uppercase tracking-widest ios-active-scale"
						>
							Reset
						</Button>
						<Button
							onClick={() => setIsAdvancedFilterOpen(false)}
							className="flex-1 rounded-2xl font-black text-[10px] uppercase tracking-widest ios-active-scale"
						>
							Apply Filters
						</Button>
					</div>
				</SheetContent>
			</Sheet>

			<Drawer open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
				<DrawerContent className="lg:hidden">
					<DrawerHeader>
						<DrawerTitle className="text-xl font-black uppercase tracking-tight text-left">
							Advanced filters
						</DrawerTitle>
					</DrawerHeader>
					<div className="px-4 py-4 overflow-y-auto max-h-[60vh]">
						<FilterContent
							availableSubjects={availableSubjects}
							availablePapers={availablePapers}
							availableMonths={availableMonths}
							selectedSubjects={selectedSubjects}
							selectedPapers={selectedPapers}
							selectedMonths={selectedMonths}
							extractedOnly={extractedOnly}
							onToggleSubject={handleToggleSubject}
							onTogglePaper={handleTogglePaper}
							onToggleMonth={handleToggleMonth}
							onToggleExtracted={handleToggleExtracted}
						/>
					</div>
					<DrawerFooter>
						<Button
							onClick={() => setIsAdvancedFilterOpen(false)}
							className="w-full rounded-2xl font-black text-[10px] uppercase tracking-widest ios-active-scale"
						>
							Apply Filters
						</Button>
						<Button
							variant="outline"
							onClick={clearAllFilters}
							className="w-full rounded-2xl font-black text-[10px] uppercase tracking-widest ios-active-scale"
						>
							Reset
						</Button>
						<DrawerClose asChild>
							<Button variant="ghost" className="w-full ios-active-scale">
								Cancel
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</div>
	);
}
