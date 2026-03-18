'use client';

import { FireIcon, GraduationCap, Medal01Icon, Target01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { LevelProgress } from '@/components/Gamification/LevelProgress';
import { BadgeShowcase } from '@/components/Profile/BadgeShowcase';
import { Card } from '@/components/ui/card';
import type { UserStats } from '@/hooks/useProfile';

interface AcademicStandingProps {
	userStats: UserStats | null;
}

export function AcademicStanding({ userStats }: AcademicStandingProps) {
	if (!userStats) return null;

	return (
		<div className="space-y-8">
			<h3 className="text-xl font-black text-foreground tracking-tighter uppercase">
				Academic Standing
			</h3>

			<Card className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-sm">
				<LevelProgress totalXp={userStats.totalXp} variant="full" showTitle />
			</Card>

			<div className="grid grid-cols-1 gap-6">
				<Card className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-sm relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500">
					<div className="flex items-center gap-8 relative z-10">
						<div className="w-20 h-20 rounded-2xl bg-primary-violet/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
							<HugeiconsIcon icon={GraduationCap} className="w-10 h-10 text-primary-violet" />
						</div>
						<div className="space-y-1">
							<p className="text-[10px] font-black text-label-tertiary uppercase tracking-[0.3em]">
								Total Knowledge
							</p>
							<h4 className="text-4xl font-black text-foreground tracking-tighter">
								{userStats.totalQuestions} Questions
							</h4>
						</div>
					</div>
				</Card>

				<Card className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-sm relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500">
					<div className="flex items-center gap-8 relative z-10">
						<div className="w-20 h-20 rounded-2xl bg-accent-lime/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
							<HugeiconsIcon icon={Target01Icon} className="w-10 h-10 text-accent-lime" />
						</div>
						<div className="space-y-1">
							<p className="text-[10px] font-black text-label-tertiary uppercase tracking-[0.3em]">
								Precision Rate
							</p>
							<h4 className="text-4xl font-black text-foreground tracking-tighter">
								{userStats.accuracy}% Accuracy
							</h4>
						</div>
					</div>
				</Card>

				<Card className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-sm relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500">
					<div className="flex items-center gap-8 relative z-10">
						<div className="w-20 h-20 rounded-2xl bg-primary-orange/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
							<HugeiconsIcon
								icon={FireIcon}
								className="w-10 h-10 text-primary-orange fill-primary-orange"
							/>
						</div>
						<div className="space-y-1">
							<p className="text-[10px] font-black text-label-tertiary uppercase tracking-[0.3em]">
								Active Momentum
							</p>
							<h4 className="text-4xl font-black text-foreground tracking-tighter">
								{userStats.streak} Day Streak
							</h4>
						</div>
					</div>
				</Card>

				<Card className="p-8 rounded-3xl border border-border bg-primary-violet/5 relative overflow-hidden group border-dashed">
					<div className="flex items-center gap-8 relative z-10">
						<div className="w-20 h-20 rounded-2xl bg-primary-violet/10 flex items-center justify-center">
							<HugeiconsIcon icon={Medal01Icon} className="w-10 h-10 text-primary-violet" />
						</div>
						<div className="space-y-1">
							<p className="text-[10px] font-black text-label-tertiary uppercase tracking-[0.3em]">
								Mastery Unlocked
							</p>
							<h4 className="text-2xl font-black text-foreground tracking-tighter uppercase">
								{userStats.achievementsUnlocked} Master Badges
							</h4>
						</div>
					</div>
				</Card>
			</div>

			{userStats.unlockedAchievementIds.length > 0 && (
				<div className="mt-8">
					<BadgeShowcase unlockedIds={userStats.unlockedAchievementIds} maxFeatured={3} />
				</div>
			)}
		</div>
	);
}
