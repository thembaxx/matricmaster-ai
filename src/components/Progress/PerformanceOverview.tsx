'use client';

import { ArrowDown01Icon, ArrowUp01Icon, Target01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMemo } from 'react';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface PerformanceOverviewProps {
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
	topicMastery: Array<{
		topicId: string;
		topicName: string;
		subject: string;
		masteryLevel: number;
		recommendation: string;
	}>;
	weakTopics: Array<{
		topic: string;
		subjectId: number;
		subjectName: string;
		masteryLevel: number;
		questionsAttempted: number;
		questionsCorrect: number;
		lastPracticed: Date | null;
	}>;
}

export function PerformanceOverview({
	quizData,
	topicMastery,
	weakTopics,
}: PerformanceOverviewProps) {
	const accuracy =
		quizData.questionsAttempted > 0
			? (quizData.correctAnswers / quizData.questionsAttempted) * 100
			: 0;

	const subjectPerformance = useMemo(() => {
		const subjectMap = new Map<
			string,
			{
				subject: string;
				topics: number;
				avgMastery: number;
				weakTopics: number;
				trend: 'up' | 'down' | 'stable';
			}
		>();

		topicMastery.forEach((topic) => {
			const existing = subjectMap.get(topic.subject) || {
				subject: topic.subject,
				topics: 0,
				avgMastery: 0,
				weakTopics: 0,
				trend: 'stable' as const,
			};

			existing.topics += 1;
			existing.avgMastery =
				(existing.avgMastery * (existing.topics - 1) + topic.masteryLevel) / existing.topics;
			if (topic.masteryLevel < 60) existing.weakTopics += 1;

			subjectMap.set(topic.subject, existing);
		});

		return Array.from(subjectMap.values());
	}, [topicMastery]);

	const learningVelocity = useMemo(() => {
		if (quizData.recentQuizzes.length < 2) return 0;

		const sorted = quizData.recentQuizzes.sort(
			(a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
		);

		const recent = sorted.slice(-5);
		const scores = recent.map((q) => q.score);
		const avgRecent = scores.reduce((a, b) => a + b, 0) / scores.length;

		const older = sorted.slice(-10, -5);
		if (older.length === 0) return 0;

		const olderScores = older.map((q) => q.score);
		const avgOlder = olderScores.reduce((a, b) => a + b, 0) / older.length;
		const velocity = ((avgRecent - avgOlder) / avgOlder) * 100;

		return Math.round(velocity * 10) / 10; // Round to 1 decimal
	}, [quizData.recentQuizzes]);

	const quizTrendData = useMemo(() => {
		return quizData.recentQuizzes.slice(-7).map((quiz, index) => ({
			date: new Date(quiz.completedAt).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
			}),
			score: quiz.score,
			questions: quiz.totalQuestions,
			day: index + 1,
		}));
	}, [quizData.recentQuizzes]);

	const masteryDistribution = useMemo(() => {
		const ranges = [
			{ name: 'Expert (90-100%)', count: 0, color: '#10b981' },
			{ name: 'Proficient (70-89%)', count: 0, color: '#3b82f6' },
			{ name: 'Developing (50-69%)', count: 0, color: '#f59e0b' },
			{ name: 'Beginning (0-49%)', count: 0, color: '#ef4444' },
		];

		topicMastery.forEach((topic) => {
			if (topic.masteryLevel >= 90) ranges[0].count++;
			else if (topic.masteryLevel >= 70) ranges[1].count++;
			else if (topic.masteryLevel >= 50) ranges[2].count++;
			else ranges[3].count++;
		});

		return ranges;
	}, [topicMastery]);

	return (
		<div className="space-y-6">
			{/* Key Metrics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<HugeiconsIcon icon={Target01Icon} className="w-4 h-4" />
							Overall Accuracy
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{accuracy.toFixed(1)}%</div>
						<Progress value={accuracy} className="mt-2" />
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							{learningVelocity >= 0 ? (
								<HugeiconsIcon icon={ArrowUp01Icon} className="w-4 h-4 text-green-600" />
							) : (
								<HugeiconsIcon icon={ArrowDown01Icon} className="w-4 h-4 text-red-600" />
							)}
							Learning Velocity
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div
							className={`text-2xl font-bold ${learningVelocity >= 0 ? 'text-green-600' : 'text-red-600'}`}
						>
							{learningVelocity >= 0 ? '+' : ''}
							{learningVelocity}%
						</div>
						<p className="text-xs text-muted-foreground">vs last 5 quizzes</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Mastered Topics</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{topicMastery.filter((t) => t.masteryLevel >= 80).length}
						</div>
						<p className="text-xs text-muted-foreground">of {topicMastery.length} total</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Areas for Focus</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-amber-600">{weakTopics.length}</div>
						<p className="text-xs text-muted-foreground">topics need attention</p>
					</CardContent>
				</Card>
			</div>

			{/* Performance Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Quiz Score Trend */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Quiz Performance Trend</CardTitle>
						<CardDescription>Recent quiz scores over time</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={200}>
							<LineChart data={quizTrendData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="date" />
								<YAxis domain={[0, 100]} />
								<Tooltip
									formatter={(value) => [`${value}%`, 'Score']}
									labelFormatter={(label) => `Date: ${label}`}
								/>
								<Line
									type="monotone"
									dataKey="score"
									stroke="#3b82f6"
									strokeWidth={2}
									dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* Mastery Distribution */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Topic Mastery Distribution</CardTitle>
						<CardDescription>How well you're doing across all topics</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={200}>
							<BarChart data={masteryDistribution}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
								<YAxis />
								<Tooltip />
								<Bar dataKey="count" fill="#3b82f6" />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			{/* Subject Performance Overview */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Subject Performance Overview</CardTitle>
					<CardDescription>Mastery levels and areas needing attention by subject</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{subjectPerformance.map((subject) => (
							<div key={subject.subject} className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="font-medium">{subject.subject}</span>
									<div className="flex items-center gap-2">
										<Badge variant="outline">{subject.avgMastery.toFixed(1)}% avg</Badge>
										{subject.weakTopics > 0 && (
											<Badge variant="destructive">{subject.weakTopics} weak</Badge>
										)}
									</div>
								</div>
								<Progress value={subject.avgMastery} className="h-2" />
								<div className="text-sm text-muted-foreground">
									{subject.topics} topics • {subject.weakTopics} need attention
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
