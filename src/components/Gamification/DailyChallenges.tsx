'use client';

import {
	CheckmarkCircleIcon,
	FireIcon,
	FlashIcon,
	SparklesIcon,
	StarIcon,
	TimeQuarterIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, m } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { claimChallengeReward, getTodayChallenges } from '@/services/dailyChallenges';

interface ConfettiPiece {
	id: number;
	x: number;
	y: number;
	rotation: number;
	color: string;
	size: number;
	delay: number;
}

const CONFETTI_COLORS = [
	'#FFD700',
	'#FF6B6B',
	'#4ECDC4',
	'#45B7D1',
	'#96CEB4',
	'#FFEAA7',
	'#DDA0DD',
];

function ChallengeConfetti({ show }: { show: boolean }) {
	const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

	useEffect(() => {
		if (!show) return;
		const newPieces: ConfettiPiece[] = Array.from({ length: 30 }, (_, i) => ({
			id: i,
			x: Math.random() * 100,
			y: -10,
			rotation: Math.random() * 360,
			color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
			size: Math.random() * 6 + 3,
			delay: Math.random() * 0.3,
		}));
		setPieces(newPieces);
		const timer = setTimeout(() => setPieces([]), 3000);
		return () => clearTimeout(timer);
	}, [show]);

	if (!show || pieces.length === 0) return null;

	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
			{pieces.map((piece) => (
				<m.div
					key={piece.id}
					initial={{ x: `${piece.x}%`, y: '-10%', rotate: 0, opacity: 1 }}
					animate={{ y: '110%', rotate: piece.rotation + 720, opacity: [1, 1, 0] }}
					transition={{ duration: 2.5, delay: piece.delay, ease: 'easeIn' }}
					style={{
						position: 'absolute',
						width: piece.size,
						height: piece.size,
						backgroundColor: piece.color,
						borderRadius: Math.random() > 0.5 ? '50%' : '2px',
					}}
				/>
			))}
		</div>
	);
}

const CHALLENGE_ICONS: Record<string, typeof FireIcon> = {
	quiz: FlashIcon,
	flashcard: StarIcon,
	study: TimeQuarterIcon,
	streak: FireIcon,
};

function getTimeUntilReset(): string {
	const now = new Date();
	const midnight = new Date(now);
	midnight.setDate(midnight.getDate() + 1);
	midnight.setHours(0, 0, 0, 0);
	const diff = midnight.getTime() - now.getTime();
	const hours = Math.floor(diff / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	return `${hours}h ${minutes}m`;
}

export function DailyChallenges({ className }: { className?: string }) {
	const queryClient = useQueryClient();
	const [showConfetti, setShowConfetti] = useState(false);
	const [countdown, setCountdown] = useState(getTimeUntilReset());

	const { data: challenges, isLoading } = useQuery({
		queryKey: ['daily-challenges'],
		queryFn: () => getTodayChallenges(),
		staleTime: 30_000,
	});

	const claimMutation = useMutation({
		mutationFn: (challengeId: string) => claimChallengeReward(challengeId),
		onSuccess: (result) => {
			toast.success(`+${result.xp} XP earned!`, {
				description: 'Challenge reward claimed',
				icon: <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-brand-amber" />,
			});
			setShowConfetti(true);
			setTimeout(() => setShowConfetti(false), 3000);
			queryClient.invalidateQueries({ queryKey: ['daily-challenges'] });
			queryClient.invalidateQueries({ queryKey: ['xpHeaderData'] });
		},
		onError: () => {
			toast.error('Failed to claim reward');
		},
	});

	useEffect(() => {
		const timer = setInterval(() => {
			setCountdown(getTimeUntilReset());
		}, 60_000);
		return () => clearInterval(timer);
	}, []);

	const handleClaim = useCallback(
		(challengeId: string) => {
			claimMutation.mutate(challengeId);
		},
		[claimMutation]
	);

	if (isLoading) {
		return (
			<Card className={cn('rounded-2xl', className)}>
				<CardHeader>
					<div className="h-6 w-40 bg-muted animate-pulse rounded-lg" />
				</CardHeader>
				<CardContent className="space-y-4">
					{[1, 2, 3].map((i) => (
						<div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
					))}
				</CardContent>
			</Card>
		);
	}

	if (!challenges || challenges.length === 0) return null;

	const completedCount = challenges.filter((c) => c.isCompleted).length;

	return (
		<Card className={cn('rounded-2xl relative overflow-hidden', className)}>
			<ChallengeConfetti show={showConfetti} />
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
						<div className="w-8 h-8 rounded-xl bg-brand-amber/10 flex items-center justify-center">
							<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-brand-amber" />
						</div>
						Daily Challenges
					</CardTitle>
					<div className="flex items-center gap-3">
						<Badge variant="secondary" className="text-[10px] font-bold">
							{completedCount}/{challenges.length} done
						</Badge>
						<div className="flex items-center gap-1 text-xs text-muted-foreground">
							<HugeiconsIcon icon={TimeQuarterIcon} className="w-3.5 h-3.5" />
							<span className="font-medium">{countdown}</span>
						</div>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-3">
				<AnimatePresence>
					{challenges.map((challenge, idx) => {
						const Icon = CHALLENGE_ICONS[challenge.type] || StarIcon;
						const progressPercent = Math.min(100, (challenge.current / challenge.target) * 100);
						const canClaim = challenge.isCompleted && !challenge.isClaimed;

						return (
							<m.div
								key={challenge.id}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: idx * 0.1 }}
								className={cn(
									'p-4 rounded-xl border-2 transition-all',
									challenge.isClaimed
										? 'bg-muted/30 border-muted-foreground/10 opacity-60'
										: challenge.isCompleted
											? 'bg-brand-amber/5 border-brand-amber/30'
											: 'bg-card border-border hover:border-primary/20'
								)}
							>
								<div className="flex items-start gap-3">
									<div
										className={cn(
											'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
											challenge.isClaimed
												? 'bg-muted text-muted-foreground'
												: challenge.isCompleted
													? 'bg-brand-amber/15 text-brand-amber'
													: 'bg-primary/10 text-primary'
										)}
									>
										{challenge.isClaimed ? (
											<HugeiconsIcon icon={CheckmarkCircleIcon} className="w-5 h-5" />
										) : (
											<HugeiconsIcon icon={Icon} className="w-5 h-5" />
										)}
									</div>

									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between mb-1">
											<h4 className="font-bold text-sm truncate">{challenge.title}</h4>
											<span className="text-xs font-black text-brand-amber ml-2 shrink-0">
												+{challenge.xpReward} XP
											</span>
										</div>
										<p className="text-xs text-muted-foreground mb-3">{challenge.description}</p>

										<div className="flex items-center gap-3">
											<Progress
												value={progressPercent}
												className="h-2 flex-1"
												style={
													{
														'--progress-background': challenge.isCompleted
															? '#f59e0b'
															: 'hsl(var(--primary))',
													} as React.CSSProperties
												}
											/>
											<span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
												{challenge.current}/{challenge.target}
											</span>
										</div>
									</div>

									{canClaim && (
										<Button
											size="sm"
											onClick={() => handleClaim(challenge.id)}
											disabled={claimMutation.isPending}
											className="shrink-0 h-8 rounded-lg text-xs font-bold"
										>
											<HugeiconsIcon icon={SparklesIcon} className="w-3.5 h-3.5 mr-1" />
											Claim
										</Button>
									)}
								</div>
							</m.div>
						);
					})}
				</AnimatePresence>
			</CardContent>
		</Card>
	);
}
