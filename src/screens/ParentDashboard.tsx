'use client';

import { ArrowLeft01Icon, Settings01Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AlertsPanel } from '@/components/ParentDashboard/AlertsPanel';
import { ExamCountdown } from '@/components/ParentDashboard/ExamCountdown';
import { StudentOverview } from '@/components/ParentDashboard/StudentOverview';
import { SubjectPerformance } from '@/components/ParentDashboard/SubjectPerformance';
import { WeeklyProgress } from '@/components/ParentDashboard/WeeklyProgress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ParentDashboardProps {
	userName?: string;
}

export default function ParentDashboard({ userName = 'Student' }: ParentDashboardProps) {
	const router = useRouter();

	const { data } = useQuery({
		queryKey: ['parent-insights', userName],
		queryFn: async () => {
			const res = await fetch('/api/parent-insights', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ studentName: userName }),
			});
			if (!res.ok) return null;
			return res.json();
		},
		staleTime: 5 * 60 * 1000,
	});

	return (
		<div className="flex flex-col h-full bg-background min-w-0">
			<header className="px-6 pt-12 pb-6 flex items-center justify-between shrink-0 max-w-4xl mx-auto w-full">
				<Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
					<HugeiconsIcon icon={ArrowLeft01Icon} className="w-6 h-6" />
				</Button>
				<h1 className="text-xl font-black tracking-tight">parent portal</h1>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.push('/parent-dashboard/settings')}
					className="rounded-full"
				>
					<HugeiconsIcon icon={Settings01Icon} className="w-6 h-6" />
				</Button>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-4 pb-32 max-w-4xl mx-auto w-full space-y-8">
					{data?.insight && (
						<div className="p-6 rounded-[2.5rem] bg-linear-to-r from-primary/5 via-success/5 to-primary/5 border border-border/50 shadow-tiimo">
							<div className="flex items-center gap-3 mb-3">
								<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
									<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-primary" />
								</div>
								<p className="text-[10px] font-bold text-muted-foreground tracking-widest">
									ai insight
								</p>
							</div>
							<p className="text-sm font-medium leading-relaxed">{data.insight}</p>
						</div>
					)}

					<StudentOverview studentName={userName} />

					<AlertsPanel />

					<WeeklyProgress />

					<SubjectPerformance />

					<ExamCountdown />
				</main>
			</ScrollArea>
		</div>
	);
}
