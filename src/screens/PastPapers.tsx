'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
	BookOpen,
	Download,
	Eye,
	FileText,
	Filter,
	Loader2,
	Search as SearchIcon,
	X,
	CheckCircle2,
	ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { ProgressRing } from '@/components/ui/ProgressRing';

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
				<h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
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
								className="text-sm font-bold cursor-pointer text-foreground"
							>
								{subject}
							</label>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-4">
				<h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
					Paper Type
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
								className="text-sm font-bold cursor-pointer text-foreground"
							>
								{paper}
							</label>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-4">
				<h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
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
								className="text-sm font-bold cursor-pointer text-foreground"
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
						<h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
							Extracted Only
						</h4>
						<p className="text-[10px] text-muted-foreground mt-1 font-medium">
							Show papers with AI-extracted questions
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

	const availableSubjects = useMemo(
		() => [...new Set(papers.map((p) => p.subject))].sort(),
		[papers]
	);
	const availablePapers = useMemo(() => [...new Set(papers.map((p) => p.paper))].sort(), [papers]);
	const availableMonths = useMemo(() => [...new Set(papers.map((p) => p.month))].sort(), [papers]);

	const activeFilterCount = useMemo(
		() =>
			selectedSubjects.length +
			selectedPapers.length +
			selectedMonths.length +
			(extractedOnly ? 1 : 0),
		[selectedSubjects, selectedPapers, selectedMonths, extractedOnly]
	);

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
		<div className="flex flex-col h-full min-w-0 bg-background relative overflow-x-hidden">
			<BackgroundMesh variant="subtle" />

			{/* Hero Header */}
			<header className="px-6 py-10 sm:py-16 shrink-0 lg:px-0 max-w-7xl mx-auto w-full">
				<div className="space-y-8">
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
						<div className="space-y-4">
							<motion.div
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
							>
								<Badge variant="violet" size="lg" className="mb-2">NSC Grade 12</Badge>
								<h1 className="text-4xl sm:text-6xl font-heading font-black text-foreground tracking-tight">
									Subject Vault
								</h1>
								<p className="text-muted-foreground text-lg sm:text-xl font-medium max-w-xl">
									Practice with interactive past papers and master every topic.
								</p>
							</motion.div>
						</div>
						<div className="flex items-center gap-3">
							<Button
								variant="outline"
								onClick={() => setIsAdvancedFilterOpen(true)}
								className={cn(
									'rounded-2xl h-12 px-6',
									activeFilterCount > 0 && 'border-primary-violet bg-primary-violet/5 text-primary-violet'
								)}
								leftIcon={<Filter className="w-4 h-4" />}
							>
								Filters
								{activeFilterCount > 0 && (
									<span className="ml-2 w-5 h-5 flex items-center justify-center bg-primary-violet text-white rounded-full text-[10px]">
										{activeFilterCount}
									</span>
								)}
							</Button>
							{activeFilterCount > 0 && (
								<Button variant="ghost" onClick={clearAllFilters} size="icon" className="h-12 w-12 rounded-2xl">
									<X className="w-5 h-5" />
								</Button>
							)}
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
						<div className="lg:col-span-8 relative">
							<SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search subjects or topics..."
								className="pl-14 h-14 rounded-2xl bg-card border-border border-2 text-lg shadow-inner focus:border-primary-violet/50"
							/>
						</div>
						<div className="lg:col-span-4 flex gap-2 overflow-x-auto no-scrollbar py-1">
							{years.map((year) => (
								<button
									key={year}
									type="button"
									onClick={() => setSelectedYear(year as any)}
									className={cn(
										"rounded-2xl px-6 py-3 font-bold text-sm transition-all h-14 whitespace-nowrap",
										selectedYear === year
											? "bg-primary-violet text-white shadow-lg shadow-primary-violet/20"
											: "bg-card text-muted-foreground border-2 border-transparent hover:border-border"
									)}
								>
									{year}
								</button>
							))}
						</div>
					</div>
				</div>
			</header>

			<ScrollArea className="flex-1 no-scrollbar">
				<main className="px-6 py-8 max-w-7xl mx-auto w-full space-y-8 pb-32 lg:px-0">
					<div className="flex items-center justify-between">
						<h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
							All Papers ({filteredPapers.length})
						</h2>
					</div>

					<AnimatePresence mode="popLayout">
						{isLoading ? (
							<div className="flex flex-col items-center justify-center py-20 gap-4">
								<Loader2 className="w-10 h-10 animate-spin text-primary-violet" />
								<p className="text-muted-foreground font-bold animate-pulse">Loading vault...</p>
							</div>
						) : filteredPapers.length > 0 ? (
							<motion.div
								variants={STAGGER_CONTAINER}
								initial="hidden"
								animate="visible"
								className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
							>
								{filteredPapers.map((paper) => (
									<motion.div key={paper.id} variants={STAGGER_ITEM} layout>
										<Card variant="interactive" className="h-full flex flex-col group overflow-hidden border-2">
											<div className="p-6 flex flex-col h-full gap-6">
												<div className="flex items-start justify-between">
													<div className="w-14 h-14 rounded-2xl bg-primary-violet/10 flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
														<FileText className="w-7 h-7 text-primary-violet" />
													</div>
													<div className="flex flex-col items-end">
														<Badge variant="cyan" size="sm">{paper.year}</Badge>
														<span className="text-[10px] font-bold text-muted-foreground uppercase mt-2">{paper.month}</span>
													</div>
												</div>

												<div className="space-y-2">
													<h3 className="text-2xl font-heading font-black text-foreground leading-tight">
														{paper.subject}
													</h3>
													<p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
														Paper {paper.paper}
													</p>
												</div>

												<div className="mt-auto space-y-4">
													<div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
														<span>{paper.totalMarks} Marks</span>
														<div className="flex items-center gap-1 text-success">
															<CheckCircle2 className="w-3 h-3" />
															<span>Practice Ready</span>
														</div>
													</div>

													<div className="grid grid-cols-2 gap-2">
														<Button
															variant="primary"
															className="h-12 rounded-xl text-sm"
															onClick={() => router.push(`/past-paper?id=${paper.id}`)}
															rightIcon={<ChevronRight className="w-4 h-4" />}
														>
															Start
														</Button>
														<Button
															variant="outline"
															className="h-12 rounded-xl text-sm"
															onClick={() => window.open(paper.originalPdfUrl, '_blank')}
															leftIcon={<Download className="w-4 h-4" />}
														>
															PDF
														</Button>
													</div>
												</div>
											</div>
										</Card>
									</motion.div>
								))}
							</motion.div>
						) : (
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								className="py-32 flex flex-col items-center justify-center text-center space-y-6"
							>
								<div className="w-32 h-32 bg-muted rounded-[2.5rem] flex items-center justify-center">
									<SearchIcon className="w-16 h-16 text-muted-foreground" />
								</div>
								<div className="space-y-2">
									<h3 className="font-heading font-black text-2xl">No papers found</h3>
									<p className="text-muted-foreground font-medium max-w-xs mx-auto">
										We couldn't find any papers matching your current filters.
									</p>
									<Button variant="tertiary" onClick={clearAllFilters} className="mt-4">
										Clear all filters
									</Button>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</main>
			</ScrollArea>

			<Sheet open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
				<SheetContent className="w-full sm:max-w-lg hidden lg:block">
					<SheetHeader>
						<SheetTitle className="text-2xl font-heading font-black">
							Advanced Filters
						</SheetTitle>
					</SheetHeader>
					<div className="py-8">
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
					<div className="absolute bottom-8 left-8 right-8 flex gap-3">
						<Button
							variant="outline"
							onClick={clearAllFilters}
							className="flex-1 h-14 rounded-2xl"
						>
							Reset
						</Button>
						<Button
							variant="primary"
							onClick={() => setIsAdvancedFilterOpen(false)}
							className="flex-1 h-14 rounded-2xl"
						>
							Apply
						</Button>
					</div>
				</SheetContent>
			</Sheet>

			<Drawer open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
				<DrawerContent className="lg:hidden">
					<DrawerHeader>
						<DrawerTitle className="text-2xl font-heading font-black text-left">
							Advanced Filters
						</DrawerTitle>
					</DrawerHeader>
					<div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
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
					<DrawerFooter className="px-6 pb-10">
						<div className="flex gap-3 w-full">
							<Button
								variant="outline"
								onClick={clearAllFilters}
								className="flex-1 h-14 rounded-2xl"
							>
								Reset
							</Button>
							<Button
								variant="primary"
								onClick={() => setIsAdvancedFilterOpen(false)}
								className="flex-1 h-14 rounded-2xl"
							>
								Show Results
							</Button>
						</div>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</div>
	);
}
