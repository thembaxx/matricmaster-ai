'use client';

import { m } from 'framer-motion';
import { useId } from 'react';
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
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Card } from '@/components/ui/card';
import type { ChartConfig } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfile } from '@/hooks/useProfile';

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

export default function Profile() {
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
	const radarGradientId = useId();

	if (isLoading) {
		return <ProfileSkeleton />;
	}

	return (
		<div className="flex flex-col min-h-[calc(100vh-4rem)] min-w-0 bg-background pb-32 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
			<BackgroundMesh variant="subtle" />

			<main className="max-w-6xl mx-auto w-full pt-6 sm:pt-8 space-y-8 sm:space-y-12 relative z-10">
				<ProfileHeader
					session={session}
					isEditing={isEditing}
					setIsEditing={setIsEditing}
					editForm={editForm}
					setEditForm={setEditForm}
					handleSaveProfile={handleSaveProfile}
					isSaving={isSaving}
				/>

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

					{/* Right Column: Cards */}
					<div className="lg:col-span-5 space-y-8">
						<AcademicStanding userStats={userStats} />
					</div>
				</div>

				{/* Achievement Badges Section */}
				{userStats && (
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="mt-8 sm:mt-12"
					>
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
							<h3 className="text-xl font-black text-foreground tracking-tighter">
								achievement collection
							</h3>
							<div className="w-full sm:w-72">
								<AchievementProgress unlockedIds={userStats.unlockedAchievementIds} />
							</div>
						</div>
						<Card className="p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-border/50 bg-card/50 backdrop-blur-sm">
							<AchievementBadges unlockedIds={userStats.unlockedAchievementIds} />
						</Card>
					</m.div>
				)}

				{/* Profile Features Tabs */}
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="mt-8 sm:mt-12"
				>
					<Tabs defaultValue="analytics" className="w-full">
						<TabsList className="flex w-full justify-start gap-2 bg-transparent h-auto p-0 mb-6 flex-wrap">
							<TabsTrigger
								value="analytics"
								className="data-[state=active]:bg-primary-violet/20 data-[state=active]:text-primary-violet px-4 py-2 rounded-full text-sm font-medium"
							>
								learning analytics
							</TabsTrigger>
							<TabsTrigger
								value="quizzes"
								className="data-[state=active]:bg-primary-violet/20 data-[state=active]:text-primary-violet px-4 py-2 rounded-full text-sm font-medium"
							>
								quiz history
							</TabsTrigger>
							<TabsTrigger
								value="goals"
								className="data-[state=active]:bg-primary-violet/20 data-[state=active]:text-primary-violet px-4 py-2 rounded-full text-sm font-medium"
							>
								study goals
							</TabsTrigger>
							<TabsTrigger
								value="skills"
								className="data-[state=active]:bg-primary-violet/20 data-[state=active]:text-primary-violet px-4 py-2 rounded-full text-sm font-medium"
							>
								skills analysis
							</TabsTrigger>
							<TabsTrigger
								value="rewards"
								className="data-[state=active]:bg-primary-violet/20 data-[state=active]:text-primary-violet px-4 py-2 rounded-full text-sm font-medium"
							>
								x p & levels
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
								export data
							</TabsTrigger>
						</TabsList>

						<TabsContent value="analytics" className="mt-0">
							<Card className="p-6 sm:p-8 rounded-[2rem] border-2 border-border/50 bg-card/50 backdrop-blur-sm">
								<LearningAnalytics userStats={userStats ?? undefined} studyStats={undefined} />
							</Card>
						</TabsContent>

						<TabsContent value="quizzes" className="mt-0">
							<Card className="p-6 sm:p-8 rounded-[2rem] border-2 border-border/50 bg-card/50 backdrop-blur-sm">
								<QuizHistory quizResults={[]} />
							</Card>
						</TabsContent>

						<TabsContent value="goals" className="mt-0">
							<Card className="p-6 sm:p-8 rounded-[2rem] border-2 border-border/50 bg-card/50 backdrop-blur-sm">
								<StudyGoalPlanner userStats={userStats as any} />
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
			</main>
		</div>
	);
}
