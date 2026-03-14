'use client';

import {
	Analytics01Icon,
	ArrowDown01Icon,
	ArrowUp01Icon,
	CircleIcon,
	Clock01Icon,
	FireIcon,
	Loading03Icon,
	Medal01Icon,
	Target01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StudyStats {
	totalStudyTime: number;
	quizzesCompleted: number;
	correctAnswers: number;
	flashcardsReviewed: number;
	streakDays: number;
	level: number;
	xp: number;
	xpToNextLevel: number;
}

interface SubjectPerformance {
	subject: string;
	averageScore: number;
	questionsAnswered: number;
	weakAreas: string[];
	strengthAreas: string[];
	trend: 'up' | 'down' | 'stable';
}

interface DailyActivity {
	date: string;
	studyMinutes: number;
	quizzesTaken: number;
	flashcardsReviewed: number;
	xpEarned: number;
}

interface Achievement {
	id: string;
	name: string;
	description: string;
	icon: string;
	unlockedAt: Date | null;
	progress: number;
}

const MOCK_STATS: StudyStats = {
	totalStudyTime: 12480,
	quizzesCompleted: 156,
	correctAnswers: 892,
	flashcardsReviewed: 456,
	streakDays: 12,
	level: 23,
	xp: 4520,
	xpToNextLevel: 5000,
};

const MOCK_SUBJECTS: SubjectPerformance[] = [
	{
		subject: 'Mathematics',
		averageScore: 78,
		questionsAnswered: 234,
		weakAreas: ['Calculus', 'Trigonometry'],
		strengthAreas: ['Algebra', 'Statistics'],
		trend: 'up',
	},
	{
		subject: 'Physical Sciences',
		averageScore: 72,
		questionsAnswered: 189,
		weakAreas: ['Electromagnetism'],
		strengthAreas: ['Mechanics', 'Waves'],
		trend: 'up',
	},
	{
		subject: 'Life Sciences',
		averageScore: 85,
		questionsAnswered: 167,
		weakAreas: ['Genetics'],
		strengthAreas: ['Cell Biology', 'Ecology'],
		trend: 'stable',
	},
	{
		subject: 'Geography',
		averageScore: 68,
		questionsAnswered: 145,
		weakAreas: ['Mapwork', 'Climatology'],
		strengthAreas: ['Geomorphology'],
		trend: 'down',
	},
	{
		subject: 'History',
		averageScore: 82,
		questionsAnswered: 123,
		weakAreas: ['Cold War'],
		strengthAreas: [' colonialism', 'World Wars'],
		trend: 'up',
	},
];

const MOCK_ACTIVITY: DailyActivity[] = Array.from({ length: 7 }, (_, i) => {
	const date = new Date();
	date.setDate(date.getDate() - (6 - i));
	return {
		date: date.toLocaleDateString('en-US', { weekday: 'short' }),
		studyMinutes: Math.floor(Math.random() * 120) + 30,
		quizzesTaken: Math.floor(Math.random() * 5) + 1,
		flashcardsReviewed: Math.floor(Math.random() * 30) + 10,
		xpEarned: Math.floor(Math.random() * 500) + 100,
	};
});

const MOCK_ACHIEVEMENTS: Achievement[] = [
	{
		id: '1',
		name: 'First Steps',
		description: 'Complete your first quiz',
		icon: '🎯',
		unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
		progress: 100,
	},
	{
		id: '2',
		name: 'Week Warrior',
		description: 'Maintain a 7-day streak',
		icon: '🔥',
		unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
		progress: 100,
	},
	{
		id: '3',
		name: 'Perfect Score',
		description: 'Get 100% on a quiz',
		icon: '⭐',
		unlockedAt: null,
		progress: 75,
	},
	{
		id: '4',
		name: 'Memory Master',
		description: 'Review 500 flashcards',
		icon: '🧠',
		unlockedAt: null,
		progress: 91,
	},
	{
		id: '5',
		name: 'Early Bird',
		description: 'Study before 7 AM',
		icon: '🌅',
		unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
		progress: 100,
	},
	{
		id: '6',
		name: 'Night Owl',
		description: 'Study after 10 PM',
		icon: '🦉',
		unlockedAt: null,
		progress: 60,
	},
];

export default function AnalyticsDashboardPage() {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setTimeout(() => setIsLoading(false), 1000);
	}, []);

	const formatTime = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (hours > 0) return `${hours}h ${mins}m`;
		return `${mins}m`;
	};

	const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
		switch (trend) {
			case 'up':
				return <HugeiconsIcon icon={ArrowUp01Icon} className="w-4 h-4 text-green-500" />;
			case 'down':
				return <HugeiconsIcon icon={ArrowDown01Icon} className="w-4 h-4 text-red-500" />;
			default:
				return <HugeiconsIcon icon={CircleIcon} className="w-4 h-4 text-yellow-500" />;
		}
	};

	const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
		switch (trend) {
			case 'up':
				return 'text-green-500';
			case 'down':
				return 'text-red-500';
			default:
				return 'text-yellow-500';
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<HugeiconsIcon icon={Loading03Icon} className="w-8 h-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-7xl mx-auto">
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
						<HugeiconsIcon icon={Analytics01Icon} className="w-8 h-8" />
						Analytics
					</h1>
					<p className="text-muted-foreground">
						Track your learning progress and identify areas for improvement
					</p>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-primary/10">
									<HugeiconsIcon icon={Clock01Icon} className="w-5 h-5 text-primary" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Study Time</p>
									<p className="text-xl font-bold">{formatTime(MOCK_STATS.totalStudyTime)}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-green-500/10">
									<HugeiconsIcon icon={Target01Icon} className="w-5 h-5 text-green-500" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Accuracy</p>
									<p className="text-xl font-bold">
										{Math.round(
											(MOCK_STATS.correctAnswers / (MOCK_STATS.quizzesCompleted * 5)) * 100
										)}
										%
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-orange-500/10">
									<HugeiconsIcon icon={FireIcon} className="w-5 h-5 text-orange-500" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Streak</p>
									<p className="text-xl font-bold">{MOCK_STATS.streakDays} days</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-purple-500/10">
									<HugeiconsIcon icon={Medal01Icon} className="w-5 h-5 text-purple-500" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Level</p>
									<p className="text-xl font-bold">{MOCK_STATS.level}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<Tabs defaultValue="overview" className="space-y-4">
					<TabsList>
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="subjects">Subjects</TabsTrigger>
						<TabsTrigger value="activity">Activity</TabsTrigger>
						<TabsTrigger value="achievements">Achievements</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<HugeiconsIcon icon={ArrowUp01Icon} className="w-5 h-5" />
									Weekly Progress
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="h-[200px] flex items-end gap-2">
									{MOCK_ACTIVITY.map((day, idx) => (
										<div key={idx} className="flex-1 flex flex-col items-center gap-2">
											<div
												className="w-full bg-primary rounded-t"
												style={{ height: `${(day.studyMinutes / 150) * 100}%`, minHeight: '20px' }}
											/>
											<span className="text-xs text-muted-foreground">{day.date}</span>
										</div>
									))}
								</div>
								<div className="mt-4 flex justify-between text-sm text-muted-foreground">
									<span>
										Total: {formatTime(MOCK_ACTIVITY.reduce((a, b) => a + b.studyMinutes, 0))}
									</span>
									<span>
										Avg:{' '}
										{formatTime(
											Math.round(MOCK_ACTIVITY.reduce((a, b) => a + b.studyMinutes, 0) / 7)
										)}
										/day
									</span>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Level Progress</CardTitle>
								<CardDescription>
									{MOCK_STATS.xp} / {MOCK_STATS.xpToNextLevel} XP to Level {MOCK_STATS.level + 1}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Progress
									value={(MOCK_STATS.xp / MOCK_STATS.xpToNextLevel) * 100}
									className="h-3"
								/>
								<div className="mt-2 flex justify-between text-sm">
									<span className="text-muted-foreground">
										{MOCK_STATS.xpToNextLevel - MOCK_STATS.xp} XP remaining
									</span>
									<span className="font-medium">
										{Math.round((MOCK_STATS.xp / MOCK_STATS.xpToNextLevel) * 100)}%
									</span>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="subjects" className="space-y-4">
						<div className="grid md:grid-cols-2 gap-4">
							{MOCK_SUBJECTS.map((subject) => (
								<Card key={subject.subject}>
									<CardHeader className="pb-2">
										<div className="flex items-center justify-between">
											<CardTitle className="text-lg">{subject.subject}</CardTitle>
											<div className={getTrendColor(subject.trend)}>
												{getTrendIcon(subject.trend)}
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											<div>
												<div className="flex justify-between text-sm mb-1">
													<span>Average Score</span>
													<span className="font-medium">{subject.averageScore}%</span>
												</div>
												<Progress value={subject.averageScore} className="h-2" />
											</div>
											<div className="text-sm">
												<p className="text-muted-foreground">
													{subject.questionsAnswered} questions answered
												</p>
											</div>
											<div className="grid grid-cols-2 gap-3 text-sm">
												<div>
													<p className="text-muted-foreground">Strengths</p>
													<div className="flex flex-wrap gap-1 mt-1">
														{subject.strengthAreas.slice(0, 2).map((area) => (
															<Badge
																key={area}
																variant="outline"
																className="text-xs bg-green-500/10"
															>
																{area}
															</Badge>
														))}
													</div>
												</div>
												<div>
													<p className="text-muted-foreground">Needs Work</p>
													<div className="flex flex-wrap gap-1 mt-1">
														{subject.weakAreas.slice(0, 2).map((area) => (
															<Badge key={area} variant="outline" className="text-xs bg-red-500/10">
																{area}
															</Badge>
														))}
													</div>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>

					<TabsContent value="activity" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Daily Activity</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{MOCK_ACTIVITY.map((day, idx) => (
										<div
											key={idx}
											className="flex items-center justify-between p-3 rounded-lg border"
										>
											<div className="flex items-center gap-3">
												<div className="w-16 text-sm font-medium">{day.date}</div>
												<div className="text-sm text-muted-foreground">
													{formatTime(day.studyMinutes)} study time
												</div>
											</div>
											<div className="flex items-center gap-4 text-sm">
												<Badge variant="outline">{day.quizzesTaken} quizzes</Badge>
												<Badge variant="outline">{day.flashcardsReviewed} cards</Badge>
												<Badge className="bg-primary/10 text-primary">+{day.xpEarned} XP</Badge>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="achievements" className="space-y-4">
						<div className="grid md:grid-cols-3 gap-4">
							{MOCK_ACHIEVEMENTS.map((achievement) => (
								<Card key={achievement.id} className={achievement.unlockedAt ? '' : 'opacity-60'}>
									<CardContent className="p-4">
										<div className="flex items-start gap-3">
											<div className="text-3xl">{achievement.icon}</div>
											<div className="flex-1">
												<h4 className="font-medium">{achievement.name}</h4>
												<p className="text-sm text-muted-foreground">{achievement.description}</p>
												{!achievement.unlockedAt && (
													<div className="mt-2">
														<div className="flex justify-between text-xs mb-1">
															<span>Progress</span>
															<span>{achievement.progress}%</span>
														</div>
														<Progress value={achievement.progress} className="h-1" />
													</div>
												)}
												{achievement.unlockedAt && (
													<Badge className="mt-2 bg-green-500">Unlocked</Badge>
												)}
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
