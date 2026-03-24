'use client';

import { ArrowRight02Icon, BookOpen01Icon, Idea01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import quickTips from '@/data/quick-tips.json';

interface Tip {
	id: string;
	subject: string;
	topic: string;
	grade: number;
	title: string;
	content: string;
	formula?: string;
	example?: string;
}

interface TipOfTheDayProps {
	weakTopics?: string[];
}

const DEFAULT_WEAK_TOPICS: string[] = [];

function getDayOfYear(): number {
	const now = new Date();
	const start = new Date(now.getFullYear(), 0, 0);
	const diff = now.getTime() - start.getTime();
	return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function TipOfTheDay({ weakTopics = DEFAULT_WEAK_TOPICS }: TipOfTheDayProps) {
	const router = useRouter();
	const [tip, setTip] = useState<Tip | null>(null);

	const selectTip = useCallback(() => {
		const tips = (quickTips.tips ?? []) as Tip[];
		if (tips.length === 0) return;

		// Prefer tips matching weak topics
		if (weakTopics.length > 0) {
			const matchingTips = tips.filter((t) =>
				weakTopics.some(
					(wt) =>
						wt.toLowerCase().includes(t.topic.toLowerCase()) ||
						t.topic.toLowerCase().includes(wt.toLowerCase()) ||
						wt.toLowerCase().includes(t.subject.toLowerCase())
				)
			);
			if (matchingTips.length > 0) {
				const dayIndex = getDayOfYear() % matchingTips.length;
				setTip(matchingTips[dayIndex]);
				return;
			}
		}

		// Fallback to daily rotation
		const dayIndex = getDayOfYear() % tips.length;
		setTip(tips[dayIndex]);
	}, [weakTopics]);

	useEffect(() => {
		selectTip();
	}, [selectTip]);

	if (!tip) return null;

	return (
		<Card className="rounded-[2rem] border-border/50 shadow-tiimo overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-600/5">
			<CardHeader className="p-6 pb-0">
				<CardTitle className="text-xs font-semibold  tracking-wider text-amber-600 flex items-center gap-2">
					<HugeiconsIcon icon={Idea01Icon} className="w-4 h-4" />
					Tip of the Day
				</CardTitle>
			</CardHeader>
			<CardContent className="p-6 space-y-3">
				<m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
					<h4 className="font-bold text-sm text-foreground">{tip.title}</h4>
					<p className="text-xs text-muted-foreground mt-0.5">
						{tip.subject} · {tip.topic}
					</p>
				</m.div>

				<p className="text-sm text-foreground/90 leading-relaxed">{tip.content}</p>

				{tip.formula && (
					<div className="bg-background/60 rounded-lg p-3 border border-border/50">
						<p className="text-xs font-mono text-foreground">{tip.formula}</p>
					</div>
				)}

				{tip.example && (
					<div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 border border-amber-200/50 dark:border-amber-800/50">
						<p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">Example</p>
						<p className="text-xs text-foreground/80">{tip.example}</p>
					</div>
				)}

				<Button
					variant="ghost"
					size="sm"
					className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950 p-0 h-auto"
					onClick={() =>
						router.push(
							`/tutor?topic=${encodeURIComponent(tip.topic)}&subject=${encodeURIComponent(tip.subject)}&prompt=${encodeURIComponent(`Explain ${tip.title} in detail with examples`)}`
						)
					}
				>
					<HugeiconsIcon icon={BookOpen01Icon} className="w-3.5 h-3.5 mr-1" />
					Explain More
					<HugeiconsIcon icon={ArrowRight02Icon} className="w-3.5 h-3.5 ml-1" />
				</Button>
			</CardContent>
		</Card>
	);
}
