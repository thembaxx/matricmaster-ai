'use client';

import { BookOpen01Icon as BookOpen } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Icon } from '@iconify/react';
import { motion as m } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { usePastPapers } from '@/hooks/usePastPapers';
import { useQuizPastPaperIntegration } from '@/hooks/useQuizPastPaperIntegration';
import { STAGGER_ITEM } from '@/lib/animation-presets';

interface PastPaperSuggestionsProps {
	mistakeCount: number;
	onDismiss?: () => void;
}

export function PastPaperSuggestions({
	mistakeCount,
	onDismiss: _onDismiss,
}: PastPaperSuggestionsProps) {
	const router = useRouter();
	const { filteredPapers: availablePapers } = usePastPapers();
	const { recommendations, refreshRecommendations } = useQuizPastPaperIntegration(availablePapers);

	if (mistakeCount === 0 || recommendations.length === 0) {
		return null;
	}

	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.6 }}
			className="w-full max-w-md space-y-4"
		>
			<div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-4 space-y-3">
				<div className="flex items-center gap-2">
					<Icon icon="fluent:sparkle-24-filled" className="w-5 h-5 text-accent-lime" />
					<h3 className="font-black text-foreground text-sm tracking-wide">
						Practice with Past Papers
					</h3>
				</div>

				<p className="text-label-secondary text-xs font-medium leading-relaxed">
					Based on your {mistakeCount} mistake{mistakeCount > 1 ? 's' : ''}, here are some past
					papers to help you improve:
				</p>

				<div className="space-y-2">
					{recommendations.slice(0, 3).map((rec) => (
						<m.div
							key={rec.paperId}
							variants={STAGGER_ITEM}
							className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-border/50"
						>
							<div className="space-y-1">
								<p className="font-black text-foreground text-xs">
									{rec.subject} {rec.paper}
								</p>
								<p className="text-label-tertiary text-[10px] font-medium">
									{rec.month} {rec.year} • {rec.reason}
								</p>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => router.push(`/past-paper?id=${rec.paperId}`)}
								className="h-8 rounded-xl font-black text-[10px] tracking-widest ios-active-scale"
							>
								<HugeiconsIcon icon={BookOpen} className="w-4 h-4 mr-1" />
								View
							</Button>
						</m.div>
					))}
				</div>

				<div className="flex gap-2 pt-2">
					<Button
						variant="outline"
						onClick={() => router.push('/past-papers')}
						className="flex-1 rounded-xl font-black text-[10px] tracking-widest h-10 ios-active-scale border-border"
					>
						<Icon icon="fluent:folder-open-24-regular" className="w-4 h-4 mr-2" />
						Browse All
					</Button>
					<Button
						variant="default"
						onClick={refreshRecommendations}
						className="flex-1 rounded-xl font-black text-[10px] tracking-widest h-10 ios-active-scale bg-accent-lime text-accent-lime-foreground"
					>
						<Icon icon="fluent:arrow-sync-24-regular" className="w-4 h-4 mr-2" />
						Refresh
					</Button>
				</div>
			</div>
		</m.div>
	);
}
