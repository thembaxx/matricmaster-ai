'use client';

import { Analytics01Icon, Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GoalTracking } from './GoalTracking';
import { LearningInsights } from './LearningInsights';
import { PerformanceOverview } from './PerformanceOverview';
import { SubjectBreakdown } from './SubjectBreakdown';
import { TrendAnalysis } from './TrendAnalysis';

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
			createdAt: Date | null;
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
			completedAt: Date | null;
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

interface AnalyticsDashboardProps {
	initialData?: UnifiedProgress;
}

export default function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
	const [selectedTab, setSelectedTab] = useState('overview');

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
		initialData,
		staleTime: 5 * 60 * 1000,
		retry: 1,
	});

	if (isLoading && !initialData) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<HugeiconsIcon icon={Loading03Icon} className="w-8 h-8 animate-spin text-primary" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
				<h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
				<p className="text-muted-foreground mb-4">We couldn't load your progress.</p>
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
		return (
			<div className="min-h-screen pb-40 pt-8 px-4">
				<div className="max-w-7xl mx-auto">
					<div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
						<div className="text-6xl mb-4">📊</div>
						<h2 className="heading-2 mb-2">start your learning journey</h2>
						<p className="text-muted-foreground max-w-md body-md">
							complete lessons, quizzes, and flashcards to see your progress here. your data will
							appear automatically as you study.
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Mock study stats for now - in real implementation, this would come from API
	const mockStudyStats = {
		totalStudyTimeMinutes: progress.calendar.totalStudyMinutes,
		streakDays: progress.summary.streak,
	};

	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-7xl mx-auto">
				<div className="mb-8">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3 mb-2">
							<h1 className="text-3xl font-bold flex items-center gap-2">
								<HugeiconsIcon icon={Analytics01Icon} className="w-8 h-8" />
								Progress Analytics
							</h1>
							{!progress.summary.hasRealData && (
								<Badge
									variant="outline"
									className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30"
								>
									demo data
								</Badge>
							)}
						</div>
					</div>
					<p className="text-muted-foreground">
						Comprehensive insights into your learning progress and performance
					</p>
				</div>

				<Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
					<TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="performance">Performance</TabsTrigger>
						<TabsTrigger value="trends">Trends</TabsTrigger>
						<TabsTrigger value="subjects">Subjects</TabsTrigger>
						<TabsTrigger value="insights">Insights</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-6">
						{/* Key Metrics Summary */}
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium">Total XP</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{progress.summary.totalXp.toLocaleString()}
									</div>
									<p className="text-xs text-muted-foreground">Level {progress.summary.level}</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium">Quiz Accuracy</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{progress.quiz.averageScore.toFixed(1)}%</div>
									<p className="text-xs text-muted-foreground">
										{progress.quiz.questionsAttempted} questions
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium">Study Streak</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{progress.summary.streak}</div>
									<p className="text-xs text-muted-foreground">
										Best: {progress.summary.bestStreak}
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium">Topics Mastered</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{progress.weakTopics.filter((t) => t.masteryLevel >= 80).length}
									</div>
									<p className="text-xs text-muted-foreground">
										of {progress.weakTopics.length} total
									</p>
								</CardContent>
							</Card>
						</div>

						{/* Quick Overview Cards */}
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{/* Recent Activity */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Recent Quizzes</CardTitle>
									<CardDescription>Your latest quiz performance</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{progress.quiz.recentQuizzes.slice(0, 3).map((quiz, index) => (
											<div key={index} className="flex justify-between items-center">
												<span className="text-sm truncate">{quiz.topic}</span>
												<Badge variant={quiz.score >= 70 ? 'default' : 'secondary'}>
													{quiz.score}%
												</Badge>
											</div>
										))}
									</div>
								</CardContent>
							</Card>

							{/* Flashcard Progress */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Flashcard Progress</CardTitle>
									<CardDescription>Your memorization stats</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="text-center">
											<div className="text-3xl font-bold text-green-600">
												{progress.flashcards.masteredCards}
											</div>
											<div className="text-sm text-muted-foreground">Cards Mastered</div>
										</div>
										<div className="grid grid-cols-2 gap-4 text-center">
											<div>
												<div className="text-lg font-semibold">
													{progress.flashcards.totalCards}
												</div>
												<div className="text-xs text-muted-foreground">Total</div>
											</div>
											<div>
												<div className="text-lg font-semibold text-amber-600">
													{progress.flashcards.dueForReview}
												</div>
												<div className="text-xs text-muted-foreground">Due</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Study Sessions */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Study Sessions</CardTitle>
									<CardDescription>Your recent study activity</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div className="text-center">
											<div className="text-3xl font-bold">
												{progress.calendar.sessionsCompleted}
											</div>
											<div className="text-sm text-muted-foreground">Sessions Completed</div>
										</div>
										<div className="text-center">
											<div className="text-xl font-semibold">
												{Math.round(progress.calendar.totalStudyMinutes / 60)}h
											</div>
											<div className="text-sm text-muted-foreground">Total Study Time</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="performance" className="space-y-6">
						<PerformanceOverview
							quizData={progress.quiz}
							topicMastery={progress.weakTopics}
							weakTopics={progress.weakTopics.map((t) => ({
								topic: t.topicName,
								subjectId: 1, // Mock - would need proper mapping
								subjectName: t.subject,
								masteryLevel: t.masteryLevel,
								questionsAttempted: 0, // Mock - would need real data
								questionsCorrect: 0,
								lastPracticed: null,
							}))}
						/>
					</TabsContent>

					<TabsContent value="trends" className="space-y-6">
						<TrendAnalysis
							quizData={progress.quiz}
							flashcards={progress.flashcards}
							calendar={progress.calendar}
							topicMastery={progress.weakTopics}
						/>
					</TabsContent>

					<TabsContent value="subjects" className="space-y-6">
						<SubjectBreakdown
							topicMastery={progress.weakTopics}
							weakTopics={progress.weakTopics.map((t) => ({
								topic: t.topicName,
								subjectId: 1,
								subjectName: t.subject,
								masteryLevel: t.masteryLevel,
								questionsAttempted: 0,
								questionsCorrect: 0,
								lastPracticed: null,
							}))}
							quizData={progress.quiz}
						/>
					</TabsContent>

					<TabsContent value="insights" className="space-y-6">
						<LearningInsights
							quizData={progress.quiz}
							topicMastery={progress.weakTopics}
							weakTopics={progress.weakTopics.map((t) => ({
								topic: t.topicName,
								subjectId: 1,
								subjectName: t.subject,
								masteryLevel: t.masteryLevel,
								questionsAttempted: 0,
								questionsCorrect: 0,
								lastPracticed: null,
							}))}
							studyStats={mockStudyStats}
							flashcards={progress.flashcards}
						/>

						{/* Goal Tracking Section */}
						<div className="mt-8">
							<h3 className="text-xl font-semibold mb-4">Academic Goals</h3>
							<GoalTracking
								quizData={progress.quiz}
								flashcards={progress.flashcards}
								studyStats={mockStudyStats}
								topicMastery={progress.weakTopics}
							/>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
