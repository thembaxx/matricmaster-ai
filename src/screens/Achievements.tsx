'use client';

import { m } from 'framer-motion';
import { startTransition, useState, ViewTransition } from 'react';
import {
	BadgesGridSection,
	CategoryNav,
	HeroStatisticsCard,
	useAchievements,
} from '@/components/Achievements';
import { AchievementsSkeleton } from '@/components/AchievementsSkeleton';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth-client';

export default function Achievements() {
	const { data: session } = useSession();
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

	const [showShareModal, setShowShareModal] = useState(false);
	const [recentlyUnlocked] = useState<string[]>([]);

	const handleTabChange = (tab: string) => {
		startTransition(() => {
			setActiveTab(tab);
		});
	};

	const handleShareAll = async () => {
		setShowShareModal(false);
		if (!navigator.share) {
			await navigator.clipboard.writeText(
				`I have ${unlockedCount} achievements on Lumni AI! 🎓 Join me in preparing for my NSC exams!`
			);
			return;
		}

		try {
			await navigator.share({
				title: 'My Achievements on Lumni AI',
				text: `I've earned ${unlockedCount} achievements while preparing for my NSC exams! 🎓 Join me on Lumni AI!`,
				url: `${window.location.origin}/achievements`,
			});
		} catch {
			// User cancelled or error
		}
	};

	if (isLoading) {
		return <AchievementsSkeleton />;
	}

	return (
		<div className="flex flex-col h-full min-w-0 bg-background p-4 sm:pb-32 lg:px-8 overflow-x-hidden">
			<main className="max-w-6xl mx-auto w-full pt-8 sm:pt-12 space-y-8 sm:space-y-12">
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: DURATION.normal }}
				>
					<HeroStatisticsCard
						masteryLevel={masteryLevel}
						progress={progress}
						unlockedCount={unlockedCount}
						badgesToNext={badgesToNext}
					/>
				</m.div>

				<div className="flex items-center justify-between">
					<CategoryNav
						categories={categories}
						activeTab={activeTab}
						onTabChange={handleTabChange}
					/>

					{session?.user && (
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowShareModal(true)}
								className="hidden sm:flex"
							>
								Share Achievements
							</Button>
						</div>
					)}
				</div>

				<ViewTransition enter="fade-in" exit="fade-out" default="none">
					<BadgesGridSection filteredBadges={filteredBadges} />
				</ViewTransition>

				{recentlyUnlocked.length > 0 && (
					<div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-3 rounded-full shadow-lg animate-[pulse_2s_ease-in-out_infinite]">
						<p className="font-medium">Unlocked: {recentlyUnlocked[recentlyUnlocked.length - 1]}</p>
					</div>
				)}

				{showShareModal && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
						<div className="bg-background rounded-xl p-6 max-w-sm w-full shadow-xl">
							<h3 className="text-lg font-semibold mb-4">Share Your Achievements</h3>
							<p className="text-sm text-muted-foreground mb-4">
								Share your progress with friends and inspire them to study!
							</p>
							<div className="space-y-3">
								<Button className="w-full" onClick={handleShareAll}>
									Share All Achievements
								</Button>
								<Button
									variant="outline"
									className="w-full"
									onClick={() => setShowShareModal(false)}
								>
									Cancel
								</Button>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
