'use client';

import { AlertCircleIcon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, m } from 'framer-motion';
import Link from 'next/link';
import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StudyContext {
	topic: string;
	subject: string;
	recentScore?: number;
	struggleCount: number;
	lastPracticed?: string;
}

interface AiInsightsProps {
	isLoading: boolean;
	suggestions: string[] | undefined;
	tip: string | undefined;
	onSuggestionClick: (suggestion: string) => void;
	query?: string;
}

export const AiInsights = memo(function AiInsights({
	isLoading,
	suggestions,
	tip,
	onSuggestionClick,
	query = '',
}: AiInsightsProps) {
	const { data: studyContext = [] } = useQuery<StudyContext[]>({
		queryKey: ['study-context', query],
		queryFn: async () => {
			if (!query || query.length < 3) return [];
			const response = await fetch(
				`/api/ai-tutor/recommendations?context=${encodeURIComponent(query)}`
			);
			if (!response.ok) throw new Error('Failed to load study context');
			const data = await response.json();
			return data.relatedTopics || [];
		},
		enabled: query.length >= 3,
		staleTime: 5 * 60 * 1000,
	});

	return (
		<AnimatePresence mode="wait">
			{(isLoading || suggestions) && (
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					className="space-y-6"
				>
					<div className="flex items-center gap-2">
						<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-primary" />
						<h2 className="text-[10px] font-black text-muted-foreground  tracking-[0.3em]">
							AI Insights
						</h2>
					</div>
					<Card className="p-8 bg-zinc-900 text-white rounded-[3rem] relative overflow-hidden border-none shadow-soft-lg">
						<div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32" />
						{isLoading ? (
							<div className="space-y-6 relative z-10">
								<Skeleton className="h-8 w-3/4 rounded-full bg-white/5" />
								<div className="flex flex-wrap gap-3">
									{[1, 2, 3].map((item) => (
										<Skeleton
											key={`ai-insights-skeleton-${item}`}
											className="h-10 w-32 rounded-xl bg-white/5"
										/>
									))}
								</div>
							</div>
						) : (
							<div className="space-y-8 relative z-10">
								{tip && (
									<p className="text-lg md:text-xl font-bold leading-relaxed text-white/90 italic">
										"{tip}"
									</p>
								)}
								<div className="flex flex-wrap gap-3">
									{suggestions?.map((suggestion) => (
										<m.div key={suggestion} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
											<Badge
												variant="secondary"
												className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-black  tracking-widest hover:bg-white hover:text-zinc-900 transition-all cursor-pointer"
												onClick={() => onSuggestionClick(suggestion)}
											>
												{suggestion}
											</Badge>
										</m.div>
									))}
								</div>
							</div>
						)}
					</Card>

					{studyContext.length > 0 && (
						<Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
							<div className="flex items-center gap-2 mb-4">
								<HugeiconsIcon icon={AlertCircleIcon} className="w-4 h-4 text-amber-600" />
								<h3 className="text-sm font-bold text-amber-900 dark:text-amber-100">
									Your Study History
								</h3>
							</div>
							<div className="space-y-3">
								{studyContext.slice(0, 3).map((ctx) => (
									<Link
										key={`ai-insights-ctx-${ctx.topic}`}
										href={`/review?topic=${encodeURIComponent(ctx.topic)}`}
										className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-black/20 hover:bg-white transition-colors"
									>
										<div>
											<p className="font-bold text-sm text-foreground">{ctx.topic}</p>
											<p className="text-xs text-muted-foreground">{ctx.subject}</p>
										</div>
										<div className="text-right">
											{ctx.struggleCount > 0 && (
												<Badge variant="destructive" className="text-[10px]">
													{ctx.struggleCount} struggles
												</Badge>
											)}
											{ctx.recentScore !== undefined && (
												<p className="text-xs font-bold text-muted-foreground mt-1">
													Last: {ctx.recentScore}%
												</p>
											)}
										</div>
									</Link>
								))}
							</div>
							<p className="text-xs text-muted-foreground mt-3 text-center">
								Based on your recent study sessions
							</p>
						</Card>
					)}
				</m.div>
			)}
		</AnimatePresence>
	);
});
