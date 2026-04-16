'use client';

import { BookOpen01Icon, Delete02Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
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
		<div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-primary" />
					<span className="text-xs font-black text-primary tracking-widest">
						weak topics from quiz
					</span>
				</div>
				<Button
					variant="ghost"
					size="sm"
					className="h-6 px-2 text-xs font-black"
					onClick={handleAddToStudyPlan}
				>
					add to plan
				</Button>
			</div>
			<div className="flex flex-wrap gap-2">
				{displayTopics.map((topic) => (
					<div
						key={topic.id}
						className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-destructive/10 text-destructive text-xs font-black rounded-full"
					>
						<span>{topic.topic}</span>
						<span className="opacity-70">{Math.round(topic.confidence * 100)}%</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => removeWeakTopic(topic.id)}
							className="h-auto p-0.5 ml-0.5 hover:opacity-70"
							type="button"
						>
							<HugeiconsIcon icon={Delete02Icon} className="size-3" />
						</Button>
					</div>
				))}
			</div>
		</div>
	);
});
