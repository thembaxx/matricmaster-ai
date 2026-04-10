'use client';

import { BookOpen01Icon as BookOpen } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Icon } from '@iconify/react';
import { AnimatePresence, m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import type { PastPaper } from '@/lib/db/schema';
import type { PastPaperRecommendation } from '@/stores/usePastPaperRecommendations';

interface PastPaperCardProps {
	paper: PastPaper;
	recommendation?: PastPaperRecommendation;
}

export function PastPaperCard({ paper, recommendation }: PastPaperCardProps) {
	const router = useRouter();

	return (
		<div className="p-8 rounded-3xl border border-border hover:border-primary/20 hover:shadow-soft-lg transition-all duration-500 group relative overflow-hidden bg-card/50 backdrop-blur-sm">
			<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

			<div className="space-y-6 relative z-10">
				<div className="flex items-start justify-between">
					<div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
						<HugeiconsIcon icon={BookOpen} className="w-8 h-8 text-primary" />
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

				<div className="space-y-2">
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
						onClick={() => router.push(`/past-paper?id=${paper.id}`)}
					>
						<Icon icon="fluent:document-sparkle-24-filled" className="w-5 h-5 mr-0 shrink-0" />
						Smart view
					</Button>
					<Button
						variant="outline"
						className="rounded-2xl font-black text-[10px]  tracking-widest h-12 border border-border ios-active-scale"
						onClick={() => router.push(`/past-paper?id=${paper.id}&mode=read`)}
					>
						<HugeiconsIcon icon={BookOpen} className="w-4 h-4 mr-2" />
						Read
					</Button>
				</div>

				<Button
					className="w-full dark:bg-white/60 dark:text-foreground backdrop-blur-2xl shadow-none rounded-2xl h-14 bg-secondary hover:bg-primary hover:text-primary-foreground text-label-secondary font-black text-[10px]  tracking-widest transition-all duration-300 group/btn ios-active-scale"
					onClick={() => window.open(paper.originalPdfUrl, '_blank')}
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
			className="py-32 flex flex-col items-center justify-center text-center space-y-6 opacity-40"
		>
			<div className="w-32 h-32 bg-muted rounded-3xl flex items-center justify-center">
				<HugeiconsIcon icon={BookOpen} className="w-16 h-16 text-muted-foreground" />
			</div>
			<div className="space-y-2">
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
				<div
					key={`skeleton-${i}`}
					className="p-8 rounded-3xl border border-border bg-card/50 animate-pulse"
				>
					<div className="space-y-6">
						<div className="flex items-start justify-between">
							<div className="w-16 h-16 rounded-2xl bg-muted" />
							<div className="text-right">
								<div className="h-4 w-16 bg-muted rounded mb-1" />
								<div className="h-8 w-12 bg-muted rounded" />
							</div>
						</div>
						<div className="space-y-2">
							<div className="h-8 w-48 bg-muted rounded" />
							<div className="flex gap-2">
								<div className="h-6 w-24 bg-muted rounded-lg" />
								<div className="h-6 w-24 bg-muted rounded-lg" />
							</div>
						</div>
						<div className="grid grid-cols-2 gap-3 pt-4">
							<div className="h-12 bg-muted rounded-2xl" />
							<div className="h-12 bg-muted rounded-2xl" />
						</div>
						<div className="h-14 bg-muted rounded-2xl" />
					</div>
				</div>
			))}
		</div>
	);
}

interface PastPapersGridProps {
	papers: PastPaper[];
	isLoading: boolean;
}

export function PastPapersGrid({ papers, isLoading }: PastPapersGridProps) {
	return (
		<AnimatePresence mode="popLayout">
			{isLoading ? (
				<PastPapersSkeleton />
			) : papers.length > 0 ? (
				<m.div
					variants={STAGGER_CONTAINER}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
				>
					{papers.map((paper) => (
						<m.div key={paper.id} variants={STAGGER_ITEM} layout whileHover={{ y: -8 }}>
							<PastPaperCard paper={paper} />
						</m.div>
					))}
				</m.div>
			) : (
				<PastPapersEmptyState />
			)}
		</AnimatePresence>
	);
}

interface PastPapersBrowserProps {
	searchQuery?: string;
}

export function PastPapersBrowser({ searchQuery: _searchQuery = '' }: PastPapersBrowserProps) {
	const [papers] = useState<PastPaper[]>([]);
	const [isLoading] = useState(false);

	return (
		<div className="space-y-6">
			<PastPapersGrid papers={papers} isLoading={isLoading} />
		</div>
	);
}
