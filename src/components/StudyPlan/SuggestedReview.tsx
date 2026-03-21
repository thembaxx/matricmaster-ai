'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
	addMistakeToStudyPlanAction,
	getRecentMistakesAction,
} from '@/actions/mistake-to-study-plan';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function SuggestedReview() {
	const [isAdding, setIsAdding] = useState(false);

	const { data: mistakes = [], isLoading } = useQuery({
		queryKey: ['recentMistakes'],
		queryFn: () => getRecentMistakesAction(5),
	});

	const handleAddToPlan = async () => {
		if (mistakes.length === 0) return;
		setIsAdding(true);
		try {
			await addMistakeToStudyPlanAction(mistakes);
		} catch (error) {
			console.debug('Failed to add to study plan:', error);
		} finally {
			setIsAdding(false);
		}
	};

	if (isLoading || mistakes.length === 0) return null;

	return (
		<Card className="p-4 rounded-2xl border-amber-500/30 bg-amber-50 dark:bg-amber-950/30">
			<div className="flex items-center gap-2 mb-3">
				<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-amber-500" />
				<h4 className="font-bold text-sm">Suggested Review</h4>
			</div>
			<p className="text-xs text-muted-foreground mb-3">
				Based on your recent quiz mistakes, we recommend reviewing:
			</p>
			<ul className="space-y-2">
				{mistakes.map((m, i) => (
					<li key={`mistake-${i}`} className="text-sm font-medium">
						• {m.topic}
					</li>
				))}
			</ul>
			<Button size="sm" className="mt-4 rounded-full" onClick={handleAddToPlan} disabled={isAdding}>
				{isAdding ? 'Adding...' : 'Add to Study Plan'}
			</Button>
		</Card>
	);
}
