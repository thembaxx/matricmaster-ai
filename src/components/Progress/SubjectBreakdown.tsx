'use client';

import {
	BookOpen01Icon,
	ChevronDown,
	ChevronUp,
	SearchIcon,
	Target01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMemo, useState } from 'react';
import {
	Bar,
	BarChart,
	CartesianGrid,
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

interface SubjectBreakdownProps {
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
	quizData: {
		topicScores: Record<string, number>;
		recentQuizzes: Array<{
			topic: string;
			score: number;
			totalQuestions: number;
			completedAt: Date;
		}>;
	};
}

export function SubjectBreakdown({ topicMastery, weakTopics, quizData }: SubjectBreakdownProps) {
	const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortBy, setSortBy] = useState<'mastery' | 'name' | 'questions'>('mastery');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

	const subjectAnalysis = useMemo(() => {
		const subjectMap = new Map<
			string,
			{
				subject: string;
				topics: typeof topicMastery;
				avgMastery: number;
				totalQuestions: number;
				correctAnswers: number;
				weakTopicsCount: number;
				strengthTopicsCount: number;
				quizPerformance: number;
			}
		>();

		// Group topics by subject
		topicMastery.forEach((topic) => {
			const existing = subjectMap.get(topic.subject) || {
				subject: topic.subject,
				topics: [],
				avgMastery: 0,
				totalQuestions: 0,
				correctAnswers: 0,
				weakTopicsCount: 0,
				strengthTopicsCount: 0,
				quizPerformance: 0,
			};

			existing.topics.push(topic);

			// Find corresponding weak topic data for question counts
			const weakTopicData = weakTopics.find(
				(wt) => wt.topic === topic.topicName && wt.subjectName === topic.subject
			);
			if (weakTopicData) {
				existing.totalQuestions += weakTopicData.questionsAttempted;
				existing.correctAnswers += weakTopicData.questionsCorrect;
			}

			if (topic.masteryLevel < 60) existing.weakTopicsCount++;
			if (topic.masteryLevel >= 80) existing.strengthTopicsCount++;

			subjectMap.set(topic.subject, existing);
		});

		// Calculate averages and quiz performance
		const subjects = Array.from(subjectMap.values()).map((subject) => {
			subject.avgMastery =
				subject.topics.reduce((sum, t) => sum + t.masteryLevel, 0) / subject.topics.length;

			// Calculate quiz performance for this subject
			const subjectQuizzes = quizData.recentQuizzes.filter((quiz) =>
				subject.topics.some((topic) => topic.topicName === quiz.topic)
			);
			subject.quizPerformance =
				subjectQuizzes.length > 0
					? subjectQuizzes.reduce((sum, q) => sum + q.score, 0) / subjectQuizzes.length
					: 0;

			return subject;
		});

		return subjects.sort((a, b) => b.avgMastery - a.avgMastery);
	}, [topicMastery, weakTopics, quizData]);

	const filteredTopics = useMemo(() => {
		let topics = selectedSubject
			? topicMastery.filter((t) => t.subject === selectedSubject)
			: topicMastery;

		if (searchTerm) {
			topics = topics.filter(
				(t) =>
					t.topicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
					t.subject.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		return topics.sort((a, b) => {
			let comparison = 0;
			switch (sortBy) {
				case 'mastery':
					comparison = a.masteryLevel - b.masteryLevel;
					break;
				case 'name':
					comparison = a.topicName.localeCompare(b.topicName);
					break;
				case 'questions': {
					const aQuestions =
						weakTopics.find((wt) => wt.topic === a.topicName)?.questionsAttempted || 0;
					const bQuestions =
						weakTopics.find((wt) => wt.topic === b.topicName)?.questionsAttempted || 0;
					comparison = aQuestions - bQuestions;
					break;
				}
			}
			return sortOrder === 'asc' ? comparison : -comparison;
		});
	}, [topicMastery, selectedSubject, searchTerm, sortBy, sortOrder, weakTopics]);

	const radarData = useMemo(() => {
		if (!selectedSubject) return [];

		const subjectTopics = topicMastery.filter((t) => t.subject === selectedSubject);
		return subjectTopics.map((topic) => ({
			topic:
				topic.topicName.length > 15 ? `${topic.topicName.substring(0, 15)}...` : topic.topicName,
			mastery: topic.masteryLevel,
			fullTopic: topic.topicName,
		}));
	}, [topicMastery, selectedSubject]);

	const masteryDistribution = useMemo(() => {
		const ranges = [
			{ range: '90-100%', count: 0, label: 'Expert' },
			{ range: '70-89%', count: 0, label: 'Proficient' },
			{ range: '50-69%', count: 0, label: 'Developing' },
			{ range: '0-49%', count: 0, label: 'Beginning' },
		];

		filteredTopics.forEach((topic) => {
			if (topic.masteryLevel >= 90) ranges[0].count++;
			else if (topic.masteryLevel >= 70) ranges[1].count++;
			else if (topic.masteryLevel >= 50) ranges[2].count++;
			else ranges[3].count++;
		});

		return ranges;
	}, [filteredTopics]);

	const getMasteryColor = (level: number) => {
		if (level >= 80) return 'text-green-600 bg-green-50';
		if (level >= 60) return 'text-blue-600 bg-blue-50';
		if (level >= 40) return 'text-amber-600 bg-amber-50';
		return 'text-red-600 bg-red-50';
	};

	const getMasteryBadgeVariant = (level: number) => {
		if (level >= 80) return 'default';
		if (level >= 60) return 'secondary';
		if (level >= 40) return 'outline';
		return 'destructive';
	};

	return (
		<div className="space-y-6">
			{/* Subject Overview Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{subjectAnalysis.map((subject) => (
					<Card
						key={subject.subject}
						className={`cursor-pointer transition-all hover:shadow-md ${
							selectedSubject === subject.subject ? 'ring-2 ring-primary' : ''
						}`}
						onClick={() =>
							setSelectedSubject(selectedSubject === subject.subject ? null : subject.subject)
						}
					>
						<CardHeader className="pb-3">
							<CardTitle className="text-lg flex items-center justify-between">
								<span className="truncate">{subject.subject}</span>
								<HugeiconsIcon icon={BookOpen01Icon} className="w-5 h-5 text-muted-foreground" />
							</CardTitle>
							<CardDescription>{subject.topics.length} topics</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div>
								<div className="flex justify-between text-sm mb-1">
									<span>Average Mastery</span>
									<span className="font-medium">{subject.avgMastery.toFixed(1)}%</span>
								</div>
								<Progress value={subject.avgMastery} className="h-2" />
							</div>

							<div className="flex justify-between text-sm">
								<div className="text-center">
									<div className="font-medium text-green-600">{subject.strengthTopicsCount}</div>
									<div className="text-muted-foreground">Strong</div>
								</div>
								<div className="text-center">
									<div className="font-medium text-amber-600">{subject.weakTopicsCount}</div>
									<div className="text-muted-foreground">Weak</div>
								</div>
								<div className="text-center">
									<div className="font-medium">{subject.quizPerformance.toFixed(0)}%</div>
									<div className="text-muted-foreground">Quiz Avg</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Detailed Subject Analysis */}
			{selectedSubject && (
				<Card>
					<CardHeader>
						<CardTitle className="text-xl">{selectedSubject} - Detailed Analysis</CardTitle>
						<CardDescription>
							Topic-by-topic breakdown with mastery levels and recommendations
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Radar Chart */}
						{radarData.length > 0 && (
							<div>
								<h4 className="font-medium mb-4">Topic Mastery Radar</h4>
								<ResponsiveContainer width="100%" height={300}>
									<RadarChart data={radarData}>
										<PolarGrid />
										<PolarAngleAxis dataKey="topic" />
										<PolarRadiusAxis domain={[0, 100]} />
										<Radar
											name="Mastery Level"
											dataKey="mastery"
											stroke="#3b82f6"
											fill="#3b82f6"
											fillOpacity={0.3}
											strokeWidth={2}
										/>
										<Tooltip formatter={(value) => [`${value}%`, 'Mastery']} />
									</RadarChart>
								</ResponsiveContainer>
							</div>
						)}

						{/* Mastery Distribution */}
						<div>
							<h4 className="font-medium mb-4">Mastery Level Distribution</h4>
							<ResponsiveContainer width="100%" height={200}>
								<BarChart data={masteryDistribution}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="range" />
									<YAxis />
									<Tooltip />
									<Bar dataKey="count" fill="#3b82f6" />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Topic List with Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<HugeiconsIcon icon={Target01Icon} className="w-5 h-5" />
						Topic Mastery Details
					</CardTitle>
					<CardDescription>
						Detailed view of all topics with mastery levels and performance metrics
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Filters and Search */}
					<div className="flex flex-col sm:flex-row gap-4 mb-6">
						<div className="relative flex-1">
							<HugeiconsIcon
								icon={SearchIcon}
								className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
							/>
							<Input
								placeholder="Search topics..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>

						<div className="flex gap-2">
							<Button
								variant={sortBy === 'mastery' ? 'default' : 'outline'}
								size="sm"
								onClick={() => {
									if (sortBy === 'mastery') {
										setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
									} else {
										setSortBy('mastery');
										setSortOrder('desc');
									}
								}}
							>
								Mastery
								{sortBy === 'mastery' && (
									<HugeiconsIcon
										icon={sortOrder === 'asc' ? ChevronUp : ChevronDown}
										className="w-4 h-4 ml-1"
									/>
								)}
							</Button>

							<Button
								variant={sortBy === 'name' ? 'default' : 'outline'}
								size="sm"
								onClick={() => {
									setSortBy('name');
									setSortOrder('asc');
								}}
							>
								Name
							</Button>

							<Button
								variant={sortBy === 'questions' ? 'default' : 'outline'}
								size="sm"
								onClick={() => {
									if (sortBy === 'questions') {
										setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
									} else {
										setSortBy('questions');
										setSortOrder('desc');
									}
								}}
							>
								Questions
								{sortBy === 'questions' && (
									<HugeiconsIcon
										icon={sortOrder === 'asc' ? ChevronUp : ChevronDown}
										className="w-4 h-4 ml-1"
									/>
								)}
							</Button>
						</div>
					</div>

					{/* Topic List */}
					<div className="space-y-3">
						{filteredTopics.map((topic) => {
							const weakTopicData = weakTopics.find((wt) => wt.topic === topic.topicName);
							const accuracy =
								weakTopicData && weakTopicData.questionsAttempted > 0
									? (weakTopicData.questionsCorrect / weakTopicData.questionsAttempted) * 100
									: 0;

							return (
								<div
									key={topic.topicId}
									className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-2">
												<h4 className="font-medium">{topic.topicName}</h4>
												<Badge variant={getMasteryBadgeVariant(topic.masteryLevel)}>
													{topic.masteryLevel}%
												</Badge>
											</div>

											<div className="text-sm text-muted-foreground mb-3">{topic.subject}</div>

											<div className="flex items-center gap-4 text-sm">
												{weakTopicData && (
													<>
														<span>{weakTopicData.questionsAttempted} questions attempted</span>
														<span>{accuracy.toFixed(1)}% accuracy</span>
														{weakTopicData.lastPracticed && (
															<span>
																Last practiced:{' '}
																{new Date(weakTopicData.lastPracticed).toLocaleDateString()}
															</span>
														)}
													</>
												)}
											</div>
										</div>

										<div className="text-right">
											<div
												className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getMasteryColor(topic.masteryLevel)}`}
											>
												<HugeiconsIcon icon={Target01Icon} className="w-3 h-3" />
												{topic.masteryLevel >= 80
													? 'Mastered'
													: topic.masteryLevel >= 60
														? 'Proficient'
														: topic.masteryLevel >= 40
															? 'Developing'
															: 'Needs Focus'}
											</div>
										</div>
									</div>

									{topic.recommendation && (
										<div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
											<strong>Recommendation:</strong> {topic.recommendation}
										</div>
									)}
								</div>
							);
						})}
					</div>

					{filteredTopics.length === 0 && (
						<div className="text-center py-8 text-muted-foreground">
							No topics found matching your search criteria.
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
