import { Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { SubjectPerformance } from '@/hooks/useAdminDashboard';

const SubjectPerformanceChart = dynamic(
	() => import('../SubjectPerformanceChart').then((mod) => mod.SubjectPerformanceChart),
	{
		ssr: false,
		loading: () => <Skeleton className="h-80 w-full" />,
	}
);

interface AnalyticsTabProps {
	subjectPerformance: SubjectPerformance[];
	isLoading: boolean;
}

export function AnalyticsTab({ subjectPerformance, isLoading }: AnalyticsTabProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>subject performance</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<HugeiconsIcon icon={Loading03Icon} className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : subjectPerformance.length > 0 ? (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<SubjectPerformanceChart subjectPerformance={subjectPerformance} />
						<div className="space-y-3">
							<h4 className="text-sm font-bold text-muted-foreground  tracking-wider">
								score distribution
							</h4>
							{subjectPerformance.map((subject) => (
								<div
									key={subject.subjectId}
									className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
								>
									<div
										className="w-2 h-8 rounded-full"
										style={{
											backgroundColor:
												subject.averageScore >= 80
													? 'var(--color-success)'
													: subject.averageScore >= 60
														? 'var(--color-primary)'
														: 'var(--color-warning)',
										}}
									/>
									<div className="flex-1 min-w-0">
										<p className="font-medium text-sm truncate">{subject.subjectName}</p>
										<p className="text-xs text-muted-foreground">
											{subject.questionsAttempted.toLocaleString()} attempts
										</p>
									</div>
									<p className="text-lg font-black">{subject.averageScore}%</p>
								</div>
							))}
						</div>
					</div>
				) : (
					<div className="text-center py-8 text-muted-foreground">
						<p>no performance data available yet.</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
