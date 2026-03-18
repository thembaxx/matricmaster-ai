'use client';

import { Cancel01Icon, Settings02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Icon } from '@iconify/react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, m } from 'framer-motion';
import { memo, useCallback, useMemo, useState } from 'react';
import { PastPaperCard, PastPapersEmptyState } from '@/components/PastPapers/PastPapersList';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
							Show papers with AI-extracted questions
						</p>
					</div>
					<Switch checked={extractedOnly} onCheckedChange={onToggleExtracted} />
				</div>
			</div>
		</div>
	);
});

import { PastPapersSkeleton } from '@/components/PastPapersSkeleton';

export default function PastPapers() {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedYear, setSelectedYear] = useState<number | 'All'>('All');
	const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
	const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
	const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
	const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
	const [extractedOnly, setExtractedOnly] = useState(false);

	const years = useMemo(() => ['All', 2024, 2023, 2022, 2021, 2020], []);

	const { data: papers = [], isLoading } = useQuery({
		queryKey: ['past-papers'],
		queryFn: async () => getPastPapersAction(),
	});

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
		<div className="flex flex-col h-full min-w-0 bg-background relative overflow-x-hidden lg:px-8">
			<BackgroundMesh variant="subtle" />

			{/* Header */}
			<header className="px-4 sm:px-6 pb-6 sm:py-12 pt-24 bg-background shrink-0 lg:px-0">
				<div className="max-w-7xl mx-auto w-full space-y-6 sm:space-y-12">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
						<div className="space-y-2">
							<h1 className="text-2xl sm:text-4xl lg:text-7xl font-black text-foreground tracking-tighter uppercase">
								Past Paper Vault
							</h1>
							<p className="text-label-secondary font-black text-[11px] sm:text-lg uppercase tracking-widest">
								Access thousands of Grade 12 exam papers
							</p>
						</div>
						<div className="flex items-center gap-2">
							{activeFilterCount > 0 && (
								<Button
									variant="ghost"
									onClick={clearAllFilters}
									aria-label="Clear all filters"
									className="rounded-2xl font-black text-[10px] uppercase tracking-widest px-3 sm:px-4 h-10 sm:h-12 text-label-tertiary hover:text-foreground ios-active-scale"
								>
									<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4 mr-1 sm:mr-2" />
									<span className="hidden sm:inline">Clear</span>
								</Button>
							)}
							<Button
								variant="outline"
								onClick={() => setIsAdvancedFilterOpen(true)}
								aria-label={`Advanced Faders${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
								className={cn(
									'rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest px-4 sm:px-6 h-10 sm:h-12 ios-active-scale',
									activeFilterCount > 0 && 'border-primary bg-primary/10 text-primary'
								)}
							>
								<HugeiconsIcon icon={Settings02Icon} className="w-4 h-4 mr-2" />
								<span className="hidden sm:inline">Advanced Faders</span>
								{activeFilterCount > 0 && (
									<Badge className="ml-2 rounded-full px-2 py-0.5 text-[9px] bg-primary text-primary-foreground">
										{activeFilterCount}
									</Badge>
								)}
							</Button>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
						<div className="lg:col-span-8 flex items-center relative">
							<Icon
								icon="fluent:search-20-regular"
								className="w-5 sm:w-6 h-5 absolute left-4 z-1 sm:h-6 text-label-tertiary"
							/>
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search"
								className="pl-12 sm:pl-16 placeholder:font-medium placeholder:capitalize pr-12 sm:pr-16 bg-card backdrop-blur-md border-border border-2 h-12 sm:h-16 rounded-xl sm:rounded-2xl text-base sm:text-lg font-black uppercase tracking-tight shadow-inner"
								aria-label="Search past papers"
							/>
							<AnimatePresence>
								{searchQuery && (
									<m.button
										initial={{ scale: 0.95, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										exit={{ scale: 0.95, opacity: 0 }}
										title="Clear search"
										aria-label="Clear search"
										type="button"
										onClick={() => setSearchQuery('')}
										className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-label-tertiary hover:text-foreground transition-colors ios-active-scale"
									>
										<HugeiconsIcon icon={Cancel01Icon} className="w-5 sm:w-6 h-5 sm:h-6" />
									</m.button>
								)}
							</AnimatePresence>
						</div>
						<div className="lg:col-span-4 flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
							{years.map((year) => (
								<button
									key={year}
									type="button"
									onClick={() => setSelectedYear(year as any)}
									aria-pressed={selectedYear === year}
									className={`rounded-xl sm:rounded-2xl px-4 sm:px-8 py-2 sm:py-3 text-[11px] font-black uppercase tracking-widest transition-all h-10 sm:h-16 whitespace-nowrap ios-active-scale ${
										selectedYear === year
											? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/30'
											: 'bg-secondary text-label-secondary border-2 border-transparent hover:border-border backdrop-blur-sm'
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
				<main className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto w-full space-y-8 sm:space-y-12 pb-32 lg:px-0">
					<div className="flex items-center justify-between border-b border-border pb-4">
						<h2 className="text-[10px] font-black text-label-tertiary uppercase tracking-[0.4em]">
							Archive Results ({filteredPapers.length})
						</h2>
					</div>

					<AnimatePresence mode="popLayout">
						{isLoading ? (
							<PastPapersSkeleton />
						) : filteredPapers.length > 0 ? (
							<m.div
								variants={STAGGER_CONTAINER}
								initial="hidden"
								animate="visible"
								className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
							>
								{filteredPapers.map((paper) => (
									<m.div key={paper.id} variants={STAGGER_ITEM} layout whileHover={{ y: -8 }}>
										<PastPaperCard paper={paper} />
									</m.div>
								))}
							</m.div>
						) : (
							<PastPapersEmptyState />
						)}
					</AnimatePresence>
				</main>
			</ScrollArea>

			<Sheet open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
				<SheetContent className="w-full sm:max-w-lg hidden lg:block">
					<SheetHeader>
						<SheetTitle className="text-xl font-black uppercase tracking-tight">
							Advanced Filters
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
							Advanced Filters
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
