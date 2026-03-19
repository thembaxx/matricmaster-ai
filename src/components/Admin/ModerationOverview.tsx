import { Chat01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ModerationOverviewProps {
	flagReasons: { name: string; count: number }[];
	contentTypes: { type: string; count: number }[];
}

export function ModerationOverview({ flagReasons, contentTypes }: ModerationOverviewProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Moderation Overview</CardTitle>
				<CardDescription>Summary of content moderation activities</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<h3 className="font-medium mb-4">Flag Reasons</h3>
						<div className="space-y-2">
							{flagReasons.map((reason) => (
								<div key={reason.name} className="flex items-center justify-between">
									<span className="text-sm">{reason.name}</span>
									<div className="flex items-center gap-2">
										<div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
											<div
												className="h-full bg-primary"
												style={{ width: `${Math.min(reason.count * 5 + 10, 100)}%` }}
											/>
										</div>
										<span className="text-xs text-muted-foreground w-8 text-right">
											{reason.count}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
					<div>
						<h3 className="font-medium mb-4">Content Types Flagged</h3>
						<div className="space-y-2">
							{contentTypes.map((item) => (
								<div key={item.type} className="flex items-center justify-between">
									<span className="text-sm flex items-center gap-2">
										<HugeiconsIcon icon={Chat01Icon} className="h-4 w-4" />
										{item.type}
									</span>
									<div className="flex items-center gap-2">
										<div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
											<div
												className="h-full bg-primary"
												style={{ width: `${Math.min(item.count * 5 + 10, 100)}%` }}
											/>
										</div>
										<span className="text-xs text-muted-foreground w-8 text-right">
											{item.count}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
