'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Award, Flame, Lock, Star, Trophy, Zap, ChevronRight, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge as UIBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ACHIEVEMENTS } from '@/constants/achievements';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { getUserAchievements } from '@/lib/db/achievement-actions';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { AchievementCard } from '@/components/Gamification/AchievementCard';
import { cn } from '@/lib/utils';

interface Badge {
	id: string;
	name: string;
	icon: string;
	iconBg: string;
	unlocked: boolean;
	category: 'all' | 'science' | 'math' | 'history' | 'streak';
	description: string;
	points: number;
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

				const mappedBadges: Badge[] = ACHIEVEMENTS.map((achievement) => ({
					id: achievement.id,
					name: achievement.name,
					icon: achievement.icon,
					iconBg: achievement.iconBg,
					unlocked: unlockedIds.has(achievement.id),
					category: achievement.category,
					description: achievement.description,
					points: achievement.points,
				}));

				setBadges(mappedBadges);
			} catch (error) {
				console.error('Error fetching achievements:', error);
				setBadges(ACHIEVEMENTS.map(a => ({ ...a, unlocked: false })));
			} finally {
				setIsLoading(false);
			}
		}

		fetchAchievements();
	}, []);

	const filteredBadges =
		activeTab === 'all'
			? badges
			: badges.filter((b) => b.category === activeTab);

	const unlockedCount = badges.filter((b) => b.unlocked).length;
	const totalBadges = ACHIEVEMENTS.length;
	const progress = totalBadges > 0 ? (unlockedCount / totalBadges) * 100 : 0;

	const categories = [
		{ id: 'all', label: 'All', icon: Star },
		{ id: 'math', label: 'Math', icon: Award },
		{ id: 'science', label: 'Science', icon: Zap },
		{ id: 'streak', label: 'Streaks', icon: Flame },
	];

	if (isLoading) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center py-40 gap-4">
				<div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-violet border-t-transparent" />
				<p className="font-bold text-muted-foreground animate-pulse uppercase tracking-widest text-xs">Loading Trophies...</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full min-w-0 bg-background relative overflow-x-hidden">
			<BackgroundMesh variant="subtle" />

			<main className="max-w-7xl mx-auto w-full px-6 py-10 sm:py-16 space-y-12 pb-32 lg:px-0">
				{/* Hero Header */}
				<header className="space-y-8">
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
						<div className="space-y-4">
							<motion.div
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
							>
								<UIBadge variant="violet" size="lg" className="mb-2">Achievements</UIBadge>
								<h1 className="text-4xl sm:text-6xl font-heading font-black text-foreground tracking-tight">
									Hall of Fame
								</h1>
								<p className="text-muted-foreground text-lg sm:text-xl font-medium max-w-xl">
									You've unlocked {unlockedCount} of {totalBadges} badges. Keep pushing for greatness!
								</p>
							</motion.div>
						</div>

						<div className="flex flex-col items-end gap-3">
							<div className="flex items-center gap-4 bg-card p-4 rounded-3xl border-2 border-primary-violet/10 shadow-xl shadow-primary-violet/5">
								<div className="relative">
									<Trophy className="w-10 h-10 text-primary-violet" />
									<motion.div
										animate={{ scale: [1, 1.2, 1] }}
										transition={{ repeat: Infinity, duration: 2 }}
										className="absolute -top-1 -right-1"
									>
										<Sparkles className="w-4 h-4 text-primary-orange" />
									</motion.div>
								</div>
								<div className="space-y-1">
									<div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">
										Mastery Rank
									</div>
									<div className="text-2xl font-heading font-black leading-none text-primary-violet">
										{Math.round(progress)}%
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Overall Progress Bar */}
					<div className="space-y-2">
						<div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
							<span>Collection Progress</span>
							<span>{unlockedCount} / {totalBadges} Badges</span>
						</div>
						<Progress value={progress} variant="violet" className="h-3" />
					</div>
				</header>

				{/* Category Tabs */}
				<div className="flex gap-2 p-1.5 bg-muted/50 rounded-2xl border-2 border-border/50 w-full overflow-x-auto no-scrollbar">
					{categories.map((category) => {
						const Icon = category.icon;
						const isActive = activeTab === category.id;
						return (
							<button
								key={category.id}
								onClick={() => setActiveTab(category.id)}
								className={cn(
									"flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
									isActive
										? "bg-primary-violet text-white shadow-lg shadow-primary-violet/20"
										: "text-muted-foreground hover:bg-muted hover:text-foreground"
								)}
							>
								<Icon className={cn("w-4 h-4", isActive && "animate-pulse")} />
								{category.label}
							</button>
						);
					})}
				</div>

				{/* Badges Grid */}
				<AnimatePresence mode="wait">
					{filteredBadges.length === 0 ? (
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							className="text-center py-32 space-y-6"
						>
							<div className="w-24 h-24 mx-auto bg-muted rounded-[2rem] flex items-center justify-center">
								<Lock className="w-10 h-10 text-muted-foreground/30" />
							</div>
							<div className="space-y-2">
								<h3 className="text-xl font-heading font-black">Nothing here yet</h3>
								<p className="text-muted-foreground font-medium">Keep studying to unlock badges in this category!</p>
							</div>
						</motion.div>
					) : (
						<motion.div
							variants={STAGGER_CONTAINER}
							initial="hidden"
							animate="visible"
							className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
						>
							{filteredBadges.map((badge) => (
								<motion.div key={badge.id} variants={STAGGER_ITEM}>
									<AchievementCard
										achievement={badge}
										progress={badge.unlocked ? 100 : 0}
										unlocked={badge.unlocked}
										className="h-full"
									/>
								</motion.div>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</main>
		</div>
	);
}
