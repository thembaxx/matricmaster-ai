'use client';

import { m } from 'framer-motion';
import {
	BadgesGridSection,
	CategoryNav,
	HeroStatisticsCard,
	useAchievements,
} from '@/components/Achievements';
import { AchievementsSkeleton } from '@/components/AchievementsSkeleton';

export default function Achievements() {
	const {
		activeTab,
		setActiveTab,
		isLoading,
		filteredBadges,
		unlockedCount,
		progress,
		masteryLevel,
		badgesToNext,
		categories,
	} = useAchievements();

	if (isLoading) {
		return <AchievementsSkeleton />;
	}

	return (
		<div className="flex flex-col h-full min-w-0 bg-background p-4 sm:pb-32 lg:px-8 overflow-x-hidden">
			<main className="max-w-6xl mx-auto w-full pt-8 sm:pt-12 space-y-8 sm:space-y-12">
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<HeroStatisticsCard
						masteryLevel={masteryLevel}
						progress={progress}
						unlockedCount={unlockedCount}
						badgesToNext={badgesToNext}
					/>
				</m.div>

				<CategoryNav categories={categories} activeTab={activeTab} onTabChange={setActiveTab} />

				<BadgesGridSection filteredBadges={filteredBadges} />
			</main>
		</div>
	);
}
