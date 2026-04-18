'use client';

import { CheckmarkCircleIcon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion as m } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DURATION } from '@/lib/animation-presets';
import { claimLoginBonus, getLoginBonusStatus } from '@/lib/db/login-bonus-actions';

export function DailyLoginBonus() {
	const [showToast, setShowToast] = useState(false);
	const [claimResult, setClaimResult] = useState<{
		xpEarned: number;
		consecutiveDays: number;
	} | null>(null);
	const hasAutoClaimed = useRef(false);

	const { data: status, isLoading } = useQuery({
		queryKey: ['login-bonus-status'],
		queryFn: () => getLoginBonusStatus(),
	});

	useEffect(() => {
		if (!status?.canClaim || hasAutoClaimed.current) return;

		hasAutoClaimed.current = true;

		const autoClaim = async () => {
			try {
				const result = await claimLoginBonus();
				if (result.success) {
					setClaimResult({
						xpEarned: result.xpEarned,
						consecutiveDays: result.consecutiveDays,
					});
					setShowToast(true);

					setTimeout(() => {
						setShowToast(false);
						setTimeout(() => setClaimResult(null), 500);
					}, 3000);
				}
			} catch {
				hasAutoClaimed.current = false;
			}
		};

		autoClaim();
	}, [status]);

	if (isLoading || !status?.canClaim || !showToast || !claimResult) {
		return null;
	}

	const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

	return (
		<AnimatePresence mode="wait">
			<m.div
				initial={{ y: -100, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ opacity: 0, y: -20 }}
				transition={{
					type: 'spring',
					damping: 30,
					stiffness: 400,
				}}
				className={`fixed left-1/2 -translate-x-1/2 top-4 z-[100]
					${isMobile ? 'w-[80%]' : 'w-[320px]'}
					max-w-[320px]`}
			>
				<div className="relative overflow-hidden rounded-2xl border border-border/30 shadow-soft-lg backdrop-blur-xl">
					<div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/95 to-primary/90 opacity-95" />
					<div className="relative px-5 py-3.5 flex items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
								<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-white" />
							</div>
							<div className="flex flex-col gap-0.5">
								<p className="text-sm font-bold text-white leading-tight">
									+{claimResult.xpEarned} XP Claimed!
								</p>
								<p className="text-xs text-white/70 leading-tight">
									Day {claimResult.consecutiveDays} streak
								</p>
							</div>
						</div>
						<m.div
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ delay: 0.15, type: 'spring', damping: 20 }}
						>
							<div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
								<HugeiconsIcon icon={CheckmarkCircleIcon} className="w-4 h-4 text-white" />
							</div>
						</m.div>
					</div>
					<m.div
						initial={{ scaleX: 1 }}
						animate={{ scaleX: 0 }}
						transition={{ delay: 2.5, duration: DURATION.normal }}
						className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/40 origin-left"
					/>
				</div>
			</m.div>
		</AnimatePresence>
	);
}

export function DailyLoginBonusTrigger({ onClick }: { onClick: () => void }) {
	const { data: status } = useQuery({
		queryKey: ['login-bonus-status-trigger'],
		queryFn: () => getLoginBonusStatus(),
	});

	if (!status?.canClaim) {
		return null;
	}

	return (
		<m.div
			initial={{ scale: 0.9, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
		>
			<Button onClick={onClick} className="relative gap-2 h-10 px-4 rounded-full font-medium">
				<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4" />
				Daily Bonus
				<span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
			</Button>
		</m.div>
	);
}
