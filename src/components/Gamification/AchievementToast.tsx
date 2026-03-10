'use client';

import { Cancel01Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { UnlockedAchievement } from '@/stores/useGamificationStore';

interface AchievementToastProps {
	achievement: UnlockedAchievement;
	onDismiss: () => void;
}

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
	'#98D8C8',
];

function Confetti() {
	const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

	useEffect(() => {
		const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
			id: i,
			x: Math.random() * 100,
			y: -10,
			rotation: Math.random() * 360,
			color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
			size: Math.random() * 8 + 4,
			delay: Math.random() * 0.5,
		}));
		setPieces(newPieces);
	}, []);

	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			{pieces.map((piece) => (
				<m.div
					key={piece.id}
					initial={{
						x: `${piece.x}vw`,
						y: '-10vh',
						rotate: 0,
						opacity: 1,
					}}
					animate={{
						y: '110vh',
						rotate: piece.rotation + 720,
						opacity: [1, 1, 0],
					}}
					transition={{
						duration: 3,
						delay: piece.delay,
						ease: 'easeIn',
					}}
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

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
	const [showConfetti, setShowConfetti] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => setShowConfetti(false), 3000);
		return () => clearTimeout(timer);
	}, []);

	return (
		<>
			{showConfetti && <Confetti />}
			<m.div
				initial={{ opacity: 0, y: -100, scale: 0.8 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, y: -50, scale: 0.9 }}
				transition={{ type: 'spring', damping: 20, stiffness: 300 }}
				className="relative bg-gradient-to-br from-brand-amber via-yellow-400 to-orange-400 rounded-3xl p-1 shadow-2xl max-w-sm w-full"
			>
				<div className="bg-background rounded-[1.4rem] p-6 relative overflow-hidden">
					<button
						type="button"
						onClick={onDismiss}
						className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors"
					>
						<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4 text-muted-foreground" />
					</button>

					<div className="flex items-start gap-4">
						<m.div
							initial={{ scale: 0.95, opacity: 0, rotate: -180 }}
							animate={{ scale: 1, rotate: 0 }}
							transition={{ delay: 0.2, type: 'spring', damping: 12 }}
							className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-amber/20 to-orange-400/20 flex items-center justify-center text-4xl shadow-lg shrink-0"
						>
							{achievement.icon}
						</m.div>

						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 mb-1">
								<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-brand-amber" />
								<span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-amber">
									Achievement Unlocked!
								</span>
							</div>
							<h4 className="text-lg font-black text-foreground tracking-tight truncate">
								{achievement.name}
							</h4>
							<p className="text-sm text-muted-foreground mt-1 line-clamp-2">
								{achievement.description}
							</p>
						</div>
					</div>

					{achievement.points > 0 && (
						<m.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.4 }}
							className="mt-4 flex items-center justify-between"
						>
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-brand-amber animate-pulse" />
								<span className="text-xs font-bold text-muted-foreground">Points earned</span>
							</div>
							<span className="text-xl font-black text-brand-amber">+{achievement.points} XP</span>
						</m.div>
					)}
				</div>

				<m.div
					className="absolute inset-0 rounded-3xl"
					initial={{ opacity: 0.5 }}
					animate={{ opacity: [0.3, 0.6, 0.3] }}
					transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
					style={{
						background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
					}}
				/>
			</m.div>
		</>
	);
}
