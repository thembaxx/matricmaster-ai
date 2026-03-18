'use client';

import {
	Cancel01Icon,
	CheckmarkCircleIcon,
	SparklesIcon,
	StarIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, m } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { claimLoginBonus, getLoginBonusStatus } from '@/lib/db/login-bonus-actions';

interface DailyLoginBonusProps {
	onClaimed?: () => void;
}

export function DailyLoginBonus({ onClaimed }: DailyLoginBonusProps) {
	const [isClaiming, setIsClaiming] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [claimResult, setClaimResult] = useState<Awaited<
		ReturnType<typeof claimLoginBonus>
	> | null>(null);

	const { data: status, isLoading } = useQuery({
		queryKey: ['login-bonus-status'],
		queryFn: () => getLoginBonusStatus(),
	});

	useEffect(() => {
		if (status?.canClaim) {
			setShowModal(true);
		}
	}, [status]);

	const handleClaim = async () => {
		setIsClaiming(true);
		try {
			const result = await claimLoginBonus();
			setClaimResult(result);
			if (result.success) {
				onClaimed?.();
			}
		} finally {
			setIsClaiming(false);
		}
	};

	const handleClose = () => {
		setShowModal(false);
		setTimeout(() => setClaimResult(null), 300);
	};

	if (isLoading || !status || !status.canClaim) {
		return null;
	}

	const currentDay = (status?.consecutiveDays ?? 0) + 1;
	const nextReward = status?.nextReward;

	return (
		<AnimatePresence>
			{showModal && (
				<m.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
					onClick={handleClose}
				>
					<m.div
						initial={{ scale: 0.9, opacity: 0, y: 20 }}
						animate={{ scale: 1, opacity: 1, y: 0 }}
						exit={{ scale: 0.9, opacity: 0, y: 20 }}
						transition={{ type: 'spring', damping: 25, stiffness: 300 }}
						onClick={(e) => e.stopPropagation()}
						className="w-full max-w-sm"
					>
						<Card className="overflow-hidden border-0 shadow-2xl">
							{!claimResult ? (
								<div>
									<div className="relative px-6 pt-8 pb-6 bg-gradient-to-b from-primary/5 to-transparent">
										<Button
											variant="ghost"
											size="icon"
											onClick={handleClose}
											className="absolute top-4 right-4 h-8 w-8 rounded-full"
										>
											<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
										</Button>

										<m.div
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											transition={{ delay: 0.1, type: 'spring', damping: 15 }}
											className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
										>
											<div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
												<HugeiconsIcon icon={SparklesIcon} className="w-8 h-8 text-white" />
											</div>
										</m.div>

										<div className="text-center">
											<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
												Day {currentDay}
											</p>
											<h2 className="text-2xl font-bold tracking-tight">
												{status.consecutiveDays === 0
													? 'Welcome Back!'
													: `${status.consecutiveDays} Day Streak`}
											</h2>
										</div>
									</div>

									<CardContent className="px-6 pb-6 space-y-6">
										{nextReward && (
											<div className="p-4 rounded-2xl bg-muted/50">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-3">
														<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
															<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-primary" />
														</div>
														<div>
															<p className="text-xs font-medium text-muted-foreground">
																Today&apos;s Reward
															</p>
															<p className="text-lg font-bold">+{nextReward.xpBonus} XP</p>
														</div>
													</div>
													{nextReward.streakFreeze && (
														<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10">
															<HugeiconsIcon
																icon={StarIcon}
																className="w-3.5 h-3.5 text-blue-500"
															/>
															<span className="text-xs font-medium text-blue-500">+1 Freeze</span>
														</div>
													)}
												</div>
												{nextReward.specialReward && (
													<p className="mt-2 text-xs font-medium text-center text-primary">
														{nextReward.specialReward}
													</p>
												)}
											</div>
										)}

										<div className="flex justify-center gap-2">
											{Array.from({ length: 7 }).map((_, index) => {
												const dayNum = index + 1;
												const isPast = dayNum <= status.consecutiveDays;
												const isCurrent = dayNum === currentDay;
												return (
													<div
														key={dayNum}
														className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
															isPast
																? 'bg-success text-white'
																: isCurrent
																	? 'bg-primary text-white ring-4 ring-primary/20'
																	: 'bg-muted text-muted-foreground'
														}`}
													>
														{isPast ? (
															<HugeiconsIcon icon={CheckmarkCircleIcon} className="w-4 h-4" />
														) : (
															dayNum
														)}
													</div>
												);
											})}
										</div>

										<Button
											onClick={handleClaim}
											disabled={isClaiming}
											className="w-full h-12 rounded-xl font-semibold"
										>
											{isClaiming ? (
												<m.div
													animate={{ rotate: 360 }}
													transition={{
														repeat: Number.POSITIVE_INFINITY,
														duration: 1,
														ease: 'linear',
													}}
												>
													<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5" />
												</m.div>
											) : (
												<>
													<HugeiconsIcon icon={StarIcon} className="w-6 h-6 ml-2" />
													Claim Reward
												</>
											)}
										</Button>
									</CardContent>
								</div>
							) : (
								<CardContent className="px-6 py-8 text-center">
									<m.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ delay: 0.1, type: 'spring', damping: 15 }}
										className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center"
									>
										<div className="w-16 h-16 rounded-full bg-success flex items-center justify-center">
											<HugeiconsIcon icon={CheckmarkCircleIcon} className="w-8 h-8 text-white" />
										</div>
									</m.div>

									<h3 className="text-xl font-bold mb-2">Reward Claimed!</h3>
									<p className="text-3xl font-black text-success mb-2">
										+{claimResult.xpEarned} XP
									</p>
									<p className="text-sm text-muted-foreground mb-4">
										Total: {claimResult.totalXp} XP
									</p>

									{claimResult.streakFreezeAwarded && (
										<p className="text-sm font-medium text-blue-500 flex items-center justify-center gap-1.5 mb-4">
											<HugeiconsIcon icon={StarIcon} className="w-4 h-4" /> +1 Streak Freeze
										</p>
									)}

									{claimResult.specialReward && (
										<p className="text-sm font-medium text-primary mb-4">
											{claimResult.specialReward}
										</p>
									)}

									<Button onClick={handleClose} className="w-full h-11 rounded-xl font-medium">
										Continue
									</Button>
								</CardContent>
							)}
						</Card>
					</m.div>
				</m.div>
			)}
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
