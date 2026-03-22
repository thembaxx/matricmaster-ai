import { ActivityIcon, Warning } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

// Recent activity mock
const mockRecentActivity = [
	{ id: 1, user: 'john d.', action: 'completed math quiz', score: 85, time: '5 min ago' },
	{
		id: 2,
		user: 'sarah m.',
		action: 'unlocked achievement',
		achievement: 'first perfect score',
		time: '12 min ago',
	},
	{ id: 3, user: 'mike t.', action: 'started physics study session', time: '18 min ago' },
];

// Mock flagged content
const mockFlaggedContent = [
	{
		id: 1,
		type: 'question',
		content: 'question #234 - incorrect answer key',
		severity: 'high',
		reportedBy: 'user123',
		date: '2026-02-17',
	},
];

export function OverviewTab() {
	return (
		<div className="grid md:grid-cols-2 gap-4">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<HugeiconsIcon icon={ActivityIcon} className="h-5 w-5" />
						recent activity
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ScrollArea className="h-80">
						<div className="space-y-4">
							{mockRecentActivity.map((activity) => (
								<div key={activity.id} className="flex items-center gap-3">
									<Avatar className="h-8 w-8">
										<AvatarFallback className="text-xs">{activity.user.charAt(0)}</AvatarFallback>
									</Avatar>
									<div className="flex-1">
										<p className="text-sm font-medium">{activity.user}</p>
										<p className="text-xs text-muted-foreground">{activity.action}</p>
									</div>
									<span className="text-xs text-muted-foreground">{activity.time}</span>
								</div>
							))}
						</div>
					</ScrollArea>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<HugeiconsIcon icon={Warning} className="h-5 w-5 text-amber-500" />
						flagged content
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ScrollArea className="h-80">
						<div className="space-y-3">
							{mockFlaggedContent.length === 0 ? (
								<p className="text-sm text-muted-foreground text-center py-8">no flagged content</p>
							) : (
								mockFlaggedContent.map((item) => (
									<div key={item.id} className="p-3 border rounded-lg">
										<p className="text-sm">{item.content}</p>
										<p className="text-xs text-muted-foreground mt-1">
											reported by {item.reportedBy}
										</p>
									</div>
								))
							)}
						</div>
					</ScrollArea>
				</CardContent>
			</Card>
		</div>
	);
}
