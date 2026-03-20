'use client';

import { Calendar01Icon, CalendarAdd01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ExamData {
	subject: string;
	date: string;
	daysLeft: number;
	readiness: number;
	priority: 'high' | 'medium' | 'low';
}

function getPriorityStyles(priority: 'high' | 'medium' | 'low') {
	switch (priority) {
		case 'high':
			return {
				badge: 'bg-destructive/10 text-destructive border-destructive/20',
				border: 'border-destructive/30 bg-destructive-soft',
			};
		case 'medium':
			return {
				badge: 'bg-warning/10 text-warning border-warning/20',
				border: 'border-warning/30 bg-warning-soft',
			};
		default:
			return {
				badge: 'bg-success/10 text-success border-success/20',
				border: 'border-border/30 bg-muted/20',
			};
	}
}

export function ExamCountdown() {
	const { data, isLoading } = useQuery({
		queryKey: ['parent-exam-countdown'],
		queryFn: async () => {
			const res = await fetch('/api/parent-dashboard');
			if (!res.ok) throw new Error('Failed to fetch');
			const json = await res.json();
			return json.upcomingExams;
		},
		staleTime: 5 * 60 * 1000,
	});

	const exams: ExamData[] = data?.exams ?? [];

	return (
		<Card className="rounded-[2.5rem] border border-border/50 shadow-tiimo overflow-hidden">
			<CardHeader className="bg-muted/30 px-8 py-6">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
						<HugeiconsIcon icon={Calendar01Icon} className="w-5 h-5 text-warning" />
					</div>
					<CardTitle className="text-lg font-black tracking-tight">Upcoming Exams</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="p-6 space-y-4">
				{isLoading ? (
					Array.from({ length: 2 }).map((_, i) => (
						<div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
					))
				) : exams.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<HugeiconsIcon icon={Calendar01Icon} className="w-12 h-12 mx-auto mb-3 opacity-30" />
						<p className="text-sm font-medium">No upcoming exams</p>
						<p className="text-xs mt-1">Exam dates will appear here</p>
					</div>
				) : (
					exams.map((exam) => {
						const styles = getPriorityStyles(exam.priority);
						const urgencyLabel =
							exam.daysLeft <= 7 ? 'Urgent' : exam.daysLeft <= 14 ? 'Soon' : 'Upcoming';

						return (
							<div
								key={exam.subject}
								className={cn('p-5 rounded-2xl border transition-colors', styles.border)}
							>
								<div className="flex items-center justify-between mb-3">
									<div>
										<h3 className="font-bold text-sm">{exam.subject}</h3>
										<p className="text-[10px] font-bold text-muted-foreground mt-0.5">
											{format(parseISO(exam.date), 'dd MMM yyyy')}
										</p>
									</div>
									<div className="flex items-center gap-2">
										<Badge variant="outline" className={cn('text-[10px] font-bold', styles.badge)}>
											{urgencyLabel}
										</Badge>
										<div className="text-center">
											<p className="text-2xl font-black tabular-nums">{exam.daysLeft}</p>
											<p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
												days
											</p>
										</div>
									</div>
								</div>

								<div className="mb-3">
									<div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
										<span>Readiness</span>
										<span>{exam.readiness}%</span>
									</div>
									<Progress
										value={exam.readiness}
										className={cn(
											'h-2',
											exam.readiness < 40 && '[&>div]:bg-destructive',
											exam.readiness >= 40 && exam.readiness < 70 && '[&>div]:bg-warning',
											exam.readiness >= 70 && '[&>div]:bg-success'
										)}
									/>
								</div>

								<Button
									size="sm"
									variant="outline"
									className="rounded-full w-full font-bold text-xs gap-2"
									onClick={() => toast.info(`Scheduling study time for ${exam.subject}`)}
								>
									<HugeiconsIcon icon={CalendarAdd01Icon} className="w-4 h-4" />
									Schedule Study Time
								</Button>
							</div>
						);
					})
				)}
			</CardContent>
		</Card>
	);
}
