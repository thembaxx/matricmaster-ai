import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { StudyStats } from './constants';

export function LevelProgressCard({ stats }: { stats: StudyStats }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Level Progress</CardTitle>
				<CardDescription>
					{stats.xp} / {stats.xpToNextLevel} XP to Level {stats.level + 1}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Progress value={(stats.xp / stats.xpToNextLevel) * 100} className="h-3" />
				<div className="mt-2 flex justify-between text-sm">
					<span className="text-muted-foreground">
						{stats.xpToNextLevel - stats.xp} XP remaining
					</span>
					<span className="font-medium">{Math.round((stats.xp / stats.xpToNextLevel) * 100)}%</span>
				</div>
			</CardContent>
		</Card>
	);
}
