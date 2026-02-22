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
	X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

function FilterContent({
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
				<h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
					Subjects
				</h4>
				<div className="grid grid-cols-2 gap-3">
					{availableSubjects.map((subject) => (
						<div key={subject} className="flex items-center gap-3 cursor-pointer">
							<Checkbox
								id={`subject-${subject}`}
								checked={selectedSubjects.includes(subject)}
								onCheckedChange={() => onToggleSubject(subject)}
							/>
							<label htmlFor={`subject-${subject}`} className="text-sm font-bold cursor-pointer">
								{subject}
							</label>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-4">
				<h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
					Paper Type
				</h4>
				<div className="grid grid-cols-2 gap-3">
					{availablePapers.map((paper) => (
						<div key={paper} className="flex items-center gap-3 cursor-pointer">
							<Checkbox
								id={`paper-${paper}`}
								checked={selectedPapers.includes(paper)}
								onCheckedChange={() => onTogglePaper(paper)}
							/>
							<label htmlFor={`paper-${paper}`} className="text-sm font-bold cursor-pointer">
								{paper}
							</label>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-4">
				<h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
					Month
				</h4>
				<div className="grid grid-cols-2 gap-3">
					{availableMonths.map((month) => (
						<div key={month} className="flex items-center gap-3 cursor-pointer">
							<Checkbox
								id={`month-${month}`}
								checked={selectedMonths.includes(month)}
								onCheckedChange={() => onToggleMonth(month)}
							/>
							<label htmlFor={`month-${month}`} className="text-sm font-bold cursor-pointer">
								{month}
							</label>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
							Extracted Only
						</h4>
						<p className="text-xs text-muted-foreground mt-1">
							Show papers with AI-extracted questions
						</p>
					</div>
					<Switch checked={extractedOnly} onCheckedChange={onToggleExtracted} />
				</div>
			</div>
		</div>
	);
}

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

	const years = ['All', 2024, 2023, 2022, 2021, 2020];

	const availableSubjects = [...new Set(papers.map((p) => p.subject))].sort();
	const availablePapers = [...new Set(papers.map((p) => p.paper))].sort();
	const availableMonths = [...new Set(papers.map((p) => p.month))].sort();

	const activeFilterCount =
		selectedSubjects.length +
		selectedPapers.length +
		selectedMonths.length +
		(extractedOnly ? 1 : 0);

	const clearAllFilters = () => {
		setSelectedSubjects([]);
		setSelectedPapers([]);
		setSelectedMonths([]);
		setExtractedOnly(false);
	};

	const toggleArrayItem = (arr: string[], setArr: (v: string[]) => void, item: string) => {
		if (arr.includes(item)) {
			setArr(arr.filter((i) => i !== item));
		} else {
			setArr([...arr, item]);
		}
	};

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
							{activeFilterCount > 0 && (
								<Button
									variant="ghost"
									onClick={clearAllFilters}
									className="rounded-2xl font-black text-[10px] uppercase tracking-widest px-4 h-12 text-muted-foreground hover:text-foreground"
								>
									<X className="w-4 h-4 mr-2" />
									Clear
								</Button>
							)}
							<Button
								variant="outline"
								onClick={() => setIsAdvancedFilterOpen(true)}
								className={cn(
									'rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest px-6 h-12',
									activeFilterCount > 0 && 'border-primary bg-primary/10 text-primary'
								)}
							>
								<Filter className="w-4 h-4 mr-2" />
								Advanced Filter
								{activeFilterCount > 0 && (
									<Badge className="ml-2 rounded-full px-2 py-0.5 text-[9px] bg-primary text-primary-foreground">
										{activeFilterCount}
									</Badge>
								)}
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
							onToggleSubject={(subject) =>
								toggleArrayItem(selectedSubjects, setSelectedSubjects, subject)
							}
							onTogglePaper={(paper) => toggleArrayItem(selectedPapers, setSelectedPapers, paper)}
							onToggleMonth={(month) => toggleArrayItem(selectedMonths, setSelectedMonths, month)}
							onToggleExtracted={setExtractedOnly}
						/>
					</div>
					<div className="border-t pt-4 flex gap-3">
						<Button
							variant="outline"
							onClick={clearAllFilters}
							className="flex-1 rounded-2xl font-black text-xs uppercase tracking-widest"
						>
							Reset
						</Button>
						<Button
							onClick={() => setIsAdvancedFilterOpen(false)}
							className="flex-1 rounded-2xl font-black text-xs uppercase tracking-widest"
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
							onToggleSubject={(subject) =>
								toggleArrayItem(selectedSubjects, setSelectedSubjects, subject)
							}
							onTogglePaper={(paper) => toggleArrayItem(selectedPapers, setSelectedPapers, paper)}
							onToggleMonth={(month) => toggleArrayItem(selectedMonths, setSelectedMonths, month)}
							onToggleExtracted={setExtractedOnly}
						/>
					</div>
					<DrawerFooter>
						<Button
							onClick={() => setIsAdvancedFilterOpen(false)}
							className="w-full rounded-2xl font-black text-xs uppercase tracking-widest"
						>
							Apply Filters
						</Button>
						<Button
							variant="outline"
							onClick={clearAllFilters}
							className="w-full rounded-2xl font-black text-xs uppercase tracking-widest"
						>
							Reset
						</Button>
						<DrawerClose asChild>
							<Button variant="ghost" className="w-full">
								Cancel
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</div>
	);
}
