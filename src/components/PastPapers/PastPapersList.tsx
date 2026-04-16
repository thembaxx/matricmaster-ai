'use client';

import { BookOpen01Icon as BookOpen, StarIcon as Star, StarIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Icon } from '@iconify/react';
import { FluentEmoji } from '@lobehub/fluent-emoji';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GenerateFlashcardsFromPastPaper } from '@/components/Flashcards/GenerateFlashcardsFromPastPaper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getSubjectFluentEmoji } from '@/content';
import { usePastPapers } from '@/hooks/usePastPapers';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { togglePastPaperBookmarkAction, trackPastPaperViewAction } from '@/lib/db/actions';
import type { PastPaper } from '@/lib/db/schema';
import type { PastPaperRecommendation } from '@/stores/usePastPaperRecommendations';

interface PastPaperWithUsage extends PastPaper {
	viewCount: number;
	lastViewedAt: Date | null | undefined;
	isBookmarked: boolean;
}

interface PastPaperCardProps {
	paper: PastPaperWithUsage;
	recommendation?: PastPaperRecommendation;
}

export function PastPaperCard({ paper, recommendation }: PastPaperCardProps) {
	const router = useRouter();
	const queryClient = useQueryClient();

	const toggleBookmark = useMutation({
		mutationFn: () => togglePastPaperBookmarkAction(paper.id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user-past-paper-usage'] });
			queryClient.invalidateQueries({ queryKey: ['past-papers'] });
		},
	});

	const handleView = () => {
		trackPastPaperViewAction(paper.id);
		router.push(`/past-paper?id=${paper.id}`);
	};

	const handleSmartView = () => {
		trackPastPaperViewAction(paper.id);
		router.push(`/past-paper?id=${paper.id}`);
	};

	const handleRead = () => {
		trackPastPaperViewAction(paper.id);
		router.push(`/past-paper?id=${paper.id}&mode=read`);
	};

	return (
		<div className="p-8 rounded-3xl border border-border hover:border-primary/20 hover:shadow-soft-lg transition-all duration-500 group relative overflow-hidden bg-card/50 backdrop-blur-sm">
			<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

			<button
				type="button"
				className={`absolute top-4 right-4 z-20 p-2 rounded-full transition-all duration-300 ${
					paper.isBookmarked
						? 'bg-accent-lime/20 text-accent-lime'
						: 'bg-muted/50 text-muted-foreground hover:bg-accent-lime/20 hover:text-accent-lime'
				}`}
				onClick={() => toggleBookmark.mutate()}
				disabled={toggleBookmark.isPending}
			>
				<HugeiconsIcon icon={paper.isBookmarked ? StarIcon : Star} className="w-5 h-5" />
			</button>

			<div className="flex flex-col gap-6 relative z-10">
				<div className="flex items-start justify-between">
					<div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
						<FluentEmoji
							type="3d"
							emoji={getSubjectFluentEmoji(paper.subject.toLowerCase().replace(' ', '-'))}
							size={32}
							className="size-8"
						/>
					</div>
					<div className="text-right">
						<span className="text-[10px] font-black text-label-tertiary  tracking-[0.2em] block mb-1">
							Total Marks
						</span>
						<span className="text-2xl font-black text-primary tracking-tighter">
							{paper.totalMarks}m
						</span>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<h3 className="text-2xl font-black text-foreground tracking-tighter  leading-tight group-hover:text-primary transition-colors">
						{paper.subject} {paper.paper}
					</h3>
					<div className="flex flex-wrap gap-2">
						<Badge
							variant="outline"
							className="rounded-lg font-black text-[9px]  tracking-widest border border-border bg-secondary/50"
						>
							{paper.month} {paper.year}
						</Badge>
						<Badge
							variant="outline"
							className="rounded-lg font-black text-[9px]  tracking-widest border border-border bg-secondary/50"
						>
							NSC Grade 12
						</Badge>
						{paper.viewCount > 0 && (
							<Badge
								variant="outline"
								className="rounded-lg font-black text-[9px]  tracking-widest border border-accent-lime/50 bg-accent-lime/10 text-accent-lime"
							>
								Viewed {paper.viewCount}x
							</Badge>
						)}
					</div>
					{recommendation && (
						<AnimatePresence>
							<m.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								exit={{ opacity: 0, height: 0 }}
								className="flex flex-wrap gap-2 pt-2"
							>
								<Badge
									variant="default"
									className="rounded-lg font-black text-[9px] tracking-widest bg-accent-lime text-accent-lime-foreground"
								>
									Recommended
								</Badge>
								<Badge
									variant="outline"
									className="rounded-lg font-black text-[9px] tracking-widest border border-accent-lime/50 bg-accent-lime/10 text-accent-lime"
								>
									{recommendation.reason}
								</Badge>
							</m.div>
						</AnimatePresence>
					)}
				</div>

				<div className="grid grid-cols-2 gap-3 pt-4">
					<Button
						variant="secondary"
						className="rounded-2xl font-black text-[10px]  tracking-widest h-12 shadow-sm ios-active-scale"
						onClick={handleSmartView}
					>
						<Icon icon="fluent:document-sparkle-24-filled" className="w-5 h-5 mr-0 shrink-0" />
						Smart view
					</Button>
					<Button
						variant="outline"
						className="rounded-2xl font-black text-[10px]  tracking-widest h-12 border border-border ios-active-scale"
						onClick={handleRead}
					>
						<HugeiconsIcon icon={BookOpen} className="w-4 h-4 mr-2" />
						Read
					</Button>
				</div>

				<GenerateFlashcardsFromPastPaper
					paperId={paper.id}
					paperTitle={`${paper.subject} ${paper.paper}`}
					subject={paper.subject}
					year={paper.year}
					month={paper.month}
				/>

				<Button
					className="w-full dark:bg-white/60 dark:text-foreground backdrop-blur-2xl shadow-none rounded-2xl h-14 bg-secondary hover:bg-primary hover:text-primary-foreground text-label-secondary font-black text-[10px]  tracking-widest transition-all duration-300 group/btn ios-active-scale"
					onClick={handleView}
				>
					<Icon icon="fluent:cloud-download-24-regular" className="w-5 h-5 mr-2 shrink-0" />
					Download
				</Button>
			</div>
		</div>
	);
}

export function PastPapersEmptyState() {
	return (
		<m.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			className="py-32 flex flex-col items-center justify-center text-center gap-6 opacity-40"
		>
			<div className="size-32 bg-muted rounded-3xl flex items-center justify-center">
				<HugeiconsIcon icon={BookOpen} className="size-16 text-muted-foreground" />
			</div>
			<div className="flex flex-col gap-2">
				<h3 className="font-black text-muted-foreground  tracking-[0.4em] text-xs">
					Empty Archive
				</h3>
				<p className="text-muted-foreground font-bold">Refine your filters to see more results</p>
			</div>
		</m.div>
	);
}

export function PastPapersSkeleton() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
			{Array.from({ length: 6 }).map((_, i) => (
				<div key={`skeleton-${i}`} className="p-8 rounded-3xl border border-border bg-card/50">
					<div className="flex flex-col gap-6">
						<div className="flex justify-between">
							<Skeleton className="w-16 h-16 rounded-2xl" />
							<Skeleton className="w-12 h-8 rounded-lg" />
						</div>
						<div className="flex flex-col gap-2">
							<Skeleton className="h-8 w-3/4" />
							<div className="flex gap-2">
								<Skeleton className="h-6 w-20" />
								<Skeleton className="h-6 w-24" />
							</div>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<Skeleton className="h-12 rounded-2xl" />
							<Skeleton className="h-12 rounded-2xl" />
						</div>
						<Skeleton className="h-14 rounded-2xl" />
					</div>
				</div>
			))}
		</div>
	);
}

export function PastPapersGrid({
	papers,
	isLoading,
}: {
	papers: PastPaperWithUsage[];
	isLoading: boolean;
}) {
	if (isLoading) {
		return <PastPapersSkeleton />;
	}

	return (
		<m.div
			variants={STAGGER_CONTAINER}
			initial="initial"
			animate="animate"
			className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
		>
			<AnimatePresence mode="popLayout">
				{papers.map((paper, index) => (
					<m.div
						key={paper.id}
						variants={STAGGER_ITEM}
						layout
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						transition={{ delay: index * 0.05 }}
					>
						<PastPaperCard paper={paper} />
					</m.div>
				))}
			</AnimatePresence>
		</m.div>
	);
}

interface PastPapersBrowserProps {
	searchQuery?: string;
}

export function PastPapersBrowser({ searchQuery: _searchQuery = '' }: PastPapersBrowserProps) {
	const { filteredPapers, isLoading } = usePastPapers();

	return (
		<div className="space-y-6">
			<PastPapersGrid papers={filteredPapers as PastPaperWithUsage[]} isLoading={isLoading} />
		</div>
	);
}
