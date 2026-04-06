'use client';

import { useQuery } from '@tanstack/react-query';
import { ViewTransition } from 'react';
import { ProgressRing } from '@/components/shared/ProgressRing';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface UnifiedProgress {
	summary: {
		totalXp: number;
		level: number;
		streak: number;
		bestStreak: number;
		hasRealData: boolean;
	};
	aiTutor: {
		topicsStudied: number;
		conversationsCount: number;
		totalSessionTime: number;
		recentConversations: Array<{
			id: string;
			topic: string;
			createdAt: Date;
		}>;
	};
	flashcards: {
		totalCards: number;
		masteredCards: number;
		dueForReview: number;
		decksCompleted: number;
		cardsLearned: number;
		reviewsToday: number;
	};
	quiz: {
		questionsAttempted: number;
		correctAnswers: number;
		averageScore: number;
		quizzesTaken: number;
		topicScores: Record<string, number>;
		recentQuizzes: Array<{
			topic: string;
			score: number;
			totalQuestions: number;
			completedAt: Date;
		}>;
	};
	studyPlan: {
		completionPercentage: number;
		tasksCompleted: number;
		tasksTotal: number;
		activePlans: number;
		recentPlans: Array<{
			id: string;
			title: string;
			progress: number;
		}>;
	};
	calendar: {
		sessionsScheduled: number;
		sessionsCompleted: number;
		attendanceRate: number;
		totalStudyMinutes: number;
		recentSessions: Array<{
			topic: string;
			durationMinutes: number;
			completedAt: Date;
		}>;
	};
	weakTopics: Array<{
		topicId: string;
		topicName: string;
		subject: string;
		masteryLevel: number;
		recommendation: string;
	}>;
}

function _StatCard({
	title,
	value,
	subtitle,
	icon,
	color,
}: {
	title: string;
	value: string | number;
	subtitle?: string;
	icon?: React.ReactNode;
	color?: string;
}) {
	return (
		<Card className="relative overflow-hidden">
			<CardHeader className="pb-2">
				<CardDescription className="text-xs uppercase tracking-wide">{title}</CardDescription>
				{icon && (
					<div className={`absolute right-4 top-4 ${color || 'text-muted-foreground'}`}>{icon}</div>
				)}
			</CardHeader>
			<CardContent>
				<div className="text-3xl font-bold tracking-tight">{value}</div>
				{subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
			</CardContent>
		</Card>
	);
}

function StatCardSkeleton() {
	return (
		<Card>
			<CardHeader className="pb-2">
				<Skeleton className="h-3 w-16" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-8 w-20" />
				<Skeleton className="h-3 w-24 mt-2" />
			</CardContent>
		</Card>
	);
}

function SummaryCard({ data }: { data: UnifiedProgress['summary'] }) {
	return (
		<Card className="col-span-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
			<CardContent className="p-6">
				<div className="flex flex-col md:flex-row items-center justify-between gap-6">
					<div className="flex items-center gap-6">
						<ProgressRing
							progress={Math.min(((data.totalXp % 500) / 500) * 100, 100)}
							size={80}
							strokeWidth={6}
							className="bg-white/20 rounded-full"
						>
							<span className="text-2xl font-bold">L{data.level}</span>
						</ProgressRing>
						<div>
							<p className="text-white/80 text-sm">Total XP</p>
							<p className="text-4xl font-bold">{data.totalXp.toLocaleString()}</p>
						</div>
					</div>
					<div className="flex gap-8">
						<div className="text-center">
							<p className="text-white/80 text-xs uppercase">Streak</p>
							<p className="text-3xl font-bold">{data.streak}</p>
							<p className="text-white/60 text-xs">days</p>
						</div>
						<div className="text-center">
							<p className="text-white/80 text-xs uppercase">Best</p>
							<p className="text-3xl font-bold">{data.bestStreak}</p>
							<p className="text-white/60 text-xs">days</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function AiTutorCard({ data }: { data: UnifiedProgress['aiTutor'] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg flex items-center gap-2">
					<span className="text-2xl">🤖</span>
					AI Tutor
				</CardTitle>
				<CardDescription>Your conversations with the AI tutor</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div className="text-center p-3 bg-muted/50 rounded-lg">
						<p className="text-2xl font-bold">{data.conversationsCount}</p>
						<p className="text-xs text-muted-foreground">Conversations</p>
					</div>
					<div className="text-center p-3 bg-muted/50 rounded-lg">
						<p className="text-2xl font-bold">{data.topicsStudied}</p>
						<p className="text-xs text-muted-foreground">Topics</p>
					</div>
				</div>
				<div className="text-center p-3 bg-muted/50 rounded-lg">
					<p className="text-2xl font-bold">{Math.round(data.totalSessionTime / 60)}h</p>
					<p className="text-xs text-muted-foreground">Total Session Time</p>
				</div>
				{data.recentConversations.length > 0 && (
					<div className="space-y-2">
						<p className="text-xs font-medium">Recent Topics</p>
						<div className="flex flex-wrap gap-1">
							{data.recentConversations.slice(0, 3).map((conv) => (
								<Badge key={conv.id} variant="outline" className="text-xs">
									{conv.topic}
								</Badge>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function FlashcardCard({ data }: { data: UnifiedProgress['flashcards'] }) {
	const masteryPercent =
		data.totalCards > 0 ? Math.round((data.masteredCards / data.totalCards) * 100) : 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg flex items-center gap-2">
					<span className="text-2xl">📚</span>
					Flashcards
				</CardTitle>
				<CardDescription>Your flashcard progress</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex justify-center">
					<ProgressRing progress={masteryPercent} size={100} strokeWidth={8}>
						<div className="text-center">
							<p className="text-2xl font-bold">{masteryPercent}%</p>
							<p className="text-xs text-muted-foreground">Mastered</p>
						</div>
					</ProgressRing>
				</div>
				<div className="grid grid-cols-3 gap-2 text-center">
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold">{data.totalCards}</p>
						<p className="text-xs text-muted-foreground">Total</p>
					</div>
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold text-green-600">{data.masteredCards}</p>
						<p className="text-xs text-muted-foreground">Mastered</p>
					</div>
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold text-amber-600">{data.dueForReview}</p>
						<p className="text-xs text-muted-foreground">Due</p>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-2 text-center">
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold">{data.decksCompleted}</p>
						<p className="text-xs text-muted-foreground">Decks Done</p>
					</div>
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold">{data.reviewsToday}</p>
						<p className="text-xs text-muted-foreground">Today</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function QuizCard({ data }: { data: UnifiedProgress['quiz'] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg flex items-center gap-2">
					<span className="text-2xl">📝</span>
					Quiz
				</CardTitle>
				<CardDescription>Your quiz performance</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex justify-center">
					<ProgressRing progress={data.averageScore} size={100} strokeWidth={8}>
						<div className="text-center">
							<p className="text-2xl font-bold">{data.averageScore}%</p>
							<p className="text-xs text-muted-foreground">Avg Score</p>
						</div>
					</ProgressRing>
				</div>
				<div className="grid grid-cols-3 gap-2 text-center">
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold">{data.quizzesTaken}</p>
						<p className="text-xs text-muted-foreground">Taken</p>
					</div>
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold">{data.questionsAttempted}</p>
						<p className="text-xs text-muted-foreground">Questions</p>
					</div>
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold text-green-600">{data.correctAnswers}</p>
						<p className="text-xs text-muted-foreground">Correct</p>
					</div>
				</div>
				{Object.keys(data.topicScores).length > 0 && (
					<div className="space-y-2">
						<p className="text-xs font-medium">Topic Scores</p>
						<div className="space-y-1">
							{Object.entries(data.topicScores)
								.slice(0, 5)
								.map(([topic, score]) => (
									<div key={topic} className="flex justify-between items-center text-sm">
										<span className="text-muted-foreground truncate">{topic}</span>
										<Badge
											variant="outline"
											className={
												score >= 70
													? 'text-green-600'
													: score >= 50
														? 'text-amber-600'
														: 'text-red-600'
											}
										>
											{score}%
										</Badge>
									</div>
								))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function StudyPlanCard({ data }: { data: UnifiedProgress['studyPlan'] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg flex items-center gap-2">
					<span className="text-2xl">📋</span>
					Study Plan
				</CardTitle>
				<CardDescription>Your study plan progress</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex justify-center">
					<ProgressRing progress={data.completionPercentage} size={100} strokeWidth={8}>
						<div className="text-center">
							<p className="text-2xl font-bold">{data.completionPercentage}%</p>
							<p className="text-xs text-muted-foreground">Complete</p>
						</div>
					</ProgressRing>
				</div>
				<div className="grid grid-cols-2 gap-2 text-center">
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold">{data.tasksCompleted}</p>
						<p className="text-xs text-muted-foreground">Completed</p>
					</div>
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold">{data.tasksTotal}</p>
						<p className="text-xs text-muted-foreground">Total</p>
					</div>
				</div>
				<div className="text-center p-2 bg-muted/50 rounded-lg">
					<p className="text-lg font-bold">{data.activePlans}</p>
					<p className="text-xs text-muted-foreground">Active Plans</p>
				</div>
				{data.recentPlans.length > 0 && (
					<div className="space-y-2">
						<p className="text-xs font-medium">Recent Plans</p>
						<div className="space-y-1">
							{data.recentPlans.map((plan) => (
								<div key={plan.id} className="flex justify-between items-center text-sm">
									<span className="truncate">{plan.title}</span>
									<Badge variant="outline">{plan.progress}%</Badge>
								</div>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function CalendarCard({ data }: { data: UnifiedProgress['calendar'] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg flex items-center gap-2">
					<span className="text-2xl">📅</span>
					Calendar
				</CardTitle>
				<CardDescription>Your study sessions</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-3 gap-2 text-center">
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold">{data.sessionsCompleted}</p>
						<p className="text-xs text-muted-foreground">Sessions</p>
					</div>
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold">{Math.round(data.totalStudyMinutes / 60)}h</p>
						<p className="text-xs text-muted-foreground">Study Time</p>
					</div>
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold">{data.attendanceRate}%</p>
						<p className="text-xs text-muted-foreground">Attendance</p>
					</div>
				</div>
				{data.recentSessions.length > 0 && (
					<div className="space-y-2">
						<p className="text-xs font-medium">Recent Sessions</p>
						<div className="space-y-1">
							{data.recentSessions.slice(0, 3).map((session, i) => (
								<div key={i} className="flex justify-between items-center text-sm">
									<span className="truncate text-muted-foreground">{session.topic}</span>
									<span className="text-xs">{session.durationMinutes}m</span>
								</div>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function WeakTopicsCard({ data }: { data: UnifiedProgress['weakTopics'] }) {
	if (data.length === 0) {
		return (
			<Card className="col-span-full">
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<span className="text-2xl">🎯</span>
						Areas to Improve
					</CardTitle>
					<CardDescription>Topics that need more attention</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-center text-muted-foreground py-8">
						No weak topics identified. Keep up the great work!
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="col-span-full">
			<CardHeader>
				<CardTitle className="text-lg flex items-center gap-2">
					<span className="text-2xl">🎯</span>
					Areas to Improve
				</CardTitle>
				<CardDescription>Topics that need more attention</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-3">
					{data.map((topic) => (
						<div
							key={topic.topicId}
							className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
						>
							<div>
								<p className="font-medium">{topic.topicName}</p>
								<p className="text-xs text-muted-foreground">{topic.subject}</p>
							</div>
							<div className="text-right">
								<Badge
									variant="outline"
									className={
										topic.masteryLevel >= 60
											? 'text-green-600'
											: topic.masteryLevel >= 40
												? 'text-amber-600'
												: 'text-red-600'
									}
								>
									{topic.masteryLevel}%
								</Badge>
								<p className="text-xs text-muted-foreground mt-1">{topic.recommendation}</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function LoadingState() {
	return (
		<div className="space-y-6 p-6">
			<Skeleton className="h-48 w-full rounded-3xl" />
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{Array.from({ length: 6 }).map((_, i) => (
					<StatCardSkeleton key={i} />
				))}
			</div>
		</div>
	);
}

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
			<div className="text-6xl mb-4">📊</div>
			<h2 className="text-2xl font-bold mb-2">Start Your Learning Journey</h2>
			<p className="text-muted-foreground max-w-md">
				Complete lessons, quizzes, and flashcards to see your progress here. Your data will appear
				automatically as you study.
			</p>
		</div>
	);
}

export default function UnifiedDashboard() {
	const {
		data: progress,
		isLoading,
		error,
	} = useQuery<UnifiedProgress>({
		queryKey: ['unified-progress'],
		queryFn: async () => {
			const res = await fetch('/api/progress/unified');
			if (!res.ok) throw new Error('Failed to load progress');
			return res.json();
		},
		staleTime: 5 * 60 * 1000,
		retry: 1,
	});

	if (isLoading) {
		return <LoadingState />;
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
				<h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
				<p className="text-muted-foreground mb-4">We couldn&apos;t load your progress.</p>
				<button
					type="button"
					onClick={() => window.location.reload()}
					className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
				>
					Reload
				</button>
			</div>
		);
	}

	if (!progress?.summary?.hasRealData) {
		return <EmptyState />;
	}

	return (
		<div className="min-h-screen bg-background pb-24">
			<ViewTransition>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
							<p className="text-muted-foreground mt-1">
								Track your learning journey across all features
							</p>
						</div>
						<button
							type="button"
							onClick={() => window.print()}
							className="hidden print:hidden px-4 py-2 text-sm font-medium bg-muted hover:bg-muted/80 rounded-lg border border-border/50 transition-colors"
						>
							Export Report
						</button>
					</div>

					<SummaryCard data={progress.summary} />

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<AiTutorCard data={progress.aiTutor} />
						<FlashcardCard data={progress.flashcards} />
						<QuizCard data={progress.quiz} />
						<StudyPlanCard data={progress.studyPlan} />
						<CalendarCard data={progress.calendar} />
					</div>

					<WeakTopicsCard data={progress.weakTopics} />
				</div>
			</ViewTransition>
		</div>
	);
}
