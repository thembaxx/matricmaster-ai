'use client';

import { FireIcon as Fire, Lightning01Icon as Lightning, Lock01Icon as Lock, MedalIcon as Medal, StarIcon as Star, Trophy01Icon as Trophy, ZapIcon as Zap } from 'hugeicons-react';
import { AnimatePresence, m } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ACHIEVEMENTS } from '@/constants/achievements';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { getUserAchievements } from '@/lib/db/achievement-actions';

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

	const filteredBadges =
		activeTab === 'all'
			? badges
			: badges.filter((b) => b.category === activeTab || b.category === 'all');

	const unlockedCount = badges.filter((b) => b.unlocked).length;
	const totalBadges = ACHIEVEMENTS.length;
	const progress = totalBadges > 0 ? (unlockedCount / totalBadges) * 100 : 0;
	const masteryLevel = Math.floor(unlockedCount / 10) + 1;
	const nextMilestone = Math.ceil((unlockedCount + 1) / 10) * 10;
	const badgesToNext = nextMilestone - unlockedCount;

	const categories = [
		{ id: 'all', label: 'All Badges', icon: Star },
		{ id: 'science', label: 'Science', icon: Lightning },
		{ id: 'math', label: 'Math', icon: Medal },
		{ id: 'streak', label: 'Streaks', icon: Fire },
	];

	if (isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center py-40">
				<div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full min-w-0 bg-white dark:bg-zinc-950 pb-40 px-6 sm:px-10 lg:px-12 overflow-x-hidden">
			<main className="max-w-7xl mx-auto w-full pt-16 sm:pt-24 space-y-16 sm:space-y-24">
				{/* Hero Statistics Card */}
				<m.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ type: 'spring', damping: 25 }}
				>
					<Card className="rounded-[4rem] p-10 sm:p-16 relative overflow-hidden bg-primary text-white border-none shadow-[0_40px_100px_rgba(0,0,0,0.15)]">
						<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />
						<div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-tiimo-purple/20 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />

						<div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
							<div className="space-y-10">
								<div className="space-y-3">
									<div className="flex items-center gap-3">
										<Zap size={24} className="text-white fill-white/20 stroke-[3px]" />
										<p className="text-xs font-black uppercase tracking-[0.3em] opacity-60">
											Personal mastery
										</p>
									</div>
									<h2 className="text-6xl sm:text-7xl lg:text-9xl font-black tracking-tighter uppercase leading-none">
										Lvl {masteryLevel}
									</h2>
								</div>

								<div className="space-y-6">
									<div className="flex items-end justify-between px-1">
										<span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Progress to next milestone</span>
										<span className="text-4xl font-black">{Math.round(progress)}%</span>
									</div>
									<div className="h-6 w-full bg-white/10 rounded-full overflow-hidden p-1.5 shadow-inner">
										<m.div
											initial={{ width: 0 }}
											animate={{ width: `${progress}%` }}
											transition={{ duration: 1.5, type: 'spring' }}
											className="h-full bg-white rounded-full shadow-lg"
										/>
									</div>
									<p className="text-lg font-bold opacity-60 leading-relaxed max-w-sm">
										{badgesToNext > 0
											? `You need ${badgesToNext} more badges to reach Level ${masteryLevel + 1} and unlock elite rewards.`
											: 'Ultimate peak reached. You are a true Matric master!'}
									</p>
								</div>
							</div>

							<div className="flex justify-center md:justify-end">
								<div className="relative group">
									<m.div
										animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
										transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
										className="w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 rounded-[3rem] sm:rounded-[4rem] bg-white/10 backdrop-blur-3xl flex items-center justify-center border-8 border-white/20 shadow-2xl relative z-10 group-hover:scale-105 transition-transform duration-700"
									>
										<Trophy
											size={120}
											className="text-white drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)] stroke-[2.5px]"
										/>
									</m.div>
									<div className="absolute -bottom-8 -right-8 w-24 h-24 sm:w-32 sm:h-32 bg-tiimo-orange text-white rounded-[1.75rem] sm:rounded-[2.5rem] flex flex-col items-center justify-center shadow-2xl border-8 border-white dark:border-zinc-950 z-20 transition-transform group-hover:scale-110">
										<span className="text-3xl sm:text-5xl font-black">
											{unlockedCount}
										</span>
										<span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-60">Badges</span>
									</div>
								</div>
							</div>
						</div>
					</Card>
				</m.div>

				{/* Category Navigation */}
				<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
					<div className="space-y-1">
						<h3 className="text-4xl font-black text-foreground tracking-tight leading-none">Vault</h3>
						<p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">Browse your milestones</p>
					</div>
					<div className="flex gap-3 p-2 bg-muted/10 rounded-[2rem] max-w-fit overflow-x-auto no-scrollbar">
						{categories.map((category) => {
							const Icon = category.icon;
							const isActive = activeTab === category.id;
							return (
								<button
									key={category.id}
									type="button"
									onClick={() => setActiveTab(category.id)}
									className={cn(
										"flex items-center gap-3 px-6 h-14 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap",
										isActive
											? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105'
											: 'text-muted-foreground/40 hover:bg-muted/20'
									)}
								>
									<Icon size={20} className={cn("stroke-[3px]", isActive ? 'scale-110' : '')} />
									<span>{category.label}</span>
								</button>
							);
						})}
					</div>
				</div>

				{/* Badges Grid */}
				<AnimatePresence mode="wait">
					{filteredBadges.length === 0 ? (
						<m.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 20 }}
							className="text-center py-40 space-y-8"
						>
							<div className="w-32 h-32 bg-muted/10 rounded-[3rem] flex items-center justify-center mx-auto">
								<Lock size={48} className="text-muted-foreground/20 stroke-[3px]" />
							</div>
							<p className="text-2xl font-black text-muted-foreground/30 uppercase tracking-widest">No matching badges</p>
						</m.div>
					) : (
						<m.div
							variants={STAGGER_CONTAINER}
							initial="hidden"
							animate="visible"
							className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 sm:gap-10"
						>
							{filteredBadges.map((badge) => (
								<m.div key={badge.id} variants={STAGGER_ITEM}>
									<Card
										className={cn(
											"group relative h-full flex flex-col items-center gap-8 p-10 rounded-[3.5rem] border-none transition-all duration-700",
											badge.unlocked
												? 'bg-card shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] hover:-translate-y-3'
												: 'bg-muted/10 opacity-40 grayscale pointer-events-none'
										)}
									>
										<div
											className="w-28 h-28 lg:w-36 lg:h-36 rounded-[2rem] flex items-center justify-center relative transition-all duration-700 shadow-xl group-hover:scale-110 group-hover:rotate-12"
											style={{
												backgroundColor: badge.unlocked ? badge.iconBg : 'transparent',
											}}
										>
											{badge.unlocked ? (
												badge.icon ? (
													<span aria-hidden="true" className="text-6xl filter drop-shadow-lg">
														{badge.icon}
													</span>
												) : (
													<Trophy size={48} className="text-white fill-white/20 stroke-[3px]" />
												)
											) : (
												<Lock size={40} className="text-muted-foreground/20 stroke-[3px]" />
											)}
										</div>

										<div className="text-center space-y-3">
											<h3 className="text-xl font-black tracking-tight leading-none text-foreground">
												{badge.name}
											</h3>
											<div className={cn(
												"h-8 px-4 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest",
												badge.unlocked ? "bg-tiimo-green/10 text-tiimo-green" : "bg-muted/20 text-muted-foreground/40"
											)}>
												{badge.unlocked ? 'Mastered' : 'Hidden'}
											</div>
										</div>

										{/* Description Hover State */}
										<div className="absolute inset-0 bg-primary rounded-[3.5rem] p-8 flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none z-20 scale-95 group-hover:scale-100">
											<div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
												<Trophy size={24} className="text-white stroke-[3px]" />
											</div>
											<p className="text-white font-black text-xl leading-tight mb-4">
												{badge.name}
											</p>
											<p className="text-white/80 text-sm font-bold leading-relaxed line-clamp-3">
												{badge.description || 'Achievement description placeholder.'}
											</p>
										</div>
									</Card>
								</m.div>
							))}
						</m.div>
					)}
				</AnimatePresence>
			</main>
		</div>
	);
}
