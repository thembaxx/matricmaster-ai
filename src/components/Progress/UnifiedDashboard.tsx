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
							<p className="text-white/80 body-sm">total xp</p>
							<p className="text-4xl font-bold font-numeric">{data.totalXp.toLocaleString()}</p>
						</div>
					</div>
					<div className="flex gap-8">
						<div className="text-center">
							<p className="text-white/80 label-xs">streak</p>
							<p className="text-3xl font-bold font-numeric">{data.streak}</p>
							<p className="text-white/60 label-xs">days</p>
						</div>
						<div className="text-center">
							<p className="text-white/80 label-xs">best</p>
							<p className="text-3xl font-bold font-numeric">{data.bestStreak}</p>
							<p className="text-white/60 label-xs">days</p>
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
				<CardTitle className="heading-4 flex items-center gap-2">
					<span className="text-2xl">🤖</span>
					ai tutor
				</CardTitle>
				<CardDescription className="body-sm">your conversations with the ai tutor</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div className="text-center p-3 bg-muted/50 rounded-lg">
						<p className="text-2xl font-bold font-numeric">{data.conversationsCount}</p>
						<p className="label-xs text-muted-foreground">conversations</p>
					</div>
					<div className="text-center p-3 bg-muted/50 rounded-lg">
						<p className="text-2xl font-bold font-numeric">{data.topicsStudied}</p>
						<p className="label-xs text-muted-foreground">topics</p>
					</div>
				</div>
				<div className="text-center p-3 bg-muted/50 rounded-lg">
					<p className="text-2xl font-bold font-numeric">
						{Math.round(data.totalSessionTime / 60)}h
					</p>
					<p className="label-xs text-muted-foreground">total session time</p>
				</div>
				{data.recentConversations.length > 0 && (
					<div className="space-y-2">
						<p className="label-xs font-medium">recent topics</p>
						<div className="flex flex-wrap gap-1">
							{data.recentConversations.slice(0, 3).map((conv) => (
								<Badge key={conv.id} variant="outline" className="label-xs">
									{conv.topic.toLowerCase()}
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
				<CardTitle className="heading-4 flex items-center gap-2">
					<span className="text-2xl">📚</span>
					flashcards
				</CardTitle>
				<CardDescription className="body-sm">your flashcard progress</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex justify-center">
					<ProgressRing progress={masteryPercent} size={100} strokeWidth={8}>
						<div className="text-center">
							<p className="text-2xl font-bold font-numeric">{masteryPercent}%</p>
							<p className="label-xs text-muted-foreground">mastered</p>
						</div>
					</ProgressRing>
				</div>
				<div className="grid grid-cols-3 gap-2 text-center">
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold font-numeric">{data.totalCards}</p>
						<p className="label-xs text-muted-foreground">total</p>
					</div>
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold font-numeric text-green-600">{data.masteredCards}</p>
						<p className="label-xs text-muted-foreground">mastered</p>
					</div>
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold font-numeric text-amber-600">{data.dueForReview}</p>
						<p className="label-xs text-muted-foreground">due</p>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-2 text-center">
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold font-numeric">{data.decksCompleted}</p>
						<p className="label-xs text-muted-foreground">decks done</p>
					</div>
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold font-numeric">{data.reviewsToday}</p>
						<p className="label-xs text-muted-foreground">today</p>
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
							<p className="text-2xl font-bold font-numeric">{data.averageScore}%</p>
							<p className="label-xs text-muted-foreground">avg score</p>
						</div>
					</ProgressRing>
				</div>
				<div className="grid grid-cols-3 gap-2 text-center">
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold font-numeric">{data.quizzesTaken}</p>
						<p className="label-xs text-muted-foreground">taken</p>
					</div>
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold font-numeric">{data.questionsAttempted}</p>
						<p className="label-xs text-muted-foreground">questions</p>
					</div>
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold font-numeric text-green-600">{data.correctAnswers}</p>
						<p className="label-xs text-muted-foreground">correct</p>
					</div>
				</div>
				{Object.keys(data.topicScores).length > 0 && (
					<div className="space-y-2">
						<p className="label-xs font-medium">topic scores</p>
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
							<p className="text-2xl font-bold font-numeric">{data.completionPercentage}%</p>
							<p className="label-xs text-muted-foreground">complete</p>
						</div>
					</ProgressRing>
				</div>
				<div className="grid grid-cols-2 gap-2 text-center">
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold font-numeric">{data.tasksCompleted}</p>
						<p className="label-xs text-muted-foreground">completed</p>
					</div>
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold font-numeric">{data.tasksTotal}</p>
						<p className="label-xs text-muted-foreground">total</p>
					</div>
				</div>
				<div className="text-center p-2 bg-muted/50 rounded-lg">
					<p className="text-lg font-bold font-numeric">{data.activePlans}</p>
					<p className="label-xs text-muted-foreground">active plans</p>
				</div>
				{data.recentPlans.length > 0 && (
					<div className="space-y-2">
						<p className="label-xs font-medium">recent plans</p>
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
						<p className="text-lg font-bold font-numeric">{data.sessionsCompleted}</p>
						<p className="label-xs text-muted-foreground">sessions</p>
					</div>
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold font-numeric">
							{Math.round(data.totalStudyMinutes / 60)}h
						</p>
						<p className="label-xs text-muted-foreground">study time</p>
					</div>
					<div className="p-2 bg-muted/50 rounded-lg">
						<p className="text-lg font-bold font-numeric">{data.attendanceRate}%</p>
						<p className="label-xs text-muted-foreground">attendance</p>
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
					<p className="text-center text-muted-foreground py-8 body-sm">
						no weak topics identified. keep up the great work!
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
			<h2 className="heading-2 mb-2">start your learning journey</h2>
			<p className="text-muted-foreground max-w-md body-md">
				complete lessons, quizzes, and flashcards to see your progress here. your data will appear
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
							<h1 className="heading-1 tracking-tight">your progress</h1>
							<p className="text-muted-foreground mt-1 body-md">
								track your learning journey across all features
							</p>
						</div>
						<button
							type="button"
							onClick={() => window.print()}
							className="hidden print:hidden px-4 py-2 label-sm bg-muted hover:bg-muted/80 rounded-lg border border-border/50 transition-colors tiimo-press hover-lift"
						>
							export report
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
