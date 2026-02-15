'use client';

import { Lock, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserAchievements } from '@/lib/db/achievement-actions';
import { ACHIEVEMENTS } from '@/constants/achievements';

interface Badge {
	id: string;
	name: string;
	icon: string | null;
	iconBg: string;
	unlocked: boolean;
	category: 'all' | 'science' | 'math' | 'history' | 'streak';
	description?: string;
}

export default function Achievements() {
	const [activeTab, setActiveTab] = useState('all');
	const [badges, setBadges] = useState<Badge[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchAchievements() {
			try {
				const result = await getUserAchievements();
				const unlockedIds = new Set(result.unlocked.map((a) => a.achievementId));
				
				const mappedBadges: Badge[] = ACHIEVEMENTS.map((achievement) => {
					const unlocked = unlockedIds.has(achievement.id);
					const unlockedRecord = result.unlocked.find((a) => a.achievementId === achievement.id);
					
					return {
						id: achievement.id,
						name: unlocked ? unlockedRecord?.title || achievement.name : achievement.name,
						icon: unlocked ? achievement.icon : null,
						iconBg: unlocked ? achievement.iconBg : 'transparent',
						unlocked,
						category: achievement.category,
						description: achievement.description,
					};
				});
				
				setBadges(mappedBadges);
			} catch (error) {
				console.error('Error fetching achievements:', error);
				setBadges(
					ACHIEVEMENTS.map((a) => ({
						id: a.id,
						name: a.name,
						icon: null,
						iconBg: 'transparent',
						unlocked: false,
						category: a.category,
						description: a.description,
					}))
				);
			} finally {
				setIsLoading(false);
			}
		}
		
		fetchAchievements();
	}, []);

	const filteredBadges = activeTab === 'all' 
		? badges 
		: badges.filter((b) => b.category === activeTab || b.category === 'all');

	const unlockedCount = badges.filter((b) => b.unlocked).length;
	const totalBadges = ACHIEVEMENTS.length;
	const progress = totalBadges > 0 ? (unlockedCount / totalBadges) * 100 : 0;
	const masteryLevel = Math.floor(unlockedCount / 10) + 1;
	const nextMilestone = Math.ceil(unlockedCount / 10) * 10;
	const badgesToNext = nextMilestone - unlockedCount;

	const categories = [
		{ id: 'all', label: 'All Badges' },
		{ id: 'science', label: 'Science' },
		{ id: 'math', label: 'Math' },
		{ id: 'streak', label: 'Streaks' },
	];

	if (isLoading) {
		return (
			<div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0a0f18]">
				<div className="flex-1 flex items-center justify-center">
					<div className="animate-pulse flex flex-col items-center gap-4">
						<div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
						<div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0a0f18]">
			<div className="flex-1">
				<main className="px-4 pb-32">
					<div>
						<div
							className="rounded-3xl p-6 mb-6 relative overflow-hidden"
							style={{
								background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
							}}
						>
							<div className="absolute top-4 right-4">
								<div
									className="w-14 h-14 rounded-full flex items-center justify-center"
									style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
								>
									<Trophy className="w-7 h-7 text-white" />
								</div>
							</div>
							<div className="space-y-4">
								<div>
									<p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
										Mastery Level
									</p>
									<h2 className="text-4xl font-bold text-white">Level {masteryLevel}</h2>
								</div>
								<div className="flex items-center justify-between">
									<p className="text-white text-lg">
										<span className="font-bold">{unlockedCount}</span>
										<span style={{ color: 'rgba(255, 255, 255, 0.7)' }}> / {totalBadges} Badges</span>
									</p>
									<span className="text-white font-bold text-lg">{Math.round(progress)}%</span>
								</div>
								<div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
									<div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: '#ffffff' }} />
								</div>
								<p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
									{badgesToNext > 0 ? `Keep it up! ${badgesToNext} more to unlock next level.` : 'Amazing! Level up!'}
								</p>
							</div>
						</div>
					</div>

					<div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
						{categories.map((category) => (
							<button
								key={category.id}
								type="button"
								onClick={() => setActiveTab(category.id)}
								className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
									activeTab === category.id ? 'bg-blue-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
								}`}
							>
								{category.label}
							</button>
						))}
					</div>

					{filteredBadges.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-zinc-500 dark:text-zinc-400">No achievements in this category yet.</p>
						</div>
					) : (
						<div className="grid grid-cols-3 gap-4">
							{filteredBadges.map((badge) => (
								<div key={badge.id} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900">
									<div
										className={`w-20 h-20 rounded-full flex items-center justify-center relative ${badge.unlocked ? '' : 'opacity-50'}`}
										style={{
											backgroundColor: badge.unlocked ? badge.iconBg : '',
											border: badge.unlocked ? 'none' : '2px dashed rgb(209, 213, 219)',
										}}
									>
										{badge.unlocked ? (
											badge.icon ? <span className="text-3xl">{badge.icon}</span> : <Trophy className="w-8 h-8 text-blue-500" />
										) : (
											<Lock className="w-6 h-6 text-gray-400 dark:text-gray-500" />
										)}
									</div>
									<div className="text-center">
										<p className={`text-sm font-medium ${badge.unlocked ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}`}>
											{badge.name}
										</p>
										<p className={`text-xs font-medium uppercase tracking-wide ${badge.unlocked ? 'text-blue-500 dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
											{badge.unlocked ? 'UNLOCKED' : 'LOCKED'}
										</p>
									</div>
								</div>
							))}
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
