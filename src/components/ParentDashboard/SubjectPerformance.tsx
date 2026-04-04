'use client';

import {
	AlertCircleIcon,
	ArrowDown01Icon,
	ArrowUp01Icon,
	Target01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';

const PolarAngleAxis = dynamic(() => import('recharts').then((mod) => mod.PolarAngleAxis), {
	ssr: false,
});
const PolarGrid = dynamic(() => import('recharts').then((mod) => mod.PolarGrid), { ssr: false });
const Radar = dynamic(() => import('recharts').then((mod) => mod.Radar), { ssr: false });
const RadarChart = dynamic(() => import('recharts').then((mod) => mod.RadarChart), { ssr: false });
const ResponsiveContainer = dynamic(
	() => import('recharts').then((mod) => mod.ResponsiveContainer),
	{ ssr: false }
);

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SubjectData {
	name: string;
	overallScore: number;
	recentScore: number | null;
	questionsAttempted: number;
	confidenceScore: number;
	mistakesCount: number;
	timeMinutes: number;
	needsAttention: boolean;
}

function formatTime(minutes: number) {
	const hours = Math.floor(minutes / 60);
	const mins = Math.round(minutes % 60);
	if (hours > 0) return `${hours}h ${mins}m`;
	return `${mins}m`;
}

function SubjectRadarChart({ subject }: { subject: SubjectData }) {
	const data = [
		{ metric: 'Mastery', value: subject.overallScore, fullMark: 100 },
		{ metric: 'Confidence', value: Math.round(subject.confidenceScore * 100), fullMark: 100 },
		{ metric: 'Attempts', value: Math.min(subject.questionsAttempted / 2, 100), fullMark: 100 },
		{ metric: 'Time', value: Math.min((subject.timeMinutes / 30) * 100, 100), fullMark: 100 },
		{ metric: 'Accuracy', value: Math.max(100 - subject.mistakesCount * 5, 0), fullMark: 100 },
	];

	const subjectColor = subject.needsAttention ? 'var(--color-warning)' : 'var(--color-primary)';

	return (
		<div className="h-24 w-full">
			<ResponsiveContainer width="100%" height="100%">
				<RadarChart data={data} cx="50%" cy="50%" outerRadius="80%">
					<PolarGrid stroke="var(--border)" />
					<PolarAngleAxis
						dataKey="metric"
						tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--muted-foreground)' }}
					/>
					<Radar
						dataKey="value"
						stroke={subjectColor}
						fill={subjectColor}
						fillOpacity={0.3}
						strokeWidth={2}
					/>
				</RadarChart>
			</ResponsiveContainer>
		</div>
	);
}

export function SubjectPerformance() {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['parent-subject-performance'],
		queryFn: async () => {
			const res = await fetch('/api/parent-dashboard');
			if (!res.ok) throw new Error('Failed to fetch');
			const json = await res.json();
			return json.subjectPerformance;
		},
		staleTime: 5 * 60 * 1000,
	});

	const subjects: SubjectData[] = data?.subjects ?? [];

	return (
		<Card className="rounded-[2.5rem] border border-border/50 shadow-tiimo overflow-hidden">
			<CardHeader className="bg-muted/30 px-8 py-6">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
						<HugeiconsIcon icon={Target01Icon} className="w-5 h-5 text-primary" />
					</div>
					<CardTitle className="text-lg font-black tracking-tight">Subject Performance</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="p-6 space-y-4">
				{isLoading ? (
					Array.from({ length: 3 }).map((_, i) => (
						<div key={`skeleton-${i}`} className="h-28 bg-muted animate-pulse rounded-2xl" />
					))
				) : error ? (
					<Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
						<AlertDescription className="flex items-center justify-between">
							<span>Failed to load subject data</span>
							<Button variant="outline" size="sm" onClick={() => refetch()}>
								Try Again
							</Button>
						</AlertDescription>
					</Alert>
				) : subjects.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<p className="text-sm font-medium">No subject data yet</p>
						<p className="text-xs mt-1">Study activity will appear here</p>
					</div>
				) : (
					subjects.map((subject) => (
						<div
							key={subject.name}
							className={cn(
								'p-5 rounded-2xl border transition-colors',
								subject.needsAttention
									? 'border-warning/30 bg-warning-soft'
									: 'border-border/30 bg-muted/20'
							)}
						>
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-3">
									<h3 className="font-bold text-sm">{subject.name}</h3>
									{subject.needsAttention && (
										<Badge
											variant="outline"
											className="text-xs font-bold bg-warning/10 text-warning border-warning/20"
										>
											<HugeiconsIcon icon={AlertCircleIcon} className="w-3 h-3 mr-1" />
											Needs attention
										</Badge>
									)}
								</div>
								<div className="flex items-center gap-1">
									{subject.recentScore !== null && (
										<>
											<HugeiconsIcon
												icon={
													subject.recentScore >= subject.overallScore
														? ArrowUp01Icon
														: ArrowDown01Icon
												}
												className={cn(
													'w-4 h-4',
													subject.recentScore >= subject.overallScore
														? 'text-success'
														: 'text-warning'
												)}
											/>
											<span
												className={cn(
													'text-xs font-bold',
													subject.recentScore >= subject.overallScore
														? 'text-success'
														: 'text-warning'
												)}
											>
												{subject.recentScore}%
											</span>
										</>
									)}
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<div className="flex justify-between text-xs font-bold text-muted-foreground  tracking-wider mb-1.5">
										<span>Overall Mastery</span>
										<span>{subject.overallScore}%</span>
									</div>
									<Progress
										value={subject.overallScore}
										className={cn('h-2', subject.needsAttention && '[&>div]:bg-warning')}
									/>
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
										<div className="text-center">
											<p className="text-xs font-bold text-muted-foreground  tracking-wider">
												Confidence
											</p>
											<p className="text-sm font-black">
												{Math.round(subject.confidenceScore * 100)}%
											</p>
										</div>
										<div className="text-center">
											<p className="text-xs font-bold text-muted-foreground  tracking-wider">
												Mistakes
											</p>
											<p className="text-sm font-black">{subject.mistakesCount}</p>
										</div>
										<div className="text-center">
											<p className="text-xs font-bold text-muted-foreground  tracking-wider">
												Time Spent
											</p>
											<p className="text-sm font-black">{formatTime(subject.timeMinutes)}</p>
										</div>
									</div>
								</div>
								<SubjectRadarChart subject={subject} />
							</div>
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
}
