import {
	ActivityIcon,
	AnalyticsUpIcon,
	BookOpen01Icon,
	Loading03Icon,
	UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent } from '@/components/ui/card';
import type { AdminStats } from '@/hooks/useAdminDashboard';

interface StatsGridProps {
	stats: AdminStats;
	isLoading: boolean;
}

export function StatsGrid({ stats, isLoading }: StatsGridProps) {
	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
			<Card>
				<CardContent className="pt-6">
					{isLoading ? (
						<LoadingSkeleton className="text-primary" />
					) : (
						<div className="flex items-center gap-4">
							<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
								<HugeiconsIcon icon={UserGroupIcon} className="h-6 w-6 text-primary" />
							</div>
							<div>
								<p className="text-2xl font-bold tabular-nums">
									{stats.totalUsers.toLocaleString()}
								</p>
								<p className="text-sm text-muted-foreground">total users</p>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-6">
					{isLoading ? (
						<LoadingSkeleton className="text-green-500" />
					) : (
						<div className="flex items-center gap-4">
							<div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
								<HugeiconsIcon icon={ActivityIcon} className="h-6 w-6 text-green-500" />
							</div>
							<div>
								<p className="text-2xl font-bold tabular-nums">
									{stats.activeUsers.toLocaleString()}
								</p>
								<p className="text-sm text-muted-foreground">active</p>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-6">
					{isLoading ? (
						<LoadingSkeleton className="text-blue-500" />
					) : (
						<div className="flex items-center gap-4">
							<div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
								<HugeiconsIcon icon={BookOpen01Icon} className="h-6 w-6 text-blue-500" />
							</div>
							<div>
								<p className="text-2xl font-bold tabular-nums">
									{stats.questionsAttempted.toLocaleString()}
								</p>
								<p className="text-sm text-muted-foreground">attempts</p>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-6">
					{isLoading ? (
						<LoadingSkeleton className="text-amber-500" />
					) : (
						<div className="flex items-center gap-4">
							<div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
								<HugeiconsIcon icon={AnalyticsUpIcon} className="h-6 w-6 text-amber-500" />
							</div>
							<div>
								<p className="text-2xl font-bold tabular-nums">{stats.averageScore}%</p>
								<p className="text-sm text-muted-foreground">avg score</p>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function LoadingSkeleton({ className }: { className?: string }) {
	return (
		<div className="flex items-center justify-center h-20">
			<HugeiconsIcon icon={Loading03Icon} className={`h-6 w-6 animate-spin ${className}`} />
		</div>
	);
}
