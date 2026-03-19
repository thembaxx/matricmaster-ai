import { ArrowDown01Icon, ArrowUp01Icon, CircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { SubjectPerformance } from './constants';

function getTrendIcon(trend: 'up' | 'down' | 'stable') {
	switch (trend) {
		case 'up':
			return <HugeiconsIcon icon={ArrowUp01Icon} className="w-4 h-4 text-green-500" />;
		case 'down':
			return <HugeiconsIcon icon={ArrowDown01Icon} className="w-4 h-4 text-red-500" />;
		default:
			return <HugeiconsIcon icon={CircleIcon} className="w-4 h-4 text-yellow-500" />;
	}
}

function getTrendColor(trend: 'up' | 'down' | 'stable') {
	switch (trend) {
		case 'up':
			return 'text-green-500';
		case 'down':
			return 'text-red-500';
		default:
			return 'text-yellow-500';
	}
}

export function SubjectPerformanceCard({ subject }: { subject: SubjectPerformance }) {
	return (
		<Card key={subject.subject}>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg">{subject.subject}</CardTitle>
					<div className={getTrendColor(subject.trend)}>{getTrendIcon(subject.trend)}</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div>
						<div className="flex justify-between text-sm mb-1">
							<span>Average Score</span>
							<span className="font-medium">{subject.averageScore}%</span>
						</div>
						<Progress value={subject.averageScore} className="h-2" />
					</div>
					<div className="text-sm">
						<p className="text-muted-foreground">{subject.questionsAnswered} questions answered</p>
					</div>
					<div className="grid grid-cols-2 gap-3 text-sm">
						<div>
							<p className="text-muted-foreground">Strengths</p>
							<div className="flex flex-wrap gap-1 mt-1">
								{subject.strengthAreas.slice(0, 2).map((area) => (
									<Badge key={area} variant="outline" className="text-xs bg-green-500/10">
										{area}
									</Badge>
								))}
							</div>
						</div>
						<div>
							<p className="text-muted-foreground">Needs Work</p>
							<div className="flex flex-wrap gap-1 mt-1">
								{subject.weakAreas.slice(0, 2).map((area) => (
									<Badge key={area} variant="outline" className="text-xs bg-red-500/10">
										{area}
									</Badge>
								))}
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
