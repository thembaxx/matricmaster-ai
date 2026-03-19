import { Badge } from '@/components/ui/badge';
import { ACHIEVEMENT_LEVELS } from './constants';

export function AchievementLevelsGrid() {
	return (
		<div>
			<h4 className="font-medium mb-3">Achievement Levels</h4>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				{ACHIEVEMENT_LEVELS.map((item) => (
					<div key={item.level} className="flex items-center gap-2">
						<Badge className={item.color}>{item.level}</Badge>
						<span className="text-xs text-muted-foreground">{item.desc}</span>
					</div>
				))}
			</div>
		</div>
	);
}
