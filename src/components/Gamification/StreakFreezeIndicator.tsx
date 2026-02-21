'use client';

import { motion } from 'framer-motion';
import { Flame, Snowflake, Sparkles, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MAX_STREAK_FREEZES, STREAK_FREEZE_COST_XP } from '@/constants/rewards';
import {
	useStreakFreeze as applyStreakFreeze,
	getStreakInfo,
	purchaseStreakFreeze,
} from '@/lib/db/streak-actions';
import { getXpBreakdown } from '@/lib/streak-utils';

interface StreakFreezeIndicatorProps {
	variant?: 'full' | 'compact' | 'badge';
	onFreezeUsed?: () => void;
	className?: string;
}

export function StreakFreezeIndicator({
	variant = 'compact',
	onFreezeUsed,
	className = '',
}: StreakFreezeIndicatorProps) {
	const [streakInfo, setStreakInfo] = useState<Awaited<ReturnType<typeof getStreakInfo>>>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isUsing, setIsUsing] = useState(false);
	const [isPurchasing, setIsPurchasing] = useState(false);

	useEffect(() => {
		async function loadStreakInfo() {
			const info = await getStreakInfo();
			setStreakInfo(info);
			setIsLoading(false);
		}
		loadStreakInfo();
	}, []);

	const handleUseFreeze = async () => {
		setIsUsing(true);
		try {
			const result = await applyStreakFreeze();
			if (result.success) {
				const info = await getStreakInfo();
				setStreakInfo(info);
				onFreezeUsed?.();
			}
		} finally {
			setIsUsing(false);
		}
	};

	const handlePurchaseFreeze = async () => {
		setIsPurchasing(true);
		try {
			const result = await purchaseStreakFreeze();
			if (result.success) {
				const info = await getStreakInfo();
				setStreakInfo(info);
			}
		} finally {
			setIsPurchasing(false);
		}
	};

	if (isLoading || !streakInfo) {
		return null;
	}

	if (variant === 'badge') {
		return (
			<div
				className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 ${className}`}
			>
				<Snowflake className="w-3 h-3 text-blue-500" />
				<span className="text-xs font-bold text-blue-500">{streakInfo.streakFreezes}</span>
			</div>
		);
	}

	if (variant === 'compact') {
		return (
			<div className={`flex items-center gap-2 ${className}`}>
				<div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-full">
					<Flame className="w-4 h-4 text-orange-500" />
					<span className="text-sm font-black text-orange-500">{streakInfo.currentStreak}</span>
				</div>

				{streakInfo.streakFreezes > 0 && (
					<div className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 rounded-full">
						<Snowflake className="w-3 h-3 text-blue-500" />
						<span className="text-xs font-bold text-blue-500">{streakInfo.streakFreezes}</span>
					</div>
				)}

				{streakInfo.multiplier > 1 && (
					<div
						className="flex items-center gap-1 px-2 py-1 rounded-full"
						style={{ backgroundColor: `${'#f59e0b'}20` }}
					>
						<Zap className="w-3 h-3 text-brand-amber" />
						<span className="text-xs font-black text-brand-amber">{streakInfo.multiplier}x</span>
					</div>
				)}
			</div>
		);
	}

	return (
		<Card className={`p-6 rounded-2xl ${className}`}>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
							<Flame className="w-6 h-6 text-white" />
						</div>
						<div>
							<p className="text-sm font-bold text-muted-foreground">Current Streak</p>
							<p className="text-2xl font-black text-foreground">{streakInfo.currentStreak} days</p>
						</div>
					</div>

					{streakInfo.multiplier > 1 && (
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-amber/10"
						>
							<Sparkles className="w-5 h-5 text-brand-amber" />
							<div className="text-right">
								<p className="text-xs font-bold text-muted-foreground">XP Bonus</p>
								<p className="text-lg font-black text-brand-amber">
									{streakInfo.multiplier}x ({streakInfo.multiplierLabel})
								</p>
							</div>
						</motion.div>
					)}
				</div>

				{streakInfo.daysUntilNextMultiplier > 0 && streakInfo.currentStreak < 100 && (
					<div className="px-4 py-2 bg-muted/50 rounded-xl">
						<p className="text-xs text-muted-foreground">
							<span className="font-bold">{streakInfo.daysUntilNextMultiplier} more days</span>{' '}
							until next XP multiplier
						</p>
					</div>
				)}

				<div className="flex items-center justify-between pt-2 border-t border-border">
					<div className="flex items-center gap-2">
						<Snowflake className="w-5 h-5 text-blue-500" />
						<span className="text-sm font-bold">Streak Freezes</span>
						<span className="text-sm text-muted-foreground">
							({streakInfo.streakFreezes}/{MAX_STREAK_FREEZES})
						</span>
					</div>

					<div className="flex items-center gap-2">
						{streakInfo.streakFreezes > 0 && (
							<Button
								size="sm"
								variant="outline"
								onClick={handleUseFreeze}
								disabled={isUsing}
								className="text-blue-500 border-blue-200 hover:bg-blue-50"
							>
								<Snowflake className="w-4 h-4 mr-1" />
								Use Freeze
							</Button>
						)}

						{streakInfo.streakFreezes < MAX_STREAK_FREEZES && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button size="sm" variant="ghost" disabled={isPurchasing}>
										+ Buy
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={handlePurchaseFreeze}>
										<Snowflake className="w-4 h-4 mr-2 text-blue-500" />
										Buy 1 Freeze ({STREAK_FREEZE_COST_XP} XP)
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</div>
			</div>
		</Card>
	);
}

export function StreakMultiplierBadge({ streak }: { streak: number }) {
	const xpBreakdown = getXpBreakdown(10, streak);

	if (xpBreakdown.multiplier <= 1) {
		return null;
	}

	return (
		<motion.div
			initial={{ scale: 0.8, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-amber/10"
		>
			<Zap className="w-4 h-4 text-brand-amber" />
			<span className="text-sm font-black text-brand-amber">{xpBreakdown.multiplier}x XP</span>
			<span className="text-xs text-brand-amber/70">({xpBreakdown.label})</span>
		</motion.div>
	);
}
