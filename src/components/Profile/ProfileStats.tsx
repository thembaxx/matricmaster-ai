'use client';

import { FireIcon, GraduationCap, Medal01Icon, Target01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
	icon: typeof GraduationCap;
	label: string;
	value: string;
	colorClass: string;
	bgColorClass: string;
}

export function StatCard({ icon, label, value, colorClass, bgColorClass }: StatCardProps) {
	return (
		<Card className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-sm relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500">
			<div className="flex items-center gap-8 relative z-10">
				<div
					className={`w-20 h-20 rounded-2xl ${bgColorClass} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner`}
				>
					<HugeiconsIcon icon={icon} className={`w-10 h-10 ${colorClass}`} />
				</div>
				<div className="space-y-1">
					<p className="text-[10px] font-black text-label-tertiary uppercase tracking-[0.3em]">
						{label}
					</p>
					<h4 className="text-4xl font-black text-foreground tracking-tighter">{value}</h4>
				</div>
			</div>
		</Card>
	);
}

interface ProfileStatsProps {
	totalQuestions: number;
	accuracy: number;
	streak: number;
	achievementsUnlocked: number;
}

export function ProfileStats({
	totalQuestions,
	accuracy,
	streak,
	achievementsUnlocked,
}: ProfileStatsProps) {
	return (
		<div className="grid grid-cols-1 gap-6">
			<StatCard
				icon={GraduationCap}
				label="Total Knowledge"
				value={`${totalQuestions} Questions`}
				colorClass="text-primary-violet"
				bgColorClass="bg-primary-violet/10"
			/>

			<StatCard
				icon={Target01Icon}
				label="Precision Rate"
				value={`${accuracy}% Accuracy`}
				colorClass="text-accent-lime"
				bgColorClass="bg-accent-lime/10"
			/>

			<StatCard
				icon={FireIcon}
				label="Active Momentum"
				value={`${streak} Day Streak`}
				colorClass="text-primary-orange fill-primary-orange"
				bgColorClass="bg-primary-orange/10"
			/>

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
							{achievementsUnlocked} Master Badges
						</h4>
					</div>
				</div>
			</Card>
		</div>
	);
}
