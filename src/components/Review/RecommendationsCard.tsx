import {
	AiBrain01Icon,
	ArrowRight01Icon,
	BookOpen01Icon,
	Clock01Icon,
	StarIcon,
	Target01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { RecommendationsResponse } from './constants';

function getPriorityColor(priority: string) {
	switch (priority) {
		case 'high':
			return 'destructive';
		case 'medium':
			return 'secondary';
		case 'low':
			return 'outline';
		default:
			return 'outline';
	}
}

function getRecommendationIcon(type: string) {
	switch (type) {
		case 'weak_topic':
			return <HugeiconsIcon icon={Target01Icon} className="h-4 w-4" />;
		case 'review':
			return <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />;
		case 'practice':
			return <HugeiconsIcon icon={AiBrain01Icon} className="h-4 w-4" />;
		case 'flashcard':
			return <HugeiconsIcon icon={BookOpen01Icon} className="h-4 w-4" />;
		default:
			return <HugeiconsIcon icon={StarIcon} className="h-4 w-4" />;
	}
}

export function RecommendationsCard({
	recommendations,
}: {
	recommendations: RecommendationsResponse;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<HugeiconsIcon icon={Target01Icon} className="h-5 w-5" />
					Personalized Recommendations
				</CardTitle>
				<CardDescription>{recommendations.summary}</CardDescription>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-75 pr-4">
					<div className="space-y-3">
						{recommendations.recommendations.map((rec, index) => (
							<div
								key={`rec-${index}`}
								className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
							>
								<div className="mt-0.5 text-muted-foreground">
									{getRecommendationIcon(rec.type)}
								</div>
								<div className="flex-1 space-y-1">
									<div className="flex items-center gap-2">
										<span className="font-medium">{rec.topic}</span>
										<Badge
											variant={
												getPriorityColor(rec.priority) as
													| 'default'
													| 'secondary'
													| 'destructive'
													| 'outline'
											}
										>
											{rec.priority}
										</Badge>
									</div>
									<p className="text-sm text-muted-foreground">{rec.reason}</p>
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<HugeiconsIcon icon={Clock01Icon} className="h-3 w-3" />
										{rec.estimatedTime}
									</div>
								</div>
								<HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 text-muted-foreground" />
							</div>
						))}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
