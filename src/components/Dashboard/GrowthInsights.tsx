'use client';

import { ArrowRight02Icon, Idea01Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GrowthInsightsProps {
	insights: string[];
	weakTopics?: { topic: string; subject?: string }[];
}

const DEFAULT_WEAK_TOPICS: { topic: string; subject?: string }[] = [];

export function GrowthInsights({
	insights,
	weakTopics = DEFAULT_WEAK_TOPICS,
}: GrowthInsightsProps) {
	const router = useRouter();

	if (insights.length === 0) {
		return null;
	}

	return (
		<Card className="rounded-xl border-border/50 shadow-tiimo overflow-hidden bg-gradient-to-br from-violet-500/10 to-purple-600/5">
			<CardHeader className="p-6 pb-0">
				<CardTitle className="text-xs font-semibold  tracking-wider text-violet-600 flex items-center gap-2">
					<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4" aria-hidden="true" />
					AI Insights
				</CardTitle>
			</CardHeader>
			<CardContent className="p-6 space-y-3">
				{insights.map((insight, i) => (
					<m.div
						key={insight}
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: i * 0.1 }}
						className="flex items-start gap-3"
					>
						<HugeiconsIcon
							icon={Idea01Icon}
							className={cn(
								'w-4 h-4 mt-0.5 flex-shrink-0',
								i === 0 ? 'text-tiimo-orange' : i === 1 ? 'text-tiimo-green' : 'text-tiimo-yellow'
							)}
							aria-hidden="true"
						/>
						<p className="text-sm text-foreground/90 leading-relaxed">{insight}</p>
					</m.div>
				))}

				{weakTopics.length > 0 && (
					<div className="pt-3 border-t border-border/50">
						<Button
							variant="ghost"
							size="sm"
							className="text-xs text-tiimo-lavender hover:text-tiimo-lavender hover:bg-tiimo-lavender/10 p-0 h-auto transition-all duration-200"
							onClick={() =>
								router.push(
									`/ai-tutor?topic=${encodeURIComponent(weakTopics[0].topic)}&subject=${encodeURIComponent(weakTopics[0].subject ?? '')}&context=help`
								)
							}
						>
							Get Help
							<HugeiconsIcon icon={ArrowRight02Icon} className="w-3.5 h-3.5 ml-1" />
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
