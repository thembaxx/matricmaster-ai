import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AchievementLevelsGrid } from './achievement-levels-grid';
import { PassRequirementsList } from './pass-requirements-list';

export function UnderstandingResultsCard() {
	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle>Understanding Your Results</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					<AchievementLevelsGrid />
					<PassRequirementsList />
				</div>
			</CardContent>
		</Card>
	);
}
