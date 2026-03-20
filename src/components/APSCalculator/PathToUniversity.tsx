import { TargetIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UniversityRequirement {
	name: string;
	faculty: string;
	minAps: number;
	additionalRequirements?: string;
}

interface GoalPath {
	apsNeeded: number;
	improvements: string[];
	path: string;
}

interface PathToUniversityProps {
	closestUniversities: UniversityRequirement[];
	totalAPS: number;
	getGoalPath: (target: UniversityRequirement) => GoalPath | null;
}

export function PathToUniversity({
	closestUniversities,
	totalAPS,
	getGoalPath,
}: PathToUniversityProps) {
	if (closestUniversities.length === 0) return null;

	return (
		<Card className="mt-6 rounded-xl border-t-4 border-t-primary">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<HugeiconsIcon icon={TargetIcon} className="w-5 h-5 text-primary" />
					Your Path to University
				</CardTitle>
				<CardDescription>Almost there! Here's how to reach your goal</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{closestUniversities.map((uni, idx) => {
					const goal = getGoalPath(uni);
					if (!goal) return null;
					return (
						<div
							key={`${uni.name}-${uni.faculty}-${idx}`}
							className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20"
						>
							<div className="flex items-start justify-between mb-3">
								<div>
									<h4 className="font-bold text-sm">{uni.name}</h4>
									<p className="text-xs text-muted-foreground">{uni.faculty}</p>
								</div>
								<div className="text-right">
									<div className="text-2xl font-black text-primary">+{goal.apsNeeded}</div>
									<div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
										APS needed
									</div>
								</div>
							</div>

							<div className="flex items-center gap-2 mb-3">
								<div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
									<div
										className="h-full bg-primary rounded-full"
										style={{ width: `${Math.min((totalAPS / uni.minAps) * 100, 100)}%` }}
									/>
								</div>
								<span className="text-xs font-mono font-bold">
									{totalAPS}/{uni.minAps}
								</span>
							</div>

							<div className="space-y-1">
								{goal.improvements.map((imp, i) => (
									<p
										key={`improvement-${i}`}
										className="text-xs text-muted-foreground flex items-center gap-2"
									>
										<TrendingUp className="w-3 h-3 text-green-500" />
										{imp}
									</p>
								))}
							</div>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
