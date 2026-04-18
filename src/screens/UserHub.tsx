'use client';

import { m } from 'framer-motion';
import { useId } from 'react';
import { HeroStatisticsCard, useAchievements } from '@/components/Achievements';
import { PageLayout } from '@/components/Layout/PageLayout';
import { AcademicStanding } from '@/components/Profile/AcademicStanding';
import AccountSettings from '@/components/Profile/AccountSettings';
import { AchievementBadges, AchievementProgress } from '@/components/Profile/AchievementBadges';
import DataExport from '@/components/Profile/DataExport';
import GamificationRewards from '@/components/Profile/GamificationRewards';
import LearningAnalytics from '@/components/Profile/LearningAnalytics';
import { PerformanceMatrix } from '@/components/Profile/PerformanceMatrix';
import { ProfileHeader } from '@/components/Profile/ProfileHeader';
import QuizHistory from '@/components/Profile/QuizHistory';
import SkillsWeaknessAnalysis from '@/components/Profile/SkillsWeaknessAnalysis';
import StudyGoalPlanner from '@/components/Profile/StudyGoalPlanner';
import { ProfileSkeleton } from '@/components/ProfileSkeleton';
import { Card } from '@/components/ui/card';
import type { ChartConfig } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfile } from '@/hooks/useProfile';
import { DURATION, EASING } from '@/lib/animation-presets';

const chartConfig = {
	you: {
		label: 'you',
		color: 'var(--primary)',
	},
	average: {
		label: 'average',
		color: 'var(--muted-foreground)',
	},
} satisfies ChartConfig;

export default function UserHub() {
	const {
		session,
		viewMode,
		setViewMode,
		isEditing,
		setIsEditing,
		editForm,
		setEditForm,
		userStats,
		isLoading,
		isSaving,
		chartData,
		handleSaveProfile,
	} = useProfile();

	const { masteryLevel, progress, unlockedCount, badgesToNext } = useAchievements();

	const radarGradientId = useId();

	if (isLoading) {
		return <ProfileSkeleton />;
	}

	return (
		<PageLayout>
			<ProfileHeader
				session={session}
				isEditing={isEditing}
				setIsEditing={setIsEditing}
				editForm={editForm}
				setEditForm={setEditForm}
				handleSaveProfile={handleSaveProfile}
				isSaving={isSaving}
			/>

			{/* Growth Overview - Integrated from Achievements */}
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: DURATION.normal, ease: EASING.easeOut }}
			>
				<HeroStatisticsCard
					masteryLevel={masteryLevel}
					progress={progress}
					unlockedCount={unlockedCount}
					badgesToNext={badgesToNext}
				/>
			</m.div>

			<div className="grid grid-cols-1 lg:grid-cols-12 pt-8 gap-8 lg:gap-12">
				{/* Left Column: Stats & Performance */}
				<div className="lg:col-span-7 space-y-8 lg:space-y-12">
					<PerformanceMatrix
						viewMode={viewMode}
						setViewMode={setViewMode}
						chartData={chartData}
						radarGradientId={radarGradientId}
						chartConfig={chartConfig}
					/>
					<StudyGoalPlanner userStats={userStats as any} />
				</div>

				{/* Right Column: Status */}
				<div className="lg:col-span-5 space-y-8">
					<AcademicStanding userStats={userStats} />
				</div>
			</div>

			{/* Unified Content Tabs */}
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4, duration: DURATION.normal, ease: EASING.easeOut }}
				className="mt-8 sm:mt-12"
			>
				<Tabs defaultValue="analytics" className="w-full">
					<TabsList className="flex w-full justify-start gap-2 bg-transparent h-auto p-0 mb-6 flex-wrap">
						<TabsTrigger
							value="analytics"
							className="data-[state=active]:bg-primary-violet/20 data-[state=active]:text-primary-violet px-4 py-2 rounded-full text-sm font-medium"
						>
							analytics
						</TabsTrigger>
						<TabsTrigger
							value="achievements"
							className="data-[state=active]:bg-primary-violet/20 data-[state=active]:text-primary-violet px-4 py-2 rounded-full text-sm font-medium"
						>
							achievements
						</TabsTrigger>
						<TabsTrigger
							value="quizzes"
							className="data-[state=active]:bg-primary-violet/20 data-[state=active]:text-primary-violet px-4 py-2 rounded-full text-sm font-medium"
						>
							quiz history
						</TabsTrigger>
						<TabsTrigger
							value="skills"
							className="data-[state=active]:bg-primary-violet/20 data-[state=active]:text-primary-violet px-4 py-2 rounded-full text-sm font-medium"
						>
							skills
						</TabsTrigger>
						<TabsTrigger
							value="rewards"
							className="data-[state=active]:bg-primary-violet/20 data-[state=active]:text-primary-violet px-4 py-2 rounded-full text-sm font-medium"
						>
							rewards
						</TabsTrigger>
						<TabsTrigger
							value="settings"
							className="data-[state=active]:bg-primary-violet/20 data-[state=active]:text-primary-violet px-4 py-2 rounded-full text-sm font-medium"
						>
							settings
						</TabsTrigger>
						<TabsTrigger
							value="export"
							className="data-[state=active]:bg-primary-violet/20 data-[state=active]:text-primary-violet px-4 py-2 rounded-full text-sm font-medium"
						>
							export
						</TabsTrigger>
					</TabsList>

					<TabsContent value="analytics" className="mt-0">
						<Card className="p-6 sm:p-8 rounded-[2rem] border-2 border-border/50 bg-card/50 backdrop-blur-sm">
							<LearningAnalytics userStats={userStats ?? undefined} studyStats={undefined} />
						</Card>
					</TabsContent>

					<TabsContent value="achievements" className="mt-0">
						<Card className="p-4 sm:p-8 rounded-[2rem] border-2 border-border/50 bg-card/50 backdrop-blur-sm space-y-8">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
								<h3 className="text-xl font-black text-foreground tracking-tighter">
									achievement collection
								</h3>
								<div className="w-full sm:w-72">
									<AchievementProgress unlockedIds={userStats?.unlockedAchievementIds || []} />
								</div>
							</div>
							<AchievementBadges unlockedIds={userStats?.unlockedAchievementIds || []} />
						</Card>
					</TabsContent>

					<TabsContent value="quizzes" className="mt-0">
						<Card className="p-6 sm:p-8 rounded-[2rem] border-2 border-border/50 bg-card/50 backdrop-blur-sm">
							<QuizHistory quizResults={[]} />
						</Card>
					</TabsContent>

					<TabsContent value="skills" className="mt-0">
						<Card className="p-6 sm:p-8 rounded-[2rem] border-2 border-border/50 bg-card/50 backdrop-blur-sm">
							<SkillsWeaknessAnalysis weakTopics={[]} subjectPerformance={[]} strongTopics={[]} />
						</Card>
					</TabsContent>

					<TabsContent value="rewards" className="mt-0">
						<Card className="p-6 sm:p-8 rounded-[2rem] border-2 border-border/50 bg-card/50 backdrop-blur-sm">
							<GamificationRewards
								userStats={userStats ?? undefined}
								xpBreakdown={{ quizXp: 0, achievementXp: 0 }}
							/>
						</Card>
					</TabsContent>

					<TabsContent value="settings" className="mt-0">
						<Card className="p-6 sm:p-8 rounded-[2rem] border-2 border-border/50 bg-card/50 backdrop-blur-sm">
							<AccountSettings session={session as any} />
						</Card>
					</TabsContent>

					<TabsContent value="export" className="mt-0">
						<Card className="p-6 sm:p-8 rounded-[2rem] border-2 border-border/50 bg-card/50 backdrop-blur-sm">
							<DataExport
								quizHistory={[]}
								userData={{
									name: session?.user?.name ?? '',
									email: session?.user?.email ?? '',
									joinedDate: session?.user?.createdAt?.toString() ?? '',
								}}
								quizStats={{ totalQuizzes: 0, averageScore: 0, bestScore: 0, totalTime: 0 }}
								achievements={{ totalUnlocked: 0, badges: [] }}
								subjects={[]}
							/>
						</Card>
					</TabsContent>
				</Tabs>
			</m.div>
		</PageLayout>
	);
}
