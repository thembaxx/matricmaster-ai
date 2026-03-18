'use client';

import {
	ArrowLeft01Icon,
	ChartBar,
	Clock01Icon,
	Download01Icon,
	PlusSignIcon,
	SparklesIcon,
	Target01Icon,
	UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { type GoalType, useFocusGoalStore } from '@/stores/useFocusGoalStore';

interface ParentDashboardProps {
	userName?: string;
}

interface SubjectData {
	name: string;
	overallScore: number;
	recentScore: number | null;
	questionsAttempted: number;
}

interface InsightData {
	stats: {
		totalHoursThisWeek: number;
		weeklyChange: number;
		overallAvg: number;
		subjects: SubjectData[];
	};
	insight: string;
	weakSubjects: { name: string; recentScore: number | null }[];
	strongSubjects: { name: string; recentScore: number | null }[];
}

const MOCK_DATA = {
	totalHoursStudied: 12.5,
	weeklyChange: 2.5,
	averageScore: 78,
	subjects: [
		{ name: 'Mathematics', score: 82, status: 'Excellent', color: 'text-success' },
		{ name: 'Physical Sciences', score: 65, status: 'Needs Work', color: 'text-warning' },
		{ name: 'English FAL', score: 91, status: 'Outstanding', color: 'text-success' },
		{ name: 'Life Sciences', score: 74, status: 'Good', color: 'text-success' },
	],
	insight:
		'Thabo is studying consistently with 12.5 hours this week. Great momentum! Physical Sciences needs attention - recent average is 65%. Consider suggesting the Voice Breakdown feature.',
};

const GOAL_TYPES: { type: GoalType; label: string; icon: string; xpPerUnit: number }[] = [
	{ type: 'past_papers', label: 'Complete Past Papers', icon: '📝', xpPerUnit: 100 },
	{ type: 'quizzes', label: 'Pass Quizzes', icon: '✅', xpPerUnit: 50 },
	{ type: 'study_hours', label: 'Study Hours', icon: '⏰', xpPerUnit: 20 },
	{ type: 'flashcards', label: 'Review Flashcards', icon: '🃏', xpPerUnit: 10 },
];

export default function ParentDashboard({ userName = 'Student' }: ParentDashboardProps) {
	const router = useRouter();
	const [showAddGoal, setShowAddGoal] = useState(false);
	const [newGoalType, setNewGoalType] = useState<GoalType>('past_papers');
	const [newGoalTarget, setNewGoalTarget] = useState(2);

	const { addGoal, getActiveGoals, getCompletedGoals } = useFocusGoalStore();
	const activeGoals = getActiveGoals();
	const completedGoals = getCompletedGoals();

	// Fetch parent insights - refactored to useQuery pattern
	const fetchInsights = async ({ studentName }: { studentName: string }) => {
		const response = await fetch('/api/parent-insights', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ studentName }),
		});
		if (!response.ok) return null;
		return response.json() as Promise<InsightData>;
	};

	const { data, isLoading } = useQuery({
		queryKey: ['parent-insights', userName],
		queryFn: () => fetchInsights({ studentName: userName }),
		staleTime: 5 * 60 * 1000,
	});

	const handleAddGoal = () => {
		const goalType = GOAL_TYPES.find((g) => g.type === newGoalType);
		if (!goalType) return;

		addGoal({
			type: newGoalType,
			target: newGoalTarget,
			title: `${newGoalTarget} ${goalType.label}`,
			xpReward: newGoalTarget * goalType.xpPerUnit,
		});
		toast.success(`Focus goal set: ${newGoalTarget} ${goalType.label}`);
		setShowAddGoal(false);
		setNewGoalTarget(2);
	};

	const displayData = data?.stats
		? {
				totalHoursStudied: data.stats.totalHoursThisWeek,
				weeklyChange: data.stats.weeklyChange,
				averageScore: data.stats.overallAvg,
				subjects: data.stats.subjects.map((s) => ({
					name: s.name,
					score: s.overallScore,
					status: s.overallScore >= 80 ? 'Excellent' : s.overallScore >= 60 ? 'Good' : 'Needs Work',
					color: s.overallScore >= 70 ? 'text-success' : 'text-warning',
				})),
				insight: data.insight,
			}
		: MOCK_DATA;

	return (
		<div className="flex flex-col h-full bg-background min-w-0">
			<header className="px-6 pt-12 pb-6 flex items-center justify-between shrink-0 max-w-4xl mx-auto w-full">
				<Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
					<HugeiconsIcon icon={ArrowLeft01Icon} className="w-6 h-6" />
				</Button>
				<h1 className="text-xl font-black uppercase tracking-tight">Parent / Tutor Portal</h1>
				<div className="w-10" />
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-4 pb-32 max-w-4xl mx-auto w-full space-y-8">
					<Card className="rounded-[3rem] border border-border/50 shadow-tiimo overflow-hidden">
						<div className="p-8 bg-linear-to-br from-primary/10 to-transparent flex items-center gap-6">
							<div className="w-20 h-20 rounded-[2rem] bg-card flex items-center justify-center shadow-lg border-2 border-white">
								<HugeiconsIcon icon={UserIcon} className="w-10 h-10 text-primary" />
							</div>
							<div>
								<h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">
									{userName}'s Progress
								</h2>
								<p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
									Matric Class of 2026
								</p>
							</div>
							<Button className="ml-auto rounded-full gap-2 font-black uppercase text-[10px]">
								<HugeiconsIcon icon={Download01Icon} className="w-4 h-4" />
								Weekly Report
							</Button>
						</div>
					</Card>

					<Card className="rounded-[2.5rem] border border-border/50 shadow-tiimo bg-gradient-to-r from-primary/5 via-success/5 to-primary/5 overflow-hidden">
						<div className="p-6">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
									<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-primary" />
								</div>
								<p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
									AI Insight
								</p>
							</div>
							{isLoading ? (
								<div className="space-y-2">
									<div className="h-4 bg-muted animate-pulse rounded w-3/4" />
									<div className="h-4 bg-muted animate-pulse rounded w-1/2" />
								</div>
							) : (
								<p className="text-sm font-medium leading-relaxed">{displayData.insight}</p>
							)}
						</div>
					</Card>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						<Card className="p-8 rounded-[2.5rem] border border-border/50 shadow-tiimo bg-card">
							<div className="flex items-center gap-4 mb-6">
								<div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center text-success">
									<HugeiconsIcon icon={Clock01Icon} className="w-6 h-6" />
								</div>
								<div>
									<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
										Time Studied
									</p>
									<p className="text-2xl font-black text-foreground">
										{displayData.totalHoursStudied} Hours
									</p>
								</div>
							</div>
							<Progress value={(displayData.totalHoursStudied / 20) * 100} className="h-2" />
							<p
								className={cn(
									'text-[10px] font-bold mt-4 uppercase text-center tracking-widest',
									displayData.weeklyChange >= 0 ? 'text-success' : 'text-warning'
								)}
							>
								{displayData.weeklyChange >= 0 ? '+' : ''}
								{displayData.weeklyChange}h from last week
							</p>
						</Card>

						<Card className="p-8 rounded-[2.5rem] border border-border/50 shadow-tiimo bg-card">
							<div className="flex items-center gap-4 mb-6">
								<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
									<HugeiconsIcon icon={ChartBar} className="w-6 h-6" />
								</div>
								<div>
									<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
										Average Score
									</p>
									<p className="text-2xl font-black text-foreground">
										{displayData.averageScore}% Mastery
									</p>
								</div>
							</div>
							<Progress value={displayData.averageScore} className="h-2" />
							<p
								className={cn(
									'text-[10px] font-bold mt-4 uppercase text-center tracking-widest',
									displayData.averageScore >= 70 ? 'text-success' : 'text-warning'
								)}
							>
								{displayData.averageScore >= 70 ? 'Master level achieved' : 'Keep practicing!'}
							</p>
						</Card>
					</div>

					<Card className="rounded-[2.5rem] border border-border/50 shadow-tiimo overflow-hidden">
						<CardHeader className="bg-muted/30 px-8 py-6">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg font-black uppercase tracking-tight">
									Focus Goals
								</CardTitle>
								<Button
									size="sm"
									variant="outline"
									className="rounded-full font-black text-xs"
									onClick={() => setShowAddGoal(!showAddGoal)}
								>
									<HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-1" />
									Add Goal
								</Button>
							</div>
						</CardHeader>
						<CardContent className="p-6 space-y-4">
							{showAddGoal && (
								<div className="p-4 bg-muted/30 rounded-2xl space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label className="text-xs font-bold uppercase">Goal Type</Label>
											<Select
												value={newGoalType}
												onValueChange={(v) => setNewGoalType(v as GoalType)}
											>
												<SelectTrigger className="mt-1 rounded-xl">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{GOAL_TYPES.map((goal) => (
														<SelectItem key={goal.type} value={goal.type}>
															<span className="mr-2">{goal.icon}</span>
															{goal.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div>
											<Label className="text-xs font-bold uppercase">Target</Label>
											<Input
												type="number"
												min={1}
												max={20}
												value={newGoalTarget}
												onChange={(e) => setNewGoalTarget(Number.parseInt(e.target.value, 10) || 1)}
												className="mt-1 rounded-xl"
											/>
										</div>
									</div>
									<div className="flex gap-2">
										<Button
											size="sm"
											className="rounded-full font-black text-xs flex-1"
											onClick={handleAddGoal}
										>
											Set Goal
										</Button>
										<Button
											size="sm"
											variant="outline"
											className="rounded-full font-black text-xs"
											onClick={() => setShowAddGoal(false)}
										>
											Cancel
										</Button>
									</div>
								</div>
							)}

							{activeGoals.length === 0 && completedGoals.length === 0 && !showAddGoal && (
								<div className="text-center py-8 text-muted-foreground">
									<HugeiconsIcon
										icon={Target01Icon}
										className="w-12 h-12 mx-auto mb-3 opacity-30"
									/>
									<p className="text-sm font-medium">No focus goals set</p>
									<p className="text-xs">Set a goal to motivate {userName}!</p>
								</div>
							)}

							{activeGoals.map((goal) => {
								const goalInfo = GOAL_TYPES.find((g) => g.type === goal.type);
								const progressPercent = Math.min((goal.progress / goal.target) * 100, 100);
								return (
									<div
										key={goal.id}
										className="p-4 bg-warning-soft border border-warning/20 rounded-2xl"
									>
										<div className="flex items-center justify-between mb-2">
											<div className="flex items-center gap-2">
												<span className="text-lg">{goalInfo?.icon}</span>
												<span className="font-bold text-sm">{goal.title}</span>
											</div>
											<span className="text-xs font-black text-warning uppercase">
												{goal.xpReward} XP
											</span>
										</div>
										<Progress value={progressPercent} className="h-2 mb-1" />
										<p className="text-[10px] text-muted-foreground">
											{goal.progress} / {goal.target} • Parent set goal
										</p>
									</div>
								);
							})}

							{completedGoals.length > 0 && (
								<>
									<p className="text-xs font-bold text-muted-foreground uppercase tracking-widest pt-2">
										Completed
									</p>
									{completedGoals.map((goal) => {
										const goalInfo = GOAL_TYPES.find((g) => g.type === goal.type);
										return (
											<div
												key={goal.id}
												className="p-4 bg-success-soft border border-success/20 rounded-2xl"
											>
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<span className="text-lg">{goalInfo?.icon}</span>
														<span className="font-bold text-sm">{goal.title}</span>
													</div>
													<span className="text-xs font-black text-success uppercase">
														+{goal.xpReward} XP Awarded!
													</span>
												</div>
											</div>
										);
									})}
								</>
							)}
						</CardContent>
					</Card>
				</main>
			</ScrollArea>
		</div>
	);
}
