import { CodeIcon, Settings02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { ModerationPattern } from './moderation-types';
import { getSeverityColor } from './moderation-types';

interface AutoModerationTabProps {
	patterns: ModerationPattern[];
}

export function AutoModerationTab({ patterns }: AutoModerationTabProps) {
	return (
		<>
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-bold font-serif">moderation patterns</h2>
				<Button>
					<HugeiconsIcon icon={Settings02Icon} className="h-4 w-4 mr-2" />
					add pattern
				</Button>
			</div>

			<div className="space-y-4">
				{patterns.map((pattern) => (
					<Card key={pattern.id}>
						<CardContent className="pt-6">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="p-2 bg-muted rounded-lg">
										<HugeiconsIcon icon={CodeIcon} className="h-5 w-5" />
									</div>
									<div>
										<div className="flex items-center gap-2 mb-1">
											<code className="text-sm bg-muted px-2 py-1 rounded">{pattern.pattern}</code>
											<Badge variant="outline">{pattern.patternType}</Badge>
											<Badge className={getSeverityColor(pattern.severity)}>
												{pattern.severity}
											</Badge>
										</div>
										<p className="text-xs text-muted-foreground font-mono">
											action: {pattern.action.toLowerCase()}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Badge variant={pattern.isActive ? 'default' : 'secondary'}>
										{pattern.isActive ? 'active' : 'inactive'}
									</Badge>
									<Button size="sm" variant="outline">
										Pencil
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</>
	);
}
