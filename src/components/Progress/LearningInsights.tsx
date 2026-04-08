'use client';

import {
	BookOpenIcon,
	BrainIcon,
	BulbIcon,
	ClockIcon,
	LightbulbIcon,
	TargetIcon,
	TrendingDownIcon,
	TrendingUpIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LearningInsightsProps {
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
	studyStats: {
		totalStudyTimeMinutes: number;
		streakDays: number;
	};
	flashcards: {
		totalCards: number;
		masteredCards: number;
		dueForReview: number;
	};
}

export function LearningInsights({
	quizData,
	topicMastery,
	weakTopics,
	studyStats,
	flashcards,
}: LearningInsightsProps) {
	const [_selectedInsight, _setSelectedInsight] = useState<string | null>(null);

	const insights = useMemo(() => {
		const analysis = {
			strengths: [] as string[],
			weaknesses: [] as string[],
			recommendations: [] as string[],
			patterns: [] as string[],
		};

		// Analyze quiz performance
		const accuracy =
			quizData.questionsAttempted > 0
				? (quizData.correctAnswers / quizData.questionsAttempted) * 100
				: 0;

		if (accuracy >= 85) {
			analysis.strengths.push(
				'Excellent quiz accuracy! You demonstrate strong understanding of core concepts.'
			);
		} else if (accuracy >= 70) {
			analysis.strengths.push(
				"Good quiz performance. You're building solid foundational knowledge."
			);
		} else if (accuracy < 50) {
			analysis.weaknesses.push('Quiz scores indicate areas needing significant improvement.');
		}

		// Analyze topic mastery distribution
		const masteredTopics = topicMastery.filter((t) => t.masteryLevel >= 80).length;
		const developingTopics = topicMastery.filter(
			(t) => t.masteryLevel >= 50 && t.masteryLevel < 80
		).length;
		const weakTopicCount = topicMastery.filter((t) => t.masteryLevel < 50).length;

		if (masteredTopics > developingTopics + weakTopicCount) {
			analysis.strengths.push(
				"Strong topic mastery across multiple areas. You're excelling in many subjects!"
			);
		}

		if (weakTopicCount > masteredTopics) {
			analysis.weaknesses.push(
				'Multiple topics need focused attention. Consider prioritizing these areas.'
			);
		}

		// Analyze study patterns
		if (studyStats.streakDays >= 7) {
			analysis.strengths.push(
				'Impressive study consistency! Long streaks indicate strong discipline.'
			);
		} else if (studyStats.streakDays < 3) {
			analysis.weaknesses.push(
				'Study consistency could be improved. Try establishing a regular routine.'
			);
		}

		// Analyze flashcard progress
		const flashcardMasteryRate =
			flashcards.totalCards > 0 ? (flashcards.masteredCards / flashcards.totalCards) * 100 : 0;

		if (flashcardMasteryRate >= 60) {
			analysis.strengths.push(
				'Excellent flashcard retention. Your spaced repetition is working well!'
			);
		} else if (flashcards.dueForReview > flashcards.totalCards * 0.3) {
			analysis.weaknesses.push(
				'Many flashcards are due for review. Consider increasing review frequency.'
			);
		}

		// Performance trends
		if (quizData.recentQuizzes.length >= 3) {
			const recentScores = quizData.recentQuizzes.slice(-3).map((q) => q.score);
			const trend = recentScores[recentScores.length - 1] - recentScores[0];

			if (trend > 10) {
				analysis.patterns.push(
					'Upward performance trend detected! Your recent scores are improving.'
				);
			} else if (trend < -10) {
				analysis.patterns.push(
					'Recent scores show a declining trend. Review recent study methods.'
				);
			}
		}

		// Generate recommendations
		if (weakTopics.length > 0) {
			const topWeakTopics = weakTopics
				.sort((a, b) => a.masteryLevel - b.masteryLevel)
				.slice(0, 3)
				.map((t) => t.topic);

			analysis.recommendations.push(
				`Focus on these key topics: ${topWeakTopics.join(', ')}. Spend extra time reviewing these areas.`
			);
		}

		if (accuracy < 70) {
			analysis.recommendations.push(
				'Consider breaking down complex problems into smaller steps. Practice with similar question types.'
			);
		}

		if (studyStats.totalStudyTimeMinutes < 300) {
			// Less than 5 hours/week
			analysis.recommendations.push(
				'Increase study time gradually. Aim for consistent daily sessions rather than cramming.'
			);
		}

		if (flashcards.dueForReview > 10) {
			analysis.recommendations.push(
				'Dedicate time to flashcard reviews. Regular review strengthens long-term retention.'
			);
		}

		// Subject-specific insights
		const subjectPerformance = topicMastery.reduce(
			(acc, topic) => {
				if (!acc[topic.subject]) {
					acc[topic.subject] = { topics: [], avgMastery: 0 };
				}
				acc[topic.subject].topics.push(topic);
				return acc;
			},
			{} as Record<string, { topics: typeof topicMastery; avgMastery: number }>
		);

		Object.entries(subjectPerformance).forEach(([subject, data]) => {
			data.avgMastery =
				data.topics.reduce((sum, t) => sum + t.masteryLevel, 0) / data.topics.length;

			if (data.avgMastery >= 80) {
				analysis.strengths.push(
					`${subject} shows exceptional performance. Consider challenging yourself with advanced topics.`
				);
			} else if (data.avgMastery < 50) {
				analysis.weaknesses.push(
					`${subject} needs significant attention. Focus on foundational concepts first.`
				);
			}
		});

		return analysis;
	}, [quizData, topicMastery, weakTopics, studyStats, flashcards]);

	const insightCategories = [
		{
			key: 'strengths',
			title: 'Your Strengths',
			icon: TrendingUpIcon,
			color: 'text-green-600',
			data: insights.strengths,
		},
		{
			key: 'weaknesses',
			title: 'Areas for Improvement',
			icon: TrendingDownIcon,
			color: 'text-amber-600',
			data: insights.weaknesses,
		},
		{
			key: 'patterns',
			title: 'Learning Patterns',
			icon: BrainIcon,
			color: 'text-blue-600',
			data: insights.patterns,
		},
		{
			key: 'recommendations',
			title: 'Actionable Recommendations',
			icon: LightbulbIcon,
			color: 'text-purple-600',
			data: insights.recommendations,
		},
	];

	const quickStats = useMemo(() => {
		const accuracy =
			quizData.questionsAttempted > 0
				? (quizData.correctAnswers / quizData.questionsAttempted) * 100
				: 0;

		const masteryRate =
			topicMastery.length > 0
				? (topicMastery.filter((t) => t.masteryLevel >= 70).length / topicMastery.length) * 100
				: 0;

		const studyEfficiency =
			studyStats.totalStudyTimeMinutes > 0
				? (quizData.correctAnswers / studyStats.totalStudyTimeMinutes) * 60 // answers per hour
				: 0;

		return {
			overallScore: accuracy,
			masteryRate,
			studyEfficiency,
			weakAreas: weakTopics.length,
		};
	}, [quizData, topicMastery, weakTopics, studyStats]);

	return (
		<div className="space-y-6">
			{/* Quick Stats Overview */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4 text-center">
						<HugeiconsIcon icon={TargetIcon} className="w-6 h-6 mx-auto mb-2 text-blue-600" />
						<div className="text-2xl font-bold">{quickStats.overallScore.toFixed(1)}%</div>
						<div className="text-xs text-muted-foreground">Overall Accuracy</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4 text-center">
						<HugeiconsIcon icon={BookOpenIcon} className="w-6 h-6 mx-auto mb-2 text-green-600" />
						<div className="text-2xl font-bold">{quickStats.masteryRate.toFixed(1)}%</div>
						<div className="text-xs text-muted-foreground">Topics Mastered</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4 text-center">
						<HugeiconsIcon icon={ClockIcon} className="w-6 h-6 mx-auto mb-2 text-purple-600" />
						<div className="text-2xl font-bold">{quickStats.studyEfficiency.toFixed(1)}</div>
						<div className="text-xs text-muted-foreground">Answers/Hour</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4 text-center">
						<HugeiconsIcon icon={BulbIcon} className="w-6 h-6 mx-auto mb-2 text-amber-600" />
						<div className="text-2xl font-bold">{quickStats.weakAreas}</div>
						<div className="text-xs text-muted-foreground">Focus Areas</div>
					</CardContent>
				</Card>
			</div>

			{/* AI-Generated Insights */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<HugeiconsIcon icon={BrainIcon} className="w-5 h-5" />
						AI Learning Insights
					</CardTitle>
					<CardDescription>
						Personalized analysis of your learning patterns and performance
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="overview" className="space-y-4">
						<TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="strengths">Strengths</TabsTrigger>
							<TabsTrigger value="weaknesses">Weaknesses</TabsTrigger>
							<TabsTrigger value="recommendations">Recommendations</TabsTrigger>
						</TabsList>

						<TabsContent value="overview" className="space-y-4">
							<div className="grid gap-4">
								{insightCategories.map((category) => (
									<div key={category.key} className="border rounded-lg p-4">
										<div className="flex items-center gap-3 mb-2">
											<HugeiconsIcon icon={category.icon} className={`w-5 h-5 ${category.color}`} />
											<h4 className="font-medium">{category.title}</h4>
											<Badge variant="outline">{category.data.length}</Badge>
										</div>
										{category.data.length > 0 ? (
											<ul className="space-y-1 text-sm text-muted-foreground">
												{category.data.slice(0, 2).map((insight, index) => (
													<li key={index} className="flex items-start gap-2">
														<span className="text-xs mt-1">•</span>
														<span>{insight}</span>
													</li>
												))}
												{category.data.length > 2 && (
													<li className="text-xs text-muted-foreground">
														+{category.data.length - 2} more insights...
													</li>
												)}
											</ul>
										) : (
											<p className="text-sm text-muted-foreground">No insights available yet.</p>
										)}
									</div>
								))}
							</div>
						</TabsContent>

						{insightCategories.map((category) => (
							<TabsContent key={category.key} value={category.key} className="space-y-4">
								<div className="space-y-4">
									{category.data.map((insight, index) => (
										<div
											key={index}
											className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
										>
											<div className="flex items-start gap-3">
												<HugeiconsIcon
													icon={category.icon}
													className={`w-5 h-5 mt-1 ${category.color}`}
												/>
												<div>
													<p className="text-sm leading-relaxed">{insight}</p>
												</div>
											</div>
										</div>
									))}

									{category.data.length === 0 && (
										<div className="text-center py-8 text-muted-foreground">
											<HugeiconsIcon
												icon={category.icon}
												className="w-12 h-12 mx-auto mb-4 opacity-50"
											/>
											<p>No {category.title.toLowerCase()} identified yet.</p>
											<p className="text-sm">Continue learning to generate more insights!</p>
										</div>
									)}
								</div>
							</TabsContent>
						))}
					</Tabs>
				</CardContent>
			</Card>

			{/* Personalized Study Plan Suggestion */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<HugeiconsIcon icon={LightbulbIcon} className="w-5 h-5" />
						Personalized Study Plan
					</CardTitle>
					<CardDescription>
						AI-recommended study strategy based on your current performance
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="grid gap-4">
							{/* Priority Actions */}
							<div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
								<h4 className="font-medium text-blue-900 mb-2">🎯 Immediate Focus Areas</h4>
								<ul className="space-y-1 text-sm text-blue-800">
									{weakTopics.slice(0, 3).map((topic, index) => (
										<li key={index} className="flex items-center gap-2">
											<span>•</span>
											<span>
												{topic.topic} ({topic.subjectName}) - {topic.masteryLevel}% mastery
											</span>
										</li>
									))}
									{weakTopics.length === 0 && (
										<li className="text-green-700">Great job! No major weak areas detected.</li>
									)}
								</ul>
							</div>

							{/* Study Technique Recommendations */}
							<div className="border rounded-lg p-4 bg-green-50 border-green-200">
								<h4 className="font-medium text-green-900 mb-2">📚 Recommended Study Techniques</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
									{accuracy < 70 && (
										<div className="flex items-center gap-2 text-green-800">
											<span>•</span>
											<span>Practice with spaced repetition flashcards</span>
										</div>
									)}
									{weakTopics.length > 5 && (
										<div className="flex items-center gap-2 text-green-800">
											<span>•</span>
											<span>Focus on one subject per study session</span>
										</div>
									)}
									{studyStats.streakDays < 5 && (
										<div className="flex items-center gap-2 text-green-800">
											<span>•</span>
											<span>Establish a daily study routine</span>
										</div>
									)}
									{flashcards.dueForReview > 20 && (
										<div className="flex items-center gap-2 text-green-800">
											<span>•</span>
											<span>Dedicate 15 minutes daily to flashcard review</span>
										</div>
									)}
								</div>
							</div>

							{/* Progress Milestones */}
							<div className="border rounded-lg p-4 bg-purple-50 border-purple-200">
								<h4 className="font-medium text-purple-900 mb-2">🏆 Next Milestones</h4>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
									<div className="text-center p-2 bg-white rounded border">
										<div className="font-medium text-purple-900">Quiz Mastery</div>
										<div className="text-purple-700">
											{accuracy < 75
												? 'Target: 75% accuracy'
												: accuracy < 85
													? 'Target: 85% accuracy'
													: 'Target: 90% accuracy'}
										</div>
									</div>
									<div className="text-center p-2 bg-white rounded border">
										<div className="font-medium text-purple-900">Topic Coverage</div>
										<div className="text-purple-700">
											{topicMastery.filter((t) => t.masteryLevel >= 70).length} /{' '}
											{topicMastery.length} mastered
										</div>
									</div>
									<div className="text-center p-2 bg-white rounded border">
										<div className="font-medium text-purple-900">Study Streak</div>
										<div className="text-purple-700">
											{studyStats.streakDays < 7
												? 'Target: 7-day streak'
												: studyStats.streakDays < 14
													? 'Target: 14-day streak'
													: 'Target: 30-day streak'}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
