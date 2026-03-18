'use client';

import { Target01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { memo } from 'react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
	label: string;
	value: string | number;
	icon: IconSvgElement;
	colorClass: string;
	iconColorClass: string;
}

export const StatCard = memo(function StatCard({
	label,
	value,
	icon: Icon,
	colorClass,
	iconColorClass,
}: StatCardProps) {
	return (
		<Card className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-sm relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500">
			<div className="flex items-center gap-8 relative z-10">
				<div
					className={`w-20 h-20 rounded-2xl ${colorClass} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner`}
				>
					<HugeiconsIcon icon={Icon} className={`w-10 h-10 ${iconColorClass}`} />
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
});

interface AcademicStandingCardsProps {
	totalQuestions: number;
	accuracy: number;
	streak: number;
	achievementsUnlocked: number;
}

export const AcademicStandingCards = memo(function AcademicStandingCards({
	totalQuestions,
	accuracy,
	streak,
	achievementsUnlocked,
}: AcademicStandingCardsProps) {
	return (
		<div className="grid grid-cols-1 gap-6">
			<StatCard
				label="Total Knowledge"
				value={`${totalQuestions} Questions`}
				icon={GraduationCap}
				colorClass="bg-primary-violet/10"
				iconColorClass="text-primary-violet"
			/>
			<StatCard
				label="Precision Rate"
				value={`${accuracy}% Accuracy`}
				icon={Target01Icon}
				colorClass="bg-accent-lime/10"
				iconColorClass="text-accent-lime"
			/>
			<StatCard
				label="Active Momentum"
				value={`${streak} Day Streak`}
				icon={FireIcon}
				colorClass="bg-primary-orange/10"
				iconColorClass="text-primary-orange"
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
});

import { FireIcon, GraduationCap, Medal01Icon } from '@hugeicons/core-free-icons';
