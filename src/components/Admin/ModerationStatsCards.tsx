import { Settings02Icon, Tick01Icon, ViewIcon, Warning } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent } from '@/components/ui/card';
import type { ContentFlag, ModerationPattern } from './moderation-types';

interface ModerationStatsCardsProps {
	flags: ContentFlag[];
	patterns: ModerationPattern[];
}

export function ModerationStatsCards({ flags, patterns }: ModerationStatsCardsProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-yellow-100 rounded-lg">
							<HugeiconsIcon icon={Warning} className="h-6 w-6 text-yellow-600" />
						</div>
						<div>
							<p className="text-2xl font-bold">
								{flags.filter((f) => f.status === 'pending').length}
							</p>
							<p className="text-sm text-muted-foreground">Pending Reviews</p>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-blue-100 rounded-lg">
							<HugeiconsIcon icon={ViewIcon} className="h-6 w-6 text-blue-600" />
						</div>
						<div>
							<p className="text-2xl font-bold">
								{flags.filter((f) => f.status === 'reviewed').length}
							</p>
							<p className="text-sm text-muted-foreground">Under Review</p>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-green-100 rounded-lg">
							<HugeiconsIcon icon={Tick01Icon} className="h-6 w-6 text-green-600" />
						</div>
						<div>
							<p className="text-2xl font-bold">
								{flags.filter((f) => f.status === 'actioned').length}
							</p>
							<p className="text-sm text-muted-foreground">Action Taken</p>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-purple-100 rounded-lg">
							<HugeiconsIcon icon={Settings02Icon} className="h-6 w-6 text-purple-600" />
						</div>
						<div>
							<p className="text-2xl font-bold">{patterns.filter((p) => p.isActive).length}</p>
							<p className="text-sm text-muted-foreground">Active Filters</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
