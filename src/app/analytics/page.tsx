'use client';

import { Analytics01Icon, Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { AchievementGrid } from '@/components/Analytics/AchievementGrid';
import {
	type Achievement,
	type DailyActivity,
	MOCK_ACHIEVEMENTS,
	MOCK_ACTIVITY,
	MOCK_STATS,
	MOCK_SUBJECTS,
	type StudyStats,
	type SubjectPerformance,
} from '@/components/Analytics/constants';
import { DailyActivityList } from '@/components/Analytics/DailyActivityList';
import { LevelProgressCard } from '@/components/Analytics/LevelProgressCard';
import { StatsOverview } from '@/components/Analytics/StatsOverview';
import { SubjectPerformanceCard } from '@/components/Analytics/SubjectPerformanceCard';
import { WeeklyProgressChart } from '@/components/Analytics/WeeklyProgressChart';
import { GrowthInsights } from '@/components/Dashboard/GrowthInsights';
import { GrowthMap } from '@/components/Dashboard/GrowthMap';
import { WeeklyProgressExport } from '@/components/Progress/WeeklyProgressExport';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
	GlobalProgress,
	StudyStats as ServiceStudyStats,
	WeakTopic,
} from '@/services/progressService';

interface AnalyticsApiResponse {
	success: boolean;
	hasRealData: boolean;
	globalProgress: GlobalProgress | null;
	studyStats: ServiceStudyStats | null;
	weakTopics: WeakTopic[];
	achievements?: Achievement[];
}

function computeLevel(marksEarned: number) {
	const xpPerLevel = 5000;
	const level = Math.max(1, Math.floor(marksEarned / xpPerLevel) + 1);
	const xp = marksEarned % xpPerLevel;
	return { level, xp, xpToNextLevel: xpPerLevel };
}

function transformToStudyStats(
	globalProgress: GlobalProgress | null,
	studyStats: ServiceStudyStats | null
): StudyStats {
	const marksEarned = globalProgress?.totalMarksEarned || 0;
	const { level, xp, xpToNextLevel } = computeLevel(marksEarned);

	return {
		totalStudyTime: studyStats?.totalStudyTimeMinutes || globalProgress?.totalStudyTimeMinutes || 0,
		quizzesCompleted: globalProgress?.totalSessions || 0,
		correctAnswers: globalProgress?.totalCorrect || 0,
		flashcardsReviewed: studyStats?.totalFlashcardsReviewed || 0,
		streakDays: globalProgress?.streakDays || studyStats?.streakDays || 0,
		level,
		xp,
		xpToNextLevel,
	};
}

function transformToSubjects(
	globalProgress: GlobalProgress | null,
	weakTopics: WeakTopic[]
): SubjectPerformance[] {
	if (!globalProgress?.subjectProgress || globalProgress.subjectProgress.length === 0) {
		return MOCK_SUBJECTS;
	}

	const weakTopicMap = new Map<string, WeakTopic[]>();
	for (const wt of weakTopics) {
		const existing = weakTopicMap.get(wt.subjectName) || [];
		existing.push(wt);
		weakTopicMap.set(wt.subjectName, existing);
	}

	return globalProgress.subjectProgress.map((sp) => {
		const accuracy =
			sp.questionsAttempted > 0
				? Math.round((sp.questionsCorrect / sp.questionsAttempted) * 100)
				: 0;

		const subjectWeakTopics = weakTopicMap.get(sp.subjectName) || [];
		const weakAreas = subjectWeakTopics.map((wt) => wt.topic);
		const strongTopics = subjectWeakTopics
			.filter((wt) => wt.masteryLevel >= 70)
			.map((wt) => wt.topic);

		let trend: 'up' | 'down' | 'stable' = 'stable';
		if (accuracy >= 75) trend = 'up';
		else if (accuracy < 55) trend = 'down';

		return {
			subject: sp.subjectName || `Subject ${sp.subjectId}`,
			averageScore: accuracy,
			questionsAnswered: sp.questionsAttempted,
			weakAreas: weakAreas.length > 0 ? weakAreas : ['—'],
			strengthAreas: strongTopics.length > 0 ? strongTopics : ['—'],
			trend,
		};
	});
}

function transformToActivity(globalProgress: GlobalProgress | null): DailyActivity[] {
	if (!globalProgress?.recentSessions || globalProgress.recentSessions.length === 0) {
		return MOCK_ACTIVITY;
	}

	const dayMap = new Map<string, DailyActivity>();
	for (let i = 6; i >= 0; i--) {
		const date = new Date();
		date.setDate(date.getDate() - i);
		const key = date.toISOString().split('T')[0];
		dayMap.set(key, {
			date: date.toLocaleDateString('en-US', { weekday: 'short' }),
			studyMinutes: 0,
			quizzesTaken: 0,
			flashcardsReviewed: 0,
			xpEarned: 0,
		});
	}

	for (const session of globalProgress.recentSessions) {
		if (!session.startedAt) continue;
		const key = new Date(session.startedAt).toISOString().split('T')[0];
		const entry = dayMap.get(key);
		if (entry) {
			entry.studyMinutes += session.durationMinutes || 0;
			if (session.sessionType === 'quiz') entry.quizzesTaken += 1;
			if (session.sessionType === 'flashcard') entry.flashcardsReviewed += 1;
			entry.xpEarned += session.marksEarned || 0;
		}
	}

	const result = Array.from(dayMap.values());
	const hasActivity = result.some((d) => d.studyMinutes > 0 || d.xpEarned > 0);
	return hasActivity ? result : MOCK_ACTIVITY;
}

export default function AnalyticsDashboardPage() {
	const [isLoading, setIsLoading] = useState(true);
	const [isMock, setIsMock] = useState(false);
	const [stats, setStats] = useState<StudyStats>(MOCK_STATS);
	const [subjects, setSubjects] = useState<SubjectPerformance[]>(MOCK_SUBJECTS);
	const [activity, setActivity] = useState<DailyActivity[]>(MOCK_ACTIVITY);
	const [achievements, setAchievements] = useState<Achievement[]>(MOCK_ACHIEVEMENTS);
	const [growthData, setGrowthData] = useState<{
		topics: {
			topic: string;
			mistakes: number;
			subject: string;
			confidence: number | null;
			trend: 'up' | 'down' | 'stable';
			struggleCount: number;
		}[];
		insights: string[];
	}>({ topics: [], insights: [] });

	useEffect(() => {
		let cancelled = false;

		async function loadAnalytics() {
			try {
				const [analyticsRes, growthRes] = await Promise.all([
					fetch('/api/progress/analytics'),
					fetch('/api/growth-map'),
				]);

				if (!analyticsRes.ok) {
					throw new Error('Failed to fetch analytics');
				}

				const [data, growthMapData] = await Promise.all([
					analyticsRes.json() as Promise<AnalyticsApiResponse>,
					growthRes.ok
						? (growthRes.json() as Promise<{
								topics: typeof growthData.topics;
								insights: string[];
							}>)
						: Promise.resolve({ topics: [], insights: [] }),
				]);

				if (cancelled) return;

				setGrowthData(growthMapData ?? { topics: [], insights: [] });

				if (!data.hasRealData || !data.success) {
					setIsMock(true);
					setIsLoading(false);
					return;
				}

				const realStats = transformToStudyStats(data.globalProgress, data.studyStats);
				const realSubjects = transformToSubjects(data.globalProgress, data.weakTopics);
				const realActivity = transformToActivity(data.globalProgress);

				const statsHasData = realStats.totalStudyTime > 0 || realStats.correctAnswers > 0;
				const subjectsIsMock = realSubjects === MOCK_SUBJECTS;
				const activityIsMock = realActivity === MOCK_ACTIVITY;

				setStats(realStats);
				setSubjects(realSubjects);
				setActivity(realActivity);
				if (data.achievements && data.achievements.length > 0) {
					setAchievements(data.achievements);
				}
				setIsMock(!statsHasData && subjectsIsMock && activityIsMock);
			} catch {
				if (cancelled) return;
				setIsMock(true);
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		const timer = setTimeout(() => {
			loadAnalytics();
		}, 300);

		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, []);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<HugeiconsIcon icon={Loading03Icon} className="w-8 h-8 animate-spin text-primary" />
			</div>
		);
	}

	if (isMock) {
		return (
			<div className="min-h-screen flex items-center justify-center p-6">
				<div className="max-w-md text-center space-y-6">
					<div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
						<HugeiconsIcon icon={Analytics01Icon} className="w-8 h-8 text-muted-foreground" />
					</div>
					<div className="space-y-2">
						<h2 className="text-2xl font-bold text-foreground">No analytics data yet</h2>
						<p className="text-sm text-muted-foreground">
							Start studying to see your progress, streaks, and performance insights.
						</p>
					</div>
					<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
						<a href="/quiz">
							<Badge variant="outline" className="cursor-pointer">
								Take a Quiz
							</Badge>
						</a>
						<a href="/flashcards">
							<Badge variant="outline" className="cursor-pointer">
								Review flashcards
							</Badge>
						</a>
						<a href="/ai-tutor">
							<Badge variant="outline" className="cursor-pointer">
								Start AI tutor session
							</Badge>
						</a>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-7xl mx-auto">
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-2">
						<h1 className="text-3xl font-bold flex items-center gap-2">
							<HugeiconsIcon icon={Analytics01Icon} className="w-8 h-8" />
							Analytics
						</h1>
					</div>
					<p className="text-muted-foreground">
						Track your learning progress and identify areas for improvement
					</p>
				</div>

				<StatsOverview stats={stats} />

				<WeeklyProgressExport />

				<Tabs defaultValue="overview" className="space-y-4">
					<TabsList>
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="growth">Growth</TabsTrigger>
						<TabsTrigger value="subjects">Subjects</TabsTrigger>
						<TabsTrigger value="activity">Activity</TabsTrigger>
						<TabsTrigger value="achievements">Achievements</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-4">
						<WeeklyProgressChart activity={activity} />
						<LevelProgressCard stats={stats} />
					</TabsContent>

					<TabsContent value="growth" className="space-y-4">
						<div className="grid md:grid-cols-2 gap-4">
							<div className="tiimo-card p-6 md:col-span-2">
								<h3 className="heading-4 mb-1 text-balance">Growth Map</h3>
								<p className="text-sm text-muted-foreground mb-4">
									Topics where you need the most practice
								</p>
								<GrowthMap data={growthData.topics} />
							</div>
							{growthData.insights.length > 0 && (
								<GrowthInsights
									insights={growthData.insights}
									weakTopics={growthData.topics.slice(0, 3)}
								/>
							)}
						</div>
					</TabsContent>

					<TabsContent value="subjects" className="space-y-4">
						<div className="grid md:grid-cols-2 gap-4">
							{subjects.map((subject) => (
								<SubjectPerformanceCard key={subject.subject} subject={subject} />
							))}
						</div>
					</TabsContent>

					<TabsContent value="activity" className="space-y-4">
						<DailyActivityList activity={activity} />
					</TabsContent>

					<TabsContent value="achievements" className="space-y-4">
						<AchievementGrid achievements={achievements} />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
