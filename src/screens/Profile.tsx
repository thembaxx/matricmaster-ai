'use client';

import { m } from 'framer-motion';
import { useId } from 'react';
import { AcademicStanding } from '@/components/Profile/AcademicStanding';
import { AchievementBadges, AchievementProgress } from '@/components/Profile/AchievementBadges';
import { PerformanceMatrix } from '@/components/Profile/PerformanceMatrix';
import { ProfileHeader } from '@/components/Profile/ProfileHeader';
import { ProfileSkeleton } from '@/components/ProfileSkeleton';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Card } from '@/components/ui/card';
import type { ChartConfig } from '@/components/ui/chart';
import { useProfile } from '@/hooks/useProfile';

const chartConfig = {
	you: {
		label: 'You',
		color: 'var(--primary)',
	},
	average: {
		label: 'Average',
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
		chartData,
		handleSaveProfile,
	} = useProfile();
	const radarGradientId = useId();

	if (isLoading) {
		return <ProfileSkeleton />;
	}

	return (
		<div className="flex flex-col h-full min-w-0 bg-background pb-32 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
			<BackgroundMesh variant="subtle" />

			<main className="max-w-6xl mx-auto w-full pt-6 sm:pt-8 space-y-8 sm:space-y-12 relative z-10">
				<ProfileHeader
					session={session}
					isEditing={isEditing}
					setIsEditing={setIsEditing}
					editForm={editForm}
					setEditForm={setEditForm}
					handleSaveProfile={handleSaveProfile}
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
							<h3 className="text-xl font-black text-foreground tracking-tighter uppercase">
								Achievement Collection
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
			</main>
		</div>
	);
}
