'use client';

import { motion } from 'motion/react';
import { DURATION, EASING } from '@/lib/animation-presets';

interface BossFightHUDProps {
	bossHp: number;
	bossMaxHp: number;
	lives: number;
	stage: number;
	totalStages: number;
	timer: number;
	bossName: string;
}

function HeartIcon({ filled }: { filled: boolean }) {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill={filled ? 'currentColor' : 'none'}
			stroke="currentColor"
			strokeWidth="2"
			className={filled ? 'text-red-500' : 'text-muted-foreground/30'}
		>
			<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
		</svg>
	);
}

export function BossFightHUD({
	bossHp,
	bossMaxHp,
	lives,
	stage,
	totalStages,
	timer,
	bossName,
}: BossFightHUDProps) {
	const hpPercentage = (bossHp / bossMaxHp) * 100;
	const minutes = Math.floor(timer / 60);
	const seconds = timer % 60;

	return (
		<div className="w-full space-y-3">
			<div className="flex items-center justify-between text-xs text-muted-foreground">
				<span className="font-heading text-sm font-medium">{bossName}</span>
				<span className="font-mono">
					{minutes}:{seconds.toString().padStart(2, '0')}
				</span>
			</div>

			<div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
				<motion.div
					className="absolute inset-y-0 left-0 rounded-full"
					style={{
						background:
							hpPercentage > 50
								? 'linear-gradient(90deg, #22c55e, #4ade80)'
								: hpPercentage > 25
									? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
									: 'linear-gradient(90deg, #ef4444, #f87171)',
					}}
					animate={{ width: `${hpPercentage}%` }}
					transition={{ duration: DURATION.normal, ease: EASING.easeOut }}
				/>
				<div className="absolute inset-0 flex items-center justify-center">
					<span className="font-mono text-[10px] font-bold text-white drop-shadow-sm">
						{bossHp}/{bossMaxHp}
					</span>
				</div>
			</div>

			<div className="flex items-center justify-between">
				<div className="flex items-center gap-1">
					{Array.from({ length: 3 }).map((_, i) => (
						<motion.div
							key={`life-${i}`}
							animate={
								i >= lives ? { scale: [1, 1.4, 0], opacity: [1, 1, 0] } : { scale: 1, opacity: 1 }
							}
							transition={{ duration: DURATION.normal, ease: EASING.easeOut }}
						>
							<HeartIcon filled={i < lives} />
						</motion.div>
					))}
				</div>

				<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<span>stage</span>
					<span className="font-mono font-bold text-foreground">
						{stage}/{totalStages}
					</span>
				</div>
			</div>
		</div>
	);
}
