'use client';

import { BookOpen01Icon, Delete02Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion as m } from 'motion/react';
import { useRouter } from 'next/navigation';
import { memo, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useQuizToStudyPlanStore } from '@/stores/useQuizToStudyPlanStore';

interface WeakTopicsWidgetProps {
	compact?: boolean;
}

export const WeakTopicsWidget = memo(function WeakTopicsWidget({
	compact = false,
}: WeakTopicsWidgetProps) {
	const router = useRouter();
	const weakTopics = useQuizToStudyPlanStore((s) => s.weakTopics);
	const removeWeakTopic = useQuizToStudyPlanStore((s) => s.removeWeakTopic);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	const displayTopics = weakTopics.slice(0, compact ? 3 : 5);

	if (displayTopics.length === 0) return null;

	const handleAddToStudyPlan = () => {
		const topicsParam = encodeURIComponent(displayTopics.map((t) => t.topic).join(','));
		router.push(`/study-plan?topics=${topicsParam}`);
	};

	if (compact) {
		return (
			<Button
				variant="outline"
				size="sm"
				className="h-auto py-2 px-3 border-primary/30 text-xs font-medium"
				onClick={handleAddToStudyPlan}
			>
				<HugeiconsIcon icon={BookOpen01Icon} className="size-3 mr-1.5" />
				{displayTopics.length} weak topic{displayTopics.length !== 1 ? 's' : ''}
			</Button>
		);
	}

	return (
		<m.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 border border-primary/20 rounded-2xl p-5"
		>
			<div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
			<div className="absolute -bottom-16 -left-16 w-32 h-32 bg-primary/5 rounded-full blur-[60px]" />

			<div className="relative flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
						<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-primary" />
					</div>
					<span className="text-sm font-semibold text-foreground">Topics to review</span>
				</div>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 px-3 text-xs font-medium hover:bg-primary/10"
					onClick={handleAddToStudyPlan}
				>
					add to plan
				</Button>
			</div>
			<div className="relative flex flex-wrap gap-2.5">
				{displayTopics.map((topic, index) => (
					<m.div
						key={topic.id}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: index * 0.05 }}
						className="inline-flex items-center gap-2 px-3 py-1.5 bg-destructive/10 hover:bg-destructive/15 text-destructive text-sm font-medium rounded-full transition-colors group"
					>
						<span className="truncate max-w-[120px]">{topic.topic}</span>
						<span className="text-xs opacity-70 font-numeric tabular-nums">
							{Math.round(topic.confidence * 100)}%
						</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => removeWeakTopic(topic.id)}
							className="h-auto p-0.5 ml-0.5 opacity-50 hover:opacity-100 transition-opacity"
							type="button"
						>
							<HugeiconsIcon icon={Delete02Icon} className="size-3" />
						</Button>
					</m.div>
				))}
			</div>
		</m.div>
	);
});
