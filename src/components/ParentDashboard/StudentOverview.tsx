'use client';

import {
	ChartBar,
	Clock01Icon,
	FileEditIcon,
	FireIcon,
	Medal01Icon,
	SentIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { SendEncouragement } from './SendEncouragement';

interface StudentOverviewProps {
	studentName: string;
	studentImage?: string;
	grade?: string;
	school?: string;
}

export function StudentOverview({
	studentName,
	studentImage,
	grade = 'Grade 12',
	school = 'Matric 2026',
}: StudentOverviewProps) {
	const [showEncourage, setShowEncourage] = useState(false);

	const { data, isLoading } = useQuery({
		queryKey: ['parent-overview', studentName],
		queryFn: async () => {
			const res = await fetch('/api/parent-dashboard');
			if (!res.ok) throw new Error('Failed to fetch');
			return res.json();
		},
		staleTime: 5 * 60 * 1000,
	});

	const stats = data?.overview ?? {
		streakDays: 0,
		totalHoursThisWeek: 0,
		averageQuizScore: 0,
		tasksCompleted: 0,
		totalTasks: 0,
	};

	const initials = studentName
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);

	const taskProgress = stats.totalTasks > 0 ? (stats.tasksCompleted / stats.totalTasks) * 100 : 0;

	return (
		<>
			<Card className="rounded-[2.5rem] border border-border/50 shadow-tiimo overflow-hidden">
				<div className="p-8 bg-linear-to-br from-primary/10 via-primary/5 to-transparent">
					<div className="flex items-center gap-5 flex-wrap">
						<Avatar className="w-20 h-20 rounded-[2rem] border-2 border-white shadow-lg">
							<AvatarImage src={studentImage} alt={studentName} />
							<AvatarFallback className="rounded-[2rem] text-lg font-black bg-primary/10 text-primary">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-[200px]">
							<h2 className="text-2xl font-black text-foreground tracking-tight">
								{studentName}'s Progress
							</h2>
							<div className="flex items-center gap-3 mt-1">
								<span className="text-xs font-bold text-muted-foreground tracking-wide">
									{grade}
								</span>
								<span className="w-1 h-1 rounded-full bg-muted-foreground" />
								<span className="text-xs font-bold text-muted-foreground tracking-wide">
									{school}
								</span>
							</div>
						</div>
						<div className="flex gap-2">
							<Button
								size="sm"
								variant="outline"
								className="rounded-full gap-2 font-bold text-xs"
								onClick={() => setShowEncourage(true)}
							>
								<HugeiconsIcon icon={SentIcon} className="w-4 h-4" />
								Encourage
							</Button>
							<Button
								size="sm"
								className="rounded-full gap-2 font-bold text-xs"
								onClick={() => {
									toast.info('Detailed report coming soon');
								}}
							>
								<HugeiconsIcon icon={FileEditIcon} className="w-4 h-4" />
								Full Report
							</Button>
						</div>
					</div>
				</div>

				<CardContent className="p-6">
					{isLoading ? (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{Array.from({ length: 4 }).map((_, i) => (
								<div key={`skeleton-${i}`} className="space-y-2">
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-8 w-16" />
								</div>
							))}
						</div>
					) : (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
							<StatItem
								icon={FireIcon}
								label="Current Streak"
								value={`${stats.streakDays} days`}
								color="text-orange-500"
								bgColor="bg-orange-500/10"
							/>
							<StatItem
								icon={Clock01Icon}
								label="Study This Week"
								value={`${stats.totalHoursThisWeek.toFixed(1)}h`}
								color="text-success"
								bgColor="bg-success/10"
							/>
							<StatItem
								icon={ChartBar}
								label="Quiz Average"
								value={`${stats.averageQuizScore}%`}
								color={stats.averageQuizScore >= 70 ? 'text-success' : 'text-warning'}
								bgColor={stats.averageQuizScore >= 70 ? 'bg-success/10' : 'bg-warning/10'}
							/>
							<StatItem
								icon={Medal01Icon}
								label="Tasks Done"
								value={`${stats.tasksCompleted}/${stats.totalTasks}`}
								color="text-primary"
								bgColor="bg-primary/10"
							/>
						</div>
					)}
					{!isLoading && (
						<div className="mt-5">
							<div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
								<span>Weekly Goal Progress</span>
								<span>{Math.round(taskProgress)}%</span>
							</div>
							<Progress value={taskProgress} className="h-2" />
						</div>
					)}
				</CardContent>
			</Card>

			{showEncourage && (
				<SendEncouragement
					studentName={studentName}
					open={showEncourage}
					onClose={() => setShowEncourage(false)}
				/>
			)}
		</>
	);
}

function StatItem({
	icon,
	label,
	value,
	color,
	bgColor,
}: {
	icon: typeof FireIcon;
	label: string;
	value: string;
	color: string;
	bgColor: string;
}) {
	return (
		<div className="flex items-center gap-3">
			<div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center', bgColor)}>
				<HugeiconsIcon icon={icon} className={cn('w-5 h-5', color)} />
			</div>
			<div>
				<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
					{label}
				</p>
				<p className="text-xl font-black text-foreground">{value}</p>
			</div>
		</div>
	);
}
