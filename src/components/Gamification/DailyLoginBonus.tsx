'use client';

import { AnimatePresence, m } from 'framer-motion';
import { Calendar, Gift, Sparkles, Star, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DAILY_LOGIN_REWARDS } from '@/constants/rewards';
import { claimLoginBonus, getLoginBonusStatus } from '@/lib/db/login-bonus-actions';

interface DailyLoginBonusProps {
	onClaimed?: () => void;
}

export function DailyLoginBonus({ onClaimed }: DailyLoginBonusProps) {
	const [status, setStatus] = useState<Awaited<ReturnType<typeof getLoginBonusStatus>> | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const [isClaiming, setIsClaiming] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [claimResult, setClaimResult] = useState<Awaited<
		ReturnType<typeof claimLoginBonus>
	> | null>(null);

	useEffect(() => {
		async function checkStatus() {
			const result = await getLoginBonusStatus();
			setStatus(result);
			setIsLoading(false);
			if (result.canClaim) {
				setShowModal(true);
			}
		}
		checkStatus();
	}, []);

	const handleClaim = async () => {
		setIsClaiming(true);
		try {
			const result = await claimLoginBonus();
			setClaimResult(result);
			if (result.success) {
				const newStatus = await getLoginBonusStatus();
				setStatus(newStatus);
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

	const currentDay = status.consecutiveDays + 1;
	const nextReward = status.nextReward;

	return (
		<AnimatePresence>
			{showModal && (
				<m.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
					onClick={handleClose}
				>
					<m.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						onClick={(e) => e.stopPropagation()}
					>
						<Card className="w-full max-w-md p-6 rounded-3xl bg-linear-to-br from-white to-amber-50 dark:from-zinc-900 dark:to-zinc-800 border-brand-amber/20 shadow-2xl">
							<div className="flex items-center justify-between mb-6">
								<div className="flex items-center gap-2">
									<div className="w-10 h-10 rounded-xl bg-brand-amber/20 flex items-center justify-center">
										<Gift className="w-5 h-5 text-brand-amber" />
									</div>
									<h2 className="text-xl font-black text-foreground">Daily Bonus</h2>
								</div>
								<Button
									variant="ghost"
									size="icon"
									onClick={handleClose}
									className="rounded-full"
									aria-label="Close"
								>
									<X className="w-5 h-5" />
								</Button>
							</div>

							{!claimResult ? (
								<>
									<div className="text-center mb-6">
										<m.div
											initial={{ scale: 0.8 }}
											animate={{ scale: 1 }}
											transition={{ type: 'spring', damping: 10 }}
											className="w-24 h-24 mx-auto mb-4 rounded-full bg-linear-to-br from-brand-amber to-orange-500 flex items-center justify-center shadow-lg shadow-brand-amber/30"
										>
											<Calendar className="w-12 h-12 text-white" />
										</m.div>
										<p className="text-sm text-muted-foreground mb-1">Day {currentDay} of 30</p>
										<h3 className="text-2xl font-black text-foreground">
											{status.consecutiveDays === 0
												? 'Welcome Back!'
												: `${status.consecutiveDays} Day Streak!`}
										</h3>
									</div>

									{nextReward && (
										<div className="bg-muted/50 rounded-2xl p-4 mb-6">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<div className="w-12 h-12 rounded-xl bg-brand-amber/10 flex items-center justify-center">
														<Zap className="w-6 h-6 text-brand-amber" />
													</div>
													<div>
														<p className="text-sm font-bold text-muted-foreground">
															Today's Reward
														</p>
														<p className="text-xl font-black text-foreground">
															+{nextReward.xpBonus} XP
														</p>
													</div>
												</div>
												{nextReward.streakFreeze && (
													<div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 rounded-full">
														<Star className="w-4 h-4 text-blue-500" />
														<span className="text-xs font-bold text-blue-500">+1 Freeze</span>
													</div>
												)}
											</div>
											{nextReward.specialReward && (
												<p className="mt-2 text-sm font-bold text-brand-amber text-center">
													<Sparkles className="w-4 h-4 inline mr-1" />
													{nextReward.specialReward}
												</p>
											)}
										</div>
									)}

									<Button
										onClick={handleClaim}
										disabled={isClaiming}
										className="w-full h-14 bg-brand-amber hover:bg-brand-amber/90 text-zinc-900 rounded-2xl text-lg font-bold shadow-lg shadow-brand-amber/20"
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
												<Sparkles className="w-6 h-6" />
											</m.div>
										) : (
											<>
												<Gift className="w-5 h-5 mr-2" />
												Claim Reward
											</>
										)}
									</Button>
								</>
							) : (
								<m.div
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									className="text-center py-6"
								>
									<m.div
										initial={{ scale: 0.95, opacity: 0 }}
										animate={{ scale: 1 }}
										transition={{ type: 'spring', damping: 10, delay: 0.1 }}
										className="w-20 h-20 mx-auto mb-4 rounded-full bg-linear-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg"
									>
										<Sparkles className="w-10 h-10 text-white" />
									</m.div>
									<h3 className="text-2xl font-black text-foreground mb-2">Reward Claimed!</h3>
									<p className="text-3xl font-black text-brand-amber mb-2">
										+{claimResult.xpEarned} XP
									</p>
									{claimResult.streakFreezeAwarded && (
										<p className="text-sm font-bold text-blue-500 flex items-center justify-center gap-1">
											<Star className="w-4 h-4" /> +1 Streak Freeze Awarded!
										</p>
									)}
									{claimResult.specialReward && (
										<p className="mt-2 text-sm font-bold text-brand-amber">
											{claimResult.specialReward}
										</p>
									)}
									<Button
										onClick={handleClose}
										className="mt-6 bg-brand-amber hover:bg-brand-amber/90 text-zinc-900 rounded-xl font-bold"
									>
										Continue
									</Button>
								</m.div>
							)}

							{!claimResult && (
								<div className="mt-4 pt-4 border-t border-border">
									<div className="flex justify-center gap-1">
										{DAILY_LOGIN_REWARDS.slice(0, 7).map((reward, index) => {
											const dayNum = index + 1;
											const isPast = dayNum <= status.consecutiveDays;
											const isCurrent = dayNum === currentDay;
											return (
												<div
													key={reward.day}
													className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
														isPast
															? 'bg-green-100 text-green-600 dark:bg-green-900/20'
															: isCurrent
																? 'bg-brand-amber text-zinc-900'
																: 'bg-muted text-muted-foreground'
													}`}
												>
													{isPast ? '✓' : dayNum}
												</div>
											);
										})}
									</div>
									<p className="text-xs text-center text-muted-foreground mt-2">
										Claim daily for bonus rewards on day 7!
									</p>
								</div>
							)}
						</Card>
					</m.div>
				</m.div>
			)}
		</AnimatePresence>
	);
}

export function DailyLoginBonusTrigger({ onClick }: { onClick: () => void }) {
	const [status, setStatus] = useState<Awaited<ReturnType<typeof getLoginBonusStatus>> | null>(
		null
	);

	useEffect(() => {
		getLoginBonusStatus().then(setStatus);
	}, []);

	if (!status?.canClaim) {
		return null;
	}

	return (
		<m.div
			initial={{ scale: 0.9, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
		>
			<Button
				onClick={onClick}
				className="relative bg-linear-to-r from-brand-amber to-orange-500 text-zinc-900 rounded-full font-bold shadow-lg shadow-brand-amber/20"
			>
				<Gift className="w-4 h-4 mr-2" />
				Daily Bonus
				<span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
			</Button>
		</m.div>
	);
}
