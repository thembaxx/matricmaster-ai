'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getRecentMistakes } from '@/lib/db/mistake-to-study-plan';

export function SuggestedReview() {
	const [mistakes, setMistakes] = useState<Array<{ topic: string; questionId: string }>>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadMistakes() {
			try {
				const recent = await getRecentMistakes(5);
				setMistakes(recent);
			} catch (error) {
				console.error('Failed to load mistakes:', error);
			} finally {
				setLoading(false);
			}
		}
		loadMistakes();
	}, []);

	if (loading || mistakes.length === 0) return null;

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
					<li key={i} className="text-sm font-medium">
						• {m.topic}
					</li>
				))}
			</ul>
			<Button size="sm" className="mt-4 rounded-full">
				Add to Study Plan
			</Button>
		</Card>
	);
}
