'use client';

import {
	Analytics01Icon,
	BookOpen01Icon,
	Clock01Icon,
	RefreshIcon,
	SparklesIcon,
	TrendingDown,
	TrendingUp,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import React, { useMemo } from 'react';
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TrendAnalysisProps {
	quizData: {
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
	flashcards: {
		totalCards: number;
		masteredCards: number;
		dueForReview: number;
		decksCompleted: number;
		cardsLearned: number;
		reviewsToday: number;
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
	topicMastery: Array<{
		topicId: string;
		topicName: string;
		subject: string;
		masteryLevel: number;
		recommendation: string;
	}>;
}

export function TrendAnalysis({
	quizData,
	flashcards,
	calendar,
	topicMastery,
}: TrendAnalysisProps) {
	const [timeRange, setTimeRange] = React.useState<'week' | 'month' | 'quarter'>('month');

	const performanceTrend = useMemo(() => {
		const data = quizData.recentQuizzes
			.slice(-14) // Last 14 quizzes for trend analysis
			.map((quiz, index) => ({
				date: new Date(quiz.completedAt).toLocaleDateString(),
				score: quiz.score,
				accuracy: (quiz.score / quiz.totalQuestions) * 100,
				questions: quiz.totalQuestions,
				topic: quiz.topic,
				index,
			}));

		// Calculate moving averages
		const withMovingAvg = data.map((item, index) => {
			const window = data.slice(Math.max(0, index - 2), index + 1);
			const avg = window.reduce((sum, d) => sum + d.score, 0) / window.length;

			return {
				...item,
				movingAvg: Math.round(avg),
			};
		});

		return withMovingAvg;
	}, [quizData.recentQuizzes]);

	const studyActivityTrend = useMemo(() => {
		const sessions = calendar.recentSessions.slice(-14);
		const dailyData: Record<
			string,
			{ date: string; studyMinutes: number; quizzes: number; flashcards: number }
		> = {};

		// Initialize last 14 days
		for (let i = 13; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
			dailyData[dateStr] = { date: dateStr, studyMinutes: 0, quizzes: 0, flashcards: 0 };
		}

		// Add session data
		sessions.forEach((session) => {
			const dateStr = new Date(session.completedAt || session.topic).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
			});
			if (dailyData[dateStr]) {
				dailyData[dateStr].studyMinutes += session.durationMinutes;
			}
		});

		// Add quiz data
		quizData.recentQuizzes.forEach((quiz) => {
			const dateStr = new Date(quiz.completedAt).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
			});
			if (dailyData[dateStr]) {
				dailyData[dateStr].quizzes += 1;
			}
		});

		return Object.values(dailyData);
	}, [calendar.recentSessions, quizData.recentQuizzes]);

	const topicProgression = useMemo(() => {
		// Group topics by subject and show progression
		const subjectGroups = topicMastery.reduce(
			(acc, topic) => {
				if (!acc[topic.subject]) {
					acc[topic.subject] = [];
				}
				acc[topic.subject].push(topic);
				return acc;
			},
			{} as Record<string, typeof topicMastery>
		);

		return Object.entries(subjectGroups).map(([subject, topics]) => ({
			subject,
			totalTopics: topics.length,
			masteredTopics: topics.filter((t) => t.masteryLevel >= 80).length,
			developingTopics: topics.filter((t) => t.masteryLevel >= 50 && t.masteryLevel < 80).length,
			weakTopics: topics.filter((t) => t.masteryLevel < 50).length,
		}));
	}, [topicMastery]);

	const performanceInsights = useMemo(() => {
		const insights = [];

		// Analyze performance trends
		if (performanceTrend.length >= 2) {
			const recentScore = performanceTrend[performanceTrend.length - 1].score;
			const previousScore = performanceTrend[performanceTrend.length - 2].score;
			const trend = recentScore - previousScore;

			if (trend > 5) {
				insights.push({
					type: 'positive',
					message: 'Your performance is improving! Keep up the good work.',
					icon: TrendingUp,
				});
			} else if (trend < -5) {
				insights.push({
					type: 'warning',
					message: 'Your recent scores have declined. Consider reviewing recent topics.',
					icon: TrendingDown,
				});
			}
		}

		// Analyze study activity
		if (studyActivityTrend.length >= 2) {
			const recentMinutes = studyActivityTrend[studyActivityTrend.length - 1].studyMinutes;
			const previousMinutes = studyActivityTrend[studyActivityTrend.length - 2].studyMinutes;
			const activityChange = ((recentMinutes - previousMinutes) / previousMinutes) * 100;

			if (activityChange < -20) {
				insights.push({
					type: 'warning',
					message:
						'Your study time has decreased significantly. Try to maintain consistent study habits.',
					icon: Clock01Icon,
				});
			}
		}

		// Analyze topic mastery
		if (topicMastery) {
			const masteredTopics = topicMastery.filter((topic) => topic.masteryLevel >= 0.8).length;
			const totalTopics = topicMastery.length;
			const masteryRate = masteredTopics / totalTopics;

			if (masteryRate > 0.7) {
				insights.push({
					type: 'positive',
					message: `Strong topic mastery (${masteryRate.toFixed(0)}% of topics mastered)!`,
					icon: Analytics01Icon,
				});
			} else if (masteryRate < 0.3) {
				insights.push({
					type: 'info',
					message: `Focus on building foundational knowledge (${masteryRate.toFixed(0)}% of topics mastered).`,
					icon: BookOpen01Icon,
				});
			}
		}

		// Analyze flashcard review patterns
		if (flashcards.dueForReview > flashcards.totalCards * 0.3) {
			insights.push({
				type: 'warning',
				message: `You have ${flashcards.dueForReview} flashcards due for review. Consider reviewing them soon.`,
				icon: RefreshIcon,
			});
		} else if (flashcards.masteredCards > flashcards.totalCards * 0.5) {
			insights.push({
				type: 'positive',
				message: `Great job! ${flashcards.masteredCards} flashcards are well mastered.`,
				icon: SparklesIcon,
			});
		}

		return insights;
	}, [
		performanceTrend,
		studyActivityTrend,
		topicMastery,
		flashcards.dueForReview,
		flashcards.masteredCards,
		flashcards.totalCards,
	]);

	const subjectPerformanceData = useMemo(() => {
		const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
		return topicProgression.map((subject, index) => ({
			...subject,
			color: colors[index % colors.length],
		}));
	}, [topicProgression]);

	return (
		<div className="space-y-6">
			{/* Time Range Selector */}
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold">Trend Analysis</h3>
				<Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
					<SelectTrigger className="w-32">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="week">Last Week</SelectItem>
						<SelectItem value="month">Last Month</SelectItem>
						<SelectItem value="quarter">Last Quarter</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Performance Insights */}
			{performanceInsights.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<HugeiconsIcon icon={BarChart3Icon} className="w-5 h-5" />
							Key Insights
						</CardTitle>
						<CardDescription>AI-generated analysis of your learning patterns</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{performanceInsights.map((insight, index) => (
								<div
									key={index}
									className={`flex items-start gap-3 p-3 rounded-lg ${
										insight.type === 'positive'
											? 'bg-green-50 border border-green-200'
											: 'bg-amber-50 border border-amber-200'
									}`}
								>
									<HugeiconsIcon
										icon={insight.icon}
										className={`w-5 h-5 mt-0.5 ${
											insight.type === 'positive' ? 'text-green-600' : 'text-amber-600'
										}`}
									/>
									<p
										className={`text-sm ${
											insight.type === 'positive' ? 'text-green-800' : 'text-amber-800'
										}`}
									>
										{insight.message}
									</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			<Tabs defaultValue="performance" className="space-y-4">
				<TabsList>
					<TabsTrigger value="performance">Quiz Performance</TabsTrigger>
					<TabsTrigger value="activity">Study Activity</TabsTrigger>
					<TabsTrigger value="subjects">Subject Progress</TabsTrigger>
				</TabsList>

				<TabsContent value="performance" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Quiz Score Trends</CardTitle>
							<CardDescription>
								Track your performance over time with moving averages
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<AreaChart data={performanceTrend}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="date" />
									<YAxis domain={[0, 100]} />
									<Tooltip
										formatter={(value: number, name: string) => [
											name === 'score' ? `${value}%` : value,
											name === 'score' ? 'Quiz Score' : 'Moving Average',
										]}
									/>
									<Area
										type="monotone"
										dataKey="movingAvg"
										stackId="1"
										stroke="#3b82f6"
										fill="#3b82f6"
										fillOpacity={0.3}
									/>
									<Line
										type="monotone"
										dataKey="score"
										stroke="#ef4444"
										strokeWidth={2}
										dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
									/>
								</AreaChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="activity" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Daily Study Activity</CardTitle>
							<CardDescription>Study studyMinutes and completed activities per day</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={studyActivityTrend}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="date" />
									<YAxis />
									<Tooltip />
									<Bar dataKey="studyMinutes" fill="#3b82f6" name="Study Minutes" />
									<Bar dataKey="quizzes" fill="#10b981" name="Quizzes" />
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="subjects" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Subject Mastery Distribution</CardTitle>
							<CardDescription>
								How your topics are distributed across mastery levels
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<PieChart>
									<Pie
										data={subjectPerformanceData}
										dataKey="totalTopics"
										nameKey="subject"
										cx="50%"
										cy="50%"
										outerRadius={80}
										label={({ subject, totalTopics }) => `${subject}: ${totalTopics}`}
									>
										{subjectPerformanceData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					{/* Subject Progress Table */}
					<Card>
						<CardHeader>
							<CardTitle>Detailed Subject Breakdown</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{subjectPerformanceData.map((subject) => (
									<div key={subject.subject} className="space-y-2">
										<div className="flex items-center justify-between">
											<span className="font-medium">{subject.subject}</span>
											<div className="flex gap-2">
												<Badge variant="outline" className="text-green-600">
													{subject.masteredTopics} mastered
												</Badge>
												{subject.weakTopics > 0 && (
													<Badge variant="destructive">{subject.weakTopics} weak</Badge>
												)}
											</div>
										</div>
										<div className="flex gap-2">
											<div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
												<div
													className="bg-green-500 h-full"
													style={{
														width: `${(subject.masteredTopics / subject.totalTopics) * 100}%`,
													}}
												/>
											</div>
											<div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
												<div
													className="bg-amber-500 h-full"
													style={{
														width: `${(subject.developingTopics / subject.totalTopics) * 100}%`,
													}}
												/>
											</div>
											<div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
												<div
													className="bg-red-500 h-full"
													style={{ width: `${(subject.weakTopics / subject.totalTopics) * 100}%` }}
												/>
											</div>
										</div>
										<div className="text-sm text-muted-foreground">
											{subject.totalTopics} topics total
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
