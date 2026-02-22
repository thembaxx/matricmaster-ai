'use client';

import { AnimatePresence, m } from 'framer-motion';
import { Award, Flame, Lock, Star, Trophy, Zap } from 'lucide-react';
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
		{ id: 'science', label: 'Science', icon: Zap },
		{ id: 'math', label: 'Math', icon: Award },
		{ id: 'streak', label: 'Streaks', icon: Flame },
	];

	if (isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center py-40">
				<div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-background pb-24 lg:px-8">
			<main className="max-w-6xl mx-auto w-full pt-12 space-y-12">
				{/* Hero Statistics Card */}
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<Card className="rounded-[3rem] p-12 relative overflow-hidden bg-primary text-primary-foreground border-none shadow-2xl shadow-primary/20">
						<div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
						<div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[80px] -ml-24 -mb-24 pointer-events-none" />

						<div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
							<div className="space-y-6">
								<div className="space-y-1">
									<p className="text-xs font-black uppercase tracking-[0.4em] opacity-80">
										Matric Master
									</p>
									<h2 className="text-5xl lg:text-8xl font-black tracking-tighter uppercase leading-none">
										Level {masteryLevel}
									</h2>
								</div>

								<div className="space-y-4">
									<div className="flex items-center justify-between text-sm font-black uppercase tracking-widest">
										<span>Mastery Progress</span>
										<span>{Math.round(progress)}%</span>
									</div>
									<Progress value={progress} className="h-4 bg-white/20" />
									<p className="text-sm font-bold opacity-80">
										{badgesToNext > 0
											? `Unlock ${badgesToNext} more badges to reach Level ${masteryLevel + 1}!`
											: 'You are at peak mastery! Keep going!'}
									</p>
								</div>
							</div>

							<div className="flex justify-center md:justify-end">
								<div className="relative">
									<m.div
										animate={{ rotate: 360 }}
										transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
										className="absolute inset-0 bg-white/10 rounded-full blur-2xl"
									/>
									<div className="w-48 h-48 lg:w-64 lg:h-64 rounded-[3.5rem] bg-white/10 backdrop-blur-3xl flex items-center justify-center border-4 border-white/20 shadow-2xl relative z-10">
										<Trophy className="w-24 h-24 lg:w-32 lg:h-32 text-white drop-shadow-2xl" />
									</div>
									<div className="absolute -bottom-6 -right-6 w-20 h-20 bg-brand-amber rounded-3xl flex items-center justify-center shadow-xl border-4 border-white z-20">
										<span className="text-2xl font-black text-white">{unlockedCount}</span>
									</div>
								</div>
							</div>
						</div>
					</Card>
				</m.div>

				{/* Category Navigation */}
				<div className="flex gap-4 p-2 bg-muted/50 rounded-[2.5rem] border-2 border-border/50 max-w-fit mx-auto lg:mx-0 overflow-x-auto no-scrollbar">
					{categories.map((category) => {
						const Icon = category.icon;
						const isActive = activeTab === category.id;
						return (
							<button
								key={category.id}
								type="button"
								onClick={() => setActiveTab(category.id)}
								className={`flex items-center gap-3 px-8 py-4 rounded-3xl text-sm font-black uppercase tracking-widest transition-all duration-300 ${
									isActive
										? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/20 scale-105'
										: 'text-muted-foreground hover:bg-muted hover:text-foreground'
								}`}
							>
								<Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
								{category.label}
							</button>
						);
					})}
				</div>

				{/* Badges Grid */}
				<AnimatePresence mode="wait">
					{filteredBadges.length === 0 ? (
						<m.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="text-center py-32 space-y-4 opacity-50"
						>
							<Lock className="w-16 h-16 mx-auto text-muted-foreground" />
							<p className="text-xl font-bold uppercase tracking-widest">No achievements yet.</p>
						</m.div>
					) : (
						<m.div
							variants={STAGGER_CONTAINER}
							initial="hidden"
							animate="visible"
							className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8"
						>
							{filteredBadges.map((badge) => (
								<m.div key={badge.id} variants={STAGGER_ITEM}>
									<Card
										className={`group relative h-full flex flex-col items-center gap-6 p-8 rounded-[2.5rem] border-2 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
											badge.unlocked
												? 'bg-card border-border hover:border-primary/20 hover:shadow-primary/5'
												: 'bg-muted/30 border-dashed border-muted-foreground/20 opacity-60'
										}`}
									>
										<div
											className={`w-24 h-24 lg:w-32 lg:h-32 rounded-[2rem] flex items-center justify-center relative transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${
												badge.unlocked ? 'shadow-xl' : 'grayscale'
											}`}
											style={{
												backgroundColor: badge.unlocked ? badge.iconBg : 'var(--muted)',
											}}
										>
											{badge.unlocked ? (
												badge.icon ? (
													<span className="text-5xl lg:text-6xl drop-shadow-xl">{badge.icon}</span>
												) : (
													<Trophy className="w-12 h-12 text-primary" />
												)
											) : (
												<Lock className="w-10 h-10 text-muted-foreground/30" />
											)}
										</div>

										<div className="text-center space-y-2">
											<h3
												className={`text-lg font-black tracking-tighter leading-none ${
													badge.unlocked ? 'text-foreground' : 'text-muted-foreground'
												}`}
											>
												{badge.name}
											</h3>
											<p
												className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border-2 inline-block ${
													badge.unlocked
														? 'text-primary border-primary/20 bg-primary/5'
														: 'text-muted-foreground/50 border-muted-foreground/10'
												}`}
											>
												{badge.unlocked ? 'Mastered' : 'Locked'}
											</p>
										</div>

										{/* Tooltip-like Description on Hover */}
										<div className="absolute inset-0 bg-primary rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
											<p className="text-primary-foreground font-black text-sm uppercase tracking-widest mb-2">
												{badge.name}
											</p>
											<p className="text-primary-foreground/80 text-xs font-bold leading-relaxed">
												{badge.description || 'Complete challenges to unlock this achievement!'}
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
