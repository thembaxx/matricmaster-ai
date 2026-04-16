'use client';

import {
	ArrowUp01Icon,
	Award01Icon,
	Calendar01Icon,
	CheckmarkCircle01Icon,
	CircleIcon,
	PlusSignIcon,
	Target01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { addDays, format, isAfter } from 'date-fns';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

interface Goal {
	id: string;
	title: string;
	description: string;
	targetValue: number;
	currentValue: number;
	unit: string;
	deadline: Date;
	category: 'quiz_score' | 'study_time' | 'topics_mastered' | 'flashcards' | 'streak';
	status: 'active' | 'completed' | 'overdue';
	createdAt: Date;
}

interface GoalTrackingProps {
	quizData: {
		questionsAttempted: number;
		correctAnswers: number;
		averageScore: number;
		quizzesTaken: number;
	};
	flashcards: {
		totalCards: number;
		masteredCards: number;
	};
	studyStats: {
		totalStudyTimeMinutes: number;
		streakDays: number;
	};
	topicMastery: Array<{
		topicId: string;
		topicName: string;
		subject: string;
		masteryLevel: number;
	}>;
}

const GOAL_CATEGORIES = {
	quiz_score: { label: 'Quiz Score', icon: Target01Icon, color: 'text-blue-600' },
	study_time: { label: 'Study Time', icon: Calendar01Icon, color: 'text-green-600' },
	topics_mastered: { label: 'Topics Mastered', icon: Award01Icon, color: 'text-purple-600' },
	flashcards: { label: 'Flashcards', icon: Target01Icon, color: 'text-orange-600' },
	streak: { label: 'Study Streak', icon: ArrowUp01Icon, color: 'text-red-600' },
};

export function GoalTracking({
	quizData,
	flashcards,
	studyStats,
	topicMastery,
}: GoalTrackingProps) {
	const [goals, setGoals] = useState<Goal[]>([
		// Sample goals - in real app, these would come from database
		{
			id: '1',
			title: 'Achieve 85% average quiz score',
			description: 'Maintain consistent performance across all subjects',
			targetValue: 85,
			currentValue: quizData.averageScore,
			unit: '%',
			deadline: addDays(new Date(), 30),
			category: 'quiz_score',
			status: 'active',
			createdAt: new Date(),
		},
		{
			id: '2',
			title: 'Study 10 hours this week',
			description: 'Dedicate focused study time to improve retention',
			targetValue: 600, // minutes
			currentValue: studyStats.totalStudyTimeMinutes % 10080, // This week
			unit: 'minutes',
			deadline: addDays(new Date(), 7),
			category: 'study_time',
			status: 'active',
			createdAt: new Date(),
		},
		{
			id: '3',
			title: 'Master 5 new topics',
			description: 'Build strong foundation in key subject areas',
			targetValue: 5,
			currentValue: topicMastery.filter((t) => t.masteryLevel >= 80).length,
			unit: 'topics',
			deadline: addDays(new Date(), 21),
			category: 'topics_mastered',
			status: 'active',
			createdAt: new Date(),
		},
	]);

	const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
	const [newGoal, setNewGoal] = useState({
		title: '',
		description: '',
		targetValue: 0,
		unit: '',
		deadline: '',
		category: 'quiz_score' as Goal['category'],
	});

	const goalProgress = useMemo(() => {
		return goals.map((goal) => {
			let currentValue = goal.currentValue;

			// Update current values based on real data
			switch (goal.category) {
				case 'quiz_score':
					currentValue = quizData.averageScore;
					break;
				case 'study_time':
					currentValue = studyStats.totalStudyTimeMinutes;
					break;
				case 'topics_mastered':
					currentValue = topicMastery.filter((t) => t.masteryLevel >= 80).length;
					break;
				case 'flashcards':
					currentValue = flashcards.masteredCards;
					break;
				case 'streak':
					currentValue = studyStats.streakDays;
					break;
			}

			const progress = Math.min((currentValue / goal.targetValue) * 100, 100);
			const isOverdue = isAfter(new Date(), goal.deadline);
			const status = (
				progress >= 100 ? 'completed' : isOverdue ? 'overdue' : 'active'
			) as Goal['status'];

			return {
				...goal,
				currentValue,
				progress,
				status,
				isOverdue,
			};
		});
	}, [goals, quizData, flashcards, studyStats, topicMastery]);

	const goalStats = useMemo(() => {
		const completed = goalProgress.filter((g) => g.status === 'completed').length;
		const active = goalProgress.filter((g) => g.status === 'active').length;
		const overdue = goalProgress.filter((g) => g.status === 'overdue').length;
		const avgProgress = goalProgress.reduce((sum, g) => sum + g.progress, 0) / goalProgress.length;

		return { completed, active, overdue, avgProgress };
	}, [goalProgress]);

	const addGoal = () => {
		if (!newGoal.title || !newGoal.targetValue || !newGoal.deadline) return;

		const goal: Goal = {
			id: Date.now().toString(),
			title: newGoal.title,
			description: newGoal.description,
			targetValue: newGoal.targetValue,
			currentValue: 0,
			unit: newGoal.unit,
			deadline: new Date(newGoal.deadline),
			category: newGoal.category,
			status: 'active',
			createdAt: new Date(),
		};

		setGoals((prev) => [...prev, goal]);
		setNewGoal({
			title: '',
			description: '',
			targetValue: 0,
			unit: '',
			deadline: '',
			category: 'quiz_score',
		});
		setIsAddGoalOpen(false);
	};

	const getStatusColor = (status: Goal['status']) => {
		switch (status) {
			case 'completed':
				return 'text-green-600 bg-green-50';
			case 'overdue':
				return 'text-red-600 bg-red-50';
			default:
				return 'text-blue-600 bg-blue-50';
		}
	};

	const getStatusIcon = (status: Goal['status']) => {
		switch (status) {
			case 'completed':
				return CheckmarkCircle01Icon;
			case 'overdue':
				return Target01Icon;
			default:
				return CircleIcon;
		}
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Goal Stats Overview */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4 text-center">
						<div className="text-2xl font-bold text-green-600">{goalStats.completed}</div>
						<div className="text-sm text-muted-foreground">Completed</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center">
						<div className="text-2xl font-bold text-blue-600">{goalStats.active}</div>
						<div className="text-sm text-muted-foreground">Active</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center">
						<div className="text-2xl font-bold text-red-600">{goalStats.overdue}</div>
						<div className="text-sm text-muted-foreground">Overdue</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center">
						<div className="text-2xl font-bold">{goalStats.avgProgress.toFixed(0)}%</div>
						<div className="text-sm text-muted-foreground">Avg Progress</div>
					</CardContent>
				</Card>
			</div>

			{/* Goals List */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<HugeiconsIcon icon={Target01Icon} className="size-5" />
							Academic Goals
						</CardTitle>
						<CardDescription>
							Track your progress towards academic targets and milestones
						</CardDescription>
					</div>
					<Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
						<DialogTrigger asChild>
							<Button>
								<HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
								Add Goal
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create New Goal</DialogTitle>
								<DialogDescription>
									Set a specific, measurable target to track your progress.
								</DialogDescription>
							</DialogHeader>
							<div className="flex flex-col gap-4">
								<div>
									<Label htmlFor="title">Goal Title</Label>
									<Input
										id="title"
										value={newGoal.title}
										onChange={(e) => setNewGoal((prev) => ({ ...prev, title: e.target.value }))}
										placeholder="e.g., Achieve 90% in Mathematics"
									/>
								</div>
								<div>
									<Label htmlFor="description">Description</Label>
									<Textarea
										id="description"
										value={newGoal.description}
										onChange={(e) =>
											setNewGoal((prev) => ({ ...prev, description: e.target.value }))
										}
										placeholder="Describe what you want to achieve..."
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="target">Target Value</Label>
										<Input
											id="target"
											type="number"
											value={newGoal.targetValue}
											onChange={(e) =>
												setNewGoal((prev) => ({ ...prev, targetValue: Number(e.target.value) }))
											}
										/>
									</div>
									<div>
										<Label htmlFor="unit">Unit</Label>
										<Input
											id="unit"
											value={newGoal.unit}
											onChange={(e) => setNewGoal((prev) => ({ ...prev, unit: e.target.value }))}
											placeholder="e.g., %, hours, topics"
										/>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="category">Category</Label>
										<select
											id="category"
											value={newGoal.category}
											onChange={(e) =>
												setNewGoal((prev) => ({
													...prev,
													category: e.target.value as Goal['category'],
												}))
											}
											className="w-full p-2 border rounded-md"
										>
											{Object.entries(GOAL_CATEGORIES).map(([key, { label }]) => (
												<option key={key} value={key}>
													{label}
												</option>
											))}
										</select>
									</div>
									<div>
										<Label htmlFor="deadline">Deadline</Label>
										<Input
											id="deadline"
											type="date"
											value={newGoal.deadline}
											onChange={(e) =>
												setNewGoal((prev) => ({ ...prev, deadline: e.target.value }))
											}
										/>
									</div>
								</div>
								<div className="flex justify-end gap-2">
									<Button variant="outline" onClick={() => setIsAddGoalOpen(false)}>
										Cancel
									</Button>
									<Button onClick={addGoal}>Create Goal</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						{goalProgress.map((goal) => {
							const category = GOAL_CATEGORIES[goal.category];
							return (
								<div key={goal.id} className="border rounded-lg p-4">
									<div className="flex items-start justify-between mb-3">
										<div className="flex items-start gap-3">
											<div className={`p-2 rounded-full ${getStatusColor(goal.status)}`}>
												<HugeiconsIcon icon={getStatusIcon(goal.status)} className="size-5" />
											</div>
											<div>
												<h4 className="font-medium">{goal.title}</h4>
												<p className="text-sm text-muted-foreground">{goal.description}</p>
											</div>
										</div>
										<div className="text-right">
											<div
												className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}
											>
												{goal.status === 'completed' && (
													<HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3" />
												)}
												{goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
											</div>
											<div className="text-xs text-muted-foreground mt-1">
												Due: {format(goal.deadline, 'MMM dd, yyyy')}
											</div>
										</div>
									</div>

									<div className="flex items-center gap-4 mb-3">
										<div className="flex items-center gap-2">
											<HugeiconsIcon icon={category.icon} className={`w-4 h-4 ${category.color}`} />
											<span className="text-sm font-medium">{category.label}</span>
										</div>
										<Badge variant="outline">
											{goal.currentValue.toFixed(1)} / {goal.targetValue} {goal.unit}
										</Badge>
									</div>

									<div className="flex flex-col gap-2">
										<div className="flex justify-between text-sm">
											<span>Progress</span>
											<span>{goal.progress.toFixed(1)}%</span>
										</div>
										<Progress value={goal.progress} className="h-2" />
									</div>

									{goal.isOverdue && goal.status !== 'completed' && (
										<div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
											This goal is overdue. Consider adjusting your timeline or breaking it into
											smaller milestones.
										</div>
									)}
								</div>
							);
						})}

						{goalProgress.length === 0 && (
							<div className="text-center py-8 text-muted-foreground">
								<HugeiconsIcon icon={Target01Icon} className="w-12 h-12 mx-auto mb-4 opacity-50" />
								<h3 className="font-medium mb-2">No goals set yet</h3>
								<p className="text-sm mb-4">
									Create your first academic goal to start tracking progress.
								</p>
								<Button onClick={() => setIsAddGoalOpen(true)}>
									<HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
									Add Your First Goal
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Goal Achievement Milestones */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<HugeiconsIcon icon={Award01Icon} className="size-5" />
						Milestone Achievements
					</CardTitle>
					<CardDescription>
						Celebrate your progress with automatic milestone recognition
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="text-center p-4 border rounded-lg">
							<div className="text-3xl mb-2">🎯</div>
							<div className="font-medium">First Goal Completed</div>
							<div className="text-sm text-muted-foreground">
								{goalStats.completed > 0 ? '✓ Achieved!' : 'Keep going!'}
							</div>
						</div>

						<div className="text-center p-4 border rounded-lg">
							<div className="text-3xl mb-2">🔥</div>
							<div className="font-medium">Goal Streak Master</div>
							<div className="text-sm text-muted-foreground">
								{goalStats.completed >= 3
									? '3+ goals completed!'
									: `${goalStats.completed}/3 completed`}
							</div>
						</div>

						<div className="text-center p-4 border rounded-lg">
							<div className="text-3xl mb-2">📈</div>
							<div className="font-medium">Progress Champion</div>
							<div className="text-sm text-muted-foreground">
								{goalStats.avgProgress >= 75
									? '75%+ average progress!'
									: `${goalStats.avgProgress.toFixed(0)}% average`}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
