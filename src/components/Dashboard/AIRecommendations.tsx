'use client';

import {
	BookOpen01Icon,
	BrainIcon,
	CheckmarkCircle02Icon,
	Target02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { memo, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WeakTopic } from '@/stores/useQuizToStudyPlanStore';
import { useQuizToStudyPlanStore } from '@/stores/useQuizToStudyPlanStore';

interface AIRecommendationsProps {
	compact?: boolean;
}

export const AIRecommendations = memo(function AIRecommendations({
	compact = false,
}: AIRecommendationsProps) {
	const router = useRouter();
	const weakTopics = useQuizToStudyPlanStore((s) => s.weakTopics);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted || weakTopics.length === 0) return null;

	const lowConfidenceTopics = weakTopics.filter((t) => t.confidence < 0.4);

	const handleGetHelp = (topic: WeakTopic) => {
		router.push(
			`/ai-tutor?topic=${encodeURIComponent(topic.topic)}&subject=${encodeURIComponent(topic.subject)}`
		);
	};

	if (compact) {
		return (
			<Button
				variant="outline"
				size="sm"
				className="h-auto py-2 px-3 border-destructive/30 text-xs font-medium text-destructive"
				onClick={() => {
					if (lowConfidenceTopics.length > 0) {
						handleGetHelp(lowConfidenceTopics[0]);
					}
				}}
			>
				<HugeiconsIcon icon={BrainIcon} className="w-3 h-3 mr-1.5" />
				{lowConfidenceTopics.length} need help
			</Button>
		);
	}

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base font-medium flex items-center gap-2">
					<HugeiconsIcon icon={BrainIcon} className="h-4 w-4 text-destructive" />
					ai tutor recommendations
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{lowConfidenceTopics.slice(0, 3).map((topic) => (
					<div
						key={topic.id}
						className="p-3 rounded-lg bg-destructive/5 border border-destructive/20"
					>
						<div className="flex items-start gap-3">
							<HugeiconsIcon
								icon={Target02Icon}
								className="h-5 w-5 text-destructive mt-0.5 shrink-0"
							/>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium">{topic.topic}</p>
								<p className="text-xs text-muted-foreground mt-0.5">
									confidence: {Math.round(topic.confidence * 100)}% • {topic.attempts} attempts
								</p>
								<div className="flex items-center gap-2 mt-2">
									<Button
										size="sm"
										variant="secondary"
										className="h-7 text-xs"
										onClick={() => handleGetHelp(topic)}
									>
										get help
									</Button>
								</div>
							</div>
						</div>
					</div>
				))}

				{weakTopics.length > 3 && (
					<p className="text-xs text-muted-foreground text-center">
						+ {weakTopics.length - 3} more topics need attention
					</p>
				)}
			</CardContent>
		</Card>
	);
});

interface UnifiedProgressProps {
	className?: string;
}

export const UnifiedProgress = memo(function UnifiedProgress({ className }: UnifiedProgressProps) {
	const weakTopics = useQuizToStudyPlanStore((s) => s.weakTopics);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	const lowConfidence = weakTopics.filter((t) => t.confidence < 0.4).length;
	const mediumConfidence = weakTopics.filter(
		(t) => t.confidence >= 0.4 && t.confidence < 0.6
	).length;
	const highConfidence = weakTopics.filter((t) => t.confidence >= 0.6).length;

	return (
		<div className={className}>
			<div className="grid grid-cols-3 gap-3">
				<div className="text-center p-3 rounded-xl bg-destructive/10">
					<HugeiconsIcon icon={BrainIcon} className="w-5 h-5 text-destructive mx-auto mb-1" />
					<p className="text-xl font-black text-destructive">{lowConfidence}</p>
					<p className="text-[10px] font-medium text-muted-foreground">need help</p>
				</div>
				<div className="text-center p-3 rounded-xl bg-amber-500/10">
					<HugeiconsIcon icon={BookOpen01Icon} className="w-5 h-5 text-amber-500 mx-auto mb-1" />
					<p className="text-xl font-black text-amber-500">{mediumConfidence}</p>
					<p className="text-[10px] font-medium text-muted-foreground">review</p>
				</div>
				<div className="text-center p-3 rounded-xl bg-green-500/10">
					<HugeiconsIcon
						icon={CheckmarkCircle02Icon}
						className="w-5 h-5 text-green-500 mx-auto mb-1"
					/>
					<p className="text-xl font-black text-green-500">{highConfidence}</p>
					<p className="text-[10px] font-medium text-muted-foreground">strong</p>
				</div>
			</div>
		</div>
	);
});
