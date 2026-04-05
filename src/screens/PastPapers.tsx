'use client';

import { Cancel01Icon, Settings02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Icon } from '@iconify/react';
import { AnimatePresence, m } from 'framer-motion';
import { ViewTransition } from 'react';
import { FilterPanel } from '@/components/PastPapers/FilterPanel';
import { PastPaperCard, PastPapersEmptyState } from '@/components/PastPapers/PastPapersList';
import { PastPapersSkeleton } from '@/components/PastPapersSkeleton';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePastPapers } from '@/hooks/usePastPapers';
import { useQuizPastPaperIntegration } from '@/hooks/useQuizPastPaperIntegration';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { cn } from '@/lib/utils';

export default function PastPapers() {
	const {
		uiState,
		uiDispatch,
		filterState,
		filterDispatch,
		years,
		availableSubjects,
		availablePapers,
		availableMonths,
		activeFilterCount,
		clearAllFilters,
		filteredPapers,
		isLoading,
	} = usePastPapers();

	const {
		recommendations,
		showOnlyRecommended,
		toggleShowOnlyRecommended,
		isRecommended,
		getRecommendationsForPaper,
	} = useQuizPastPaperIntegration(filteredPapers);

	const recommendedPapers = showOnlyRecommended
		? filteredPapers.filter((paper) => isRecommended(paper.id))
		: filteredPapers;

	const hasRecommendations = recommendations.length > 0;

	return (
		<ViewTransition default="none">
			<div className="vt-nav-forward flex flex-col h-full min-w-0 bg-background relative overflow-x-hidden lg:px-8">
				<BackgroundMesh variant="subtle" />

				<header className="px-4 sm:px-6 pb-6 sm:py-12 pt-24 bg-background shrink-0 lg:px-0">
					<div className="max-w-7xl mx-auto w-full space-y-6 sm:space-y-12">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
							<div className="space-y-2">
								<h1 className="text-2xl sm:text-4xl lg:text-7xl font-black text-foreground tracking-tighter">
									past paper vault
								</h1>
								<p className="text-label-secondary font-black text-[11px] sm:text-lg tracking-widest">
									access thousands of grade 12 exam papers
								</p>
							</div>
							<div className="flex items-center gap-2">
								{hasRecommendations && (
									<Button
										variant={showOnlyRecommended ? 'default' : 'outline'}
										onClick={toggleShowOnlyRecommended}
										aria-label="toggle recommended papers"
										className={cn(
											'rounded-2xl border-2 font-black text-[10px] tracking-widest px-4 sm:px-6 h-10 sm:h-12 ios-active-scale',
											showOnlyRecommended
												? 'bg-accent-lime border-accent-lime text-accent-lime-foreground'
												: 'border-border'
										)}
									>
										<Icon icon="fluent:sparkle-24-filled" className="w-4 h-4 mr-2" />
										<span className="hidden sm:inline">recommended</span>
									</Button>
								)}
								{activeFilterCount > 0 && (
									<Button
										variant="ghost"
										onClick={clearAllFilters}
										aria-label="clear all filters"
										className="rounded-2xl font-black text-[10px] tracking-widest px-3 sm:px-4 h-10 sm:h-12 text-label-tertiary hover:text-foreground ios-active-scale"
									>
										<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4 mr-1 sm:mr-2" />
										<span className="hidden sm:inline">clear</span>
									</Button>
								)}
								<Button
									variant="outline"
									onClick={() => uiDispatch({ type: 'TOGGLE_FILTER_PANEL', payload: true })}
									aria-label={`advanced faders${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
									className={cn(
										'rounded-2xl border-2 font-black text-[10px] tracking-widest px-4 sm:px-6 h-10 sm:h-12 ios-active-scale',
										activeFilterCount > 0 && 'border-primary bg-primary/10 text-primary'
									)}
								>
									<HugeiconsIcon icon={Settings02Icon} className="w-4 h-4 mr-2" />
									<span className="hidden sm:inline">advanced faders</span>
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
									value={uiState.searchQuery}
									onChange={(e) =>
										uiDispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })
									}
									placeholder="search"
									className="pl-12 sm:pl-16 placeholder:font-medium pr-12 sm:pr-16 bg-card backdrop-blur-md border-border border-2 h-12 sm:h-16 rounded-xl sm:rounded-2xl text-base sm:text-lg font-black tracking-tight shadow-inner"
									aria-label="search past papers"
								/>
								<AnimatePresence>
									{uiState.searchQuery && (
										<m.button
											initial={{ scale: 0.95, opacity: 0 }}
											animate={{ scale: 1, opacity: 1 }}
											exit={{ scale: 0.95, opacity: 0 }}
											title="clear search"
											aria-label="clear search"
											type="button"
											onClick={() => uiDispatch({ type: 'SET_SEARCH_QUERY', payload: '' })}
											className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-label-tertiary hover:text-foreground transition-colors ios-active-scale"
										>
											<HugeiconsIcon icon={Cancel01Icon} className="w-5 sm:w-6 h-5 sm:h-6" />
										</m.button>
									)}
								</AnimatePresence>
							</div>
							<div className="lg:col-span-4 flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
								{years.map((year) => (
									<Button
										key={year}
										type="button"
										variant="ghost"
										onClick={() =>
											uiDispatch({ type: 'SET_YEAR', payload: year as number | 'All' })
										}
										aria-pressed={uiState.selectedYear === year}
										className={`rounded-xl sm:rounded-2xl px-4 sm:px-8 py-2 sm:py-3 text-[11px] font-black tracking-widest transition-all h-10 sm:h-16 whitespace-nowrap ios-active-scale ${
											uiState.selectedYear === year
												? 'bg-primary text-primary-foreground shadow-soft-lg shadow-primary/30'
												: 'bg-secondary text-label-secondary border-2 border-transparent hover:border-border backdrop-blur-sm'
										}`}
									>
										{year}
									</Button>
								))}
							</div>
						</div>
					</div>
				</header>

				<ScrollArea className="flex-1 no-scrollbar">
					<main className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto w-full space-y-8 sm:space-y-12 pb-32 lg:px-0">
						{hasRecommendations && (
							<m.section
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className="space-y-4"
							>
								<div className="flex items-center justify-between border-b border-border pb-4">
									<h2 className="text-[10px] font-black text-accent-lime tracking-[0.4em] flex items-center gap-2">
										<Icon icon="fluent:sparkle-24-filled" className="w-4 h-4" />
										recommended for you ({recommendations.length})
									</h2>
								</div>
								<m.div
									variants={STAGGER_CONTAINER}
									initial="hidden"
									animate="visible"
									className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
								>
									{recommendations.slice(0, 3).map((rec) => {
										const paper = filteredPapers.find((p) => p.id === rec.paperId);
										if (!paper) return null;
										return (
											<m.div
												key={rec.paperId}
												variants={STAGGER_ITEM}
												layout
												whileHover={{ y: -8 }}
											>
												<PastPaperCard paper={paper} recommendation={rec} />
											</m.div>
										);
									})}
								</m.div>
							</m.section>
						)}

						<div className="flex items-center justify-between border-b border-border pb-4">
							<h2 className="text-[10px] font-black text-label-tertiary tracking-[0.4em]">
								archive results ({recommendedPapers.length})
							</h2>
						</div>

						<AnimatePresence mode="popLayout">
							{isLoading ? (
								<PastPapersSkeleton />
							) : recommendedPapers.length > 0 ? (
								<m.div
									variants={STAGGER_CONTAINER}
									initial="hidden"
									animate="visible"
									className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
								>
									{recommendedPapers.map((paper) => (
										<m.div key={paper.id} variants={STAGGER_ITEM} layout whileHover={{ y: -8 }}>
											<PastPaperCard
												paper={paper}
												recommendation={
													isRecommended(paper.id) ? getRecommendationsForPaper(paper.id) : undefined
												}
											/>
										</m.div>
									))}
								</m.div>
							) : (
								<PastPapersEmptyState />
							)}
						</AnimatePresence>
					</main>
				</ScrollArea>

				<FilterPanel
					isOpen={uiState.isAdvancedFilterOpen}
					onOpenChange={(open) => uiDispatch({ type: 'TOGGLE_FILTER_PANEL', payload: open })}
					availableSubjects={availableSubjects}
					availablePapers={availablePapers}
					availableMonths={availableMonths}
					filterState={filterState}
					dispatch={filterDispatch}
					onReset={clearAllFilters}
				/>
			</div>
		</ViewTransition>
	);
}
