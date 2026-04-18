'use client';

import { Star, Trophy, Zap } from 'lucide-react';
import { motion as m } from 'motion/react';

interface GamificationRewardsProps {
	userStats?: {
		totalXp: number;
		achievementsUnlocked: number;
	};
	xpBreakdown?: {
		quizXp: number;
		achievementXp: number;
	};
}

const LEVEL_MILESTONES = [
	{ level: 5, icon: '🌟', reward: 'First Badge' },
	{ level: 10, icon: '⚡', reward: '2x Quiz XP' },
	{ level: 25, icon: '🏆', reward: 'Premium Access' },
	{ level: 50, icon: '👑', reward: 'Legend Status' },
];

export default function GamificationRewards({ userStats, xpBreakdown }: GamificationRewardsProps) {
	const stats = userStats ?? { totalXp: 0, achievementsUnlocked: 0 };
	const breakdown = xpBreakdown ?? { quizXp: 0, achievementXp: 0 };

	const currentLevel = Math.floor(stats.totalXp / 1000) + 1;
	const xpInCurrentLevel = stats.totalXp % 1000;
	const progressToNextLevel = (xpInCurrentLevel / 1000) * 100;
	const xpForNextLevel = 1000 - xpInCurrentLevel;

	const nextLevel = currentLevel + 1;

	return (
		<div className="space-y-4">
			<m.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="rounded-[2rem] bg-card/50 backdrop-blur-sm p-5"
			>
				<div className="flex items-center gap-2 mb-4">
					<div className="p-2 rounded-xl bg-primary-violet/20">
						<Zap className="w-4 h-4 text-primary-violet" />
					</div>
					<h3 className="font-heading text-sm font-medium">Level Progress</h3>
				</div>

				<div className="flex items-end justify-between mb-2">
					<div>
						<span className="text-3xl font-bold text-accent-lime font-mono">{currentLevel}</span>
						<span className="text-muted-foreground ml-1">Level</span>
					</div>
					<span className="text-xs text-muted-foreground font-mono">
						{xpInCurrentLevel.toLocaleString()} / 1,000 XP
					</span>
				</div>

				<div className="relative h-3 bg-muted rounded-full overflow-hidden">
					<m.div
						className="absolute inset-y-0 left-0 bg-accent-lime rounded-full"
						initial={{ width: 0 }}
						animate={{ width: `${progressToNextLevel}%` }}
						transition={{ duration: 1, ease: 'easeOut' }}
					/>
				</div>

				<p className="text-xs text-muted-foreground mt-2">
					{xpForNextLevel.toLocaleString()} XP to Level {nextLevel}
				</p>
			</m.div>

			<m.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="rounded-[2rem] bg-card/50 backdrop-blur-sm p-5"
			>
				<div className="flex items-center gap-2 mb-4">
					<div className="p-2 rounded-xl bg-primary-violet/20">
						<Star className="w-4 h-4 text-primary-violet" />
					</div>
					<h3 className="font-heading text-sm font-medium">XP Breakdown</h3>
				</div>

				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-xs text-muted-foreground">Quizzes</span>
						<span className="font-mono font-medium text-primary-violet">
							+{breakdown.quizXp.toLocaleString()} XP
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-xs text-muted-foreground">Achievements</span>
						<span className="font-mono font-medium text-primary-violet">
							+{breakdown.achievementXp.toLocaleString()} XP
						</span>
					</div>
					<div className="border-t pt-3 flex items-center justify-between">
						<span className="text-xs font-medium">Total XP</span>
						<span className="font-mono font-bold text-primary-violet">
							{stats.totalXp.toLocaleString()} XP
						</span>
					</div>
				</div>
			</m.div>

			<m.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
				className="rounded-[2rem] bg-card/50 backdrop-blur-sm p-5"
			>
				<div className="flex items-center gap-2 mb-4">
					<div className="p-2 rounded-xl bg-amber-500/20">
						<Trophy className="w-4 h-4 text-[#fbbf24]" />
					</div>
					<h3 className="font-heading text-sm font-medium">Next Level Preview</h3>
				</div>

				<div className="space-y-3">
					<div className="flex items-center justify-between text-xs">
						<span className="text-muted-foreground">XP Required</span>
						<span className="font-mono">
							{Math.min(stats.totalXp + xpForNextLevel, 50000).toLocaleString()} XP
						</span>
					</div>
					<div className="flex items-center justify-between text-xs">
						<span className="text-muted-foreground">Achievements</span>
						<span className="font-mono">{stats.achievementsUnlocked} unlocked</span>
					</div>
				</div>
			</m.div>

			<m.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				className="rounded-[2rem] bg-card/50 backdrop-blur-sm p-5"
			>
				<div className="flex items-center gap-2 mb-4">
					<div className="p-2 rounded-xl bg-[#fbbf24]/20">
						<Star className="w-4 h-4 text-[#fbbf24]" />
					</div>
					<h3 className="font-heading text-sm font-medium">Level Badges</h3>
				</div>

				<div className="grid grid-cols-4 gap-2">
					{LEVEL_MILESTONES.map((milestone) => {
						const isUnlocked = currentLevel >= milestone.level;
						return (
							<div
								key={milestone.level}
								className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
									isUnlocked
										? 'bg-[#fbbf24]/10 border-2 border-[#fbbf24]/30'
										: 'bg-muted/50 border-2 border-dashed border-muted-foreground/20 opacity-50'
								}`}
							>
								<span className="text-lg">{milestone.icon}</span>
								<span className="text-xs font-mono font-medium">{milestone.level}</span>
								<span
									className={`text-[10px] text-center ${
										isUnlocked ? 'text-[#fbbf24]' : 'text-muted-foreground'
									}`}
								>
									{milestone.reward}
								</span>
							</div>
						);
					})}
				</div>
			</m.div>
		</div>
	);
}
