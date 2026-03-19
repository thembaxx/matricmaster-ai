import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Achievement } from './constants';

export function AchievementGrid({ achievements }: { achievements: Achievement[] }) {
	return (
		<div className="grid md:grid-cols-3 gap-4">
			{achievements.map((achievement) => (
				<Card key={achievement.id} className={achievement.unlockedAt ? '' : 'opacity-60'}>
					<CardContent className="p-4">
						<div className="flex items-start gap-3">
							<div className="text-3xl">{achievement.icon}</div>
							<div className="flex-1">
								<h4 className="font-medium">{achievement.name}</h4>
								<p className="text-sm text-muted-foreground">{achievement.description}</p>
								{!achievement.unlockedAt && (
									<div className="mt-2">
										<div className="flex justify-between text-xs mb-1">
											<span>Progress</span>
											<span>{achievement.progress}%</span>
										</div>
										<Progress value={achievement.progress} className="h-1" />
									</div>
								)}
								{achievement.unlockedAt && <Badge className="mt-2 bg-green-500">Unlocked</Badge>}
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
