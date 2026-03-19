import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DailyActivity } from './constants';

function formatTime(minutes: number) {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	if (hours > 0) return `${hours}h ${mins}m`;
	return `${mins}m`;
}

export function DailyActivityList({ activity }: { activity: DailyActivity[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Daily Activity</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{activity.map((day, idx) => (
						<div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
							<div className="flex items-center gap-3">
								<div className="w-16 text-sm font-medium">{day.date}</div>
								<div className="text-sm text-muted-foreground">
									{formatTime(day.studyMinutes)} study time
								</div>
							</div>
							<div className="flex items-center gap-4 text-sm">
								<Badge variant="outline">{day.quizzesTaken} quizzes</Badge>
								<Badge variant="outline">{day.flashcardsReviewed} cards</Badge>
								<Badge className="bg-primary/10 text-primary">+{day.xpEarned} XP</Badge>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
