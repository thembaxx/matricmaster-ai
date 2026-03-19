'use client';

import { Analytics01Icon, Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { AchievementGrid } from '@/components/Analytics/AchievementGrid';
import {
	MOCK_ACHIEVEMENTS,
	MOCK_ACTIVITY,
	MOCK_STATS,
	MOCK_SUBJECTS,
} from '@/components/Analytics/constants';
import { DailyActivityList } from '@/components/Analytics/DailyActivityList';
import { LevelProgressCard } from '@/components/Analytics/LevelProgressCard';
import { StatsOverview } from '@/components/Analytics/StatsOverview';
import { SubjectPerformanceCard } from '@/components/Analytics/SubjectPerformanceCard';
import { WeeklyProgressChart } from '@/components/Analytics/WeeklyProgressChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AnalyticsDashboardPage() {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setTimeout(() => setIsLoading(false), 1000);
	}, []);

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

				<StatsOverview stats={MOCK_STATS} />

				<Tabs defaultValue="overview" className="space-y-4">
					<TabsList>
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="subjects">Subjects</TabsTrigger>
						<TabsTrigger value="activity">Activity</TabsTrigger>
						<TabsTrigger value="achievements">Achievements</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-4">
						<WeeklyProgressChart activity={MOCK_ACTIVITY} />
						<LevelProgressCard stats={MOCK_STATS} />
					</TabsContent>

					<TabsContent value="subjects" className="space-y-4">
						<div className="grid md:grid-cols-2 gap-4">
							{MOCK_SUBJECTS.map((subject) => (
								<SubjectPerformanceCard key={subject.subject} subject={subject} />
							))}
						</div>
					</TabsContent>

					<TabsContent value="activity" className="space-y-4">
						<DailyActivityList activity={MOCK_ACTIVITY} />
					</TabsContent>

					<TabsContent value="achievements" className="space-y-4">
						<AchievementGrid achievements={MOCK_ACHIEVEMENTS} />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
