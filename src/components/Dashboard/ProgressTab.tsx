import { m } from 'framer-motion';
import dynamic from 'next/dynamic';
import { GrowthInsights } from '@/components/Dashboard/GrowthInsights';
import { TipOfTheDay } from '@/components/Dashboard/TipOfTheDay';
import { WeeklyChallenge } from '@/components/Dashboard/WeeklyChallenge';
import { Button } from '@/components/ui/button';
import type { UserProgressSummary } from '@/lib/db/progress-actions';

const GrowthMap = dynamic(
	() => import('@/components/Dashboard/GrowthMap').then((mod) => ({ default: mod.GrowthMap })),
	{ ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" /> }
);

interface ProgressTabProps {
	weaknessData: {
		topic: string;
		mistakes: number;
		subject: string;
		confidence: number | null;
		trend: 'up' | 'down' | 'stable';
		struggleCount: number;
	}[];
	growthInsights: string[];
	progress: UserProgressSummary | undefined;
	weakTopicNames: string[];
}

export function ProgressTab({
	weaknessData,
	growthInsights,
	progress,
	weakTopicNames,
}: ProgressTabProps) {
	return (
		<m.div layout className="space-y-6 pb-36">
			<div className="flex justify-end">
				<Button variant="outline" size="sm" onClick={() => window.print()} className="print:hidden">
					Export Report
				</Button>
			</div>
			{weaknessData.length > 0 && (
				<div className="space-y-6">
					<div className="tiimo-card p-6">
						<h3 className="heading-4 mb-1 text-balance">Growth Map</h3>
						<p className="text-sm text-muted-foreground mb-4">
							Topics where you need the most practice
						</p>
						<GrowthMap data={weaknessData} />
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<GrowthInsights insights={growthInsights} weakTopics={weaknessData.slice(0, 3)} />
						<TipOfTheDay weakTopics={weakTopicNames} />
					</div>
				</div>
			)}
			<WeeklyChallenge initialProgress={progress} />
		</m.div>
	);
}
