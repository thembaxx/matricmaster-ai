'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

type MasteryLevel = 'bronze' | 'silver' | 'gold';

interface MasteryBadgeProps {
	subject: string;
	score: number;
	totalQuestions: number;
	onShare?: () => void;
	onClose?: () => void;
}

function getMasteryLevel(percentage: number): MasteryLevel {
	if (percentage >= 90) return 'gold';
	if (percentage >= 70) return 'silver';
	return 'bronze';
}

const MASTERY_COLORS: Record<
	MasteryLevel,
	{ bg: string; border: string; glow: string; text: string }
> = {
	bronze: {
		bg: 'bg-amber-900/20',
		border: 'border-amber-700',
		glow: 'shadow-amber-700/40',
		text: 'text-amber-600',
	},
	silver: {
		bg: 'bg-slate-400/20',
		border: 'border-slate-400',
		glow: 'shadow-slate-400/40',
		text: 'text-slate-300',
	},
	gold: {
		bg: 'bg-yellow-500/20',
		border: 'border-yellow-500',
		glow: 'shadow-yellow-500/40',
		text: 'text-yellow-500',
	},
};

export function MasteryBadge({
	subject,
	score,
	totalQuestions,
	onShare,
	onClose,
}: MasteryBadgeProps) {
	const percentage = Math.round((score / totalQuestions) * 100);
	const level = getMasteryLevel(percentage);
	const colors = MASTERY_COLORS[level];

	return (
		<motion.div
			initial={{ scale: 0, rotate: -180 }}
			animate={{ scale: 1, rotate: 0 }}
			transition={{ type: 'spring', stiffness: 200, damping: 15, duration: 0.8 }}
			className="flex flex-col items-center gap-6 p-8"
		>
			<motion.div
				animate={{
					boxShadow: [
						'0 0 20px 5px rgba(0,0,0,0)',
						`0 0 40px 10px ${level === 'gold' ? 'rgba(234,179,8,0.3)' : level === 'silver' ? 'rgba(148,163,184,0.3)' : 'rgba(180,83,9,0.3)'}`,
						'0 0 20px 5px rgba(0,0,0,0)',
					],
				}}
				transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
				className={`relative flex h-32 w-32 items-center justify-center rounded-full border-2 ${colors.border} ${colors.bg} ${colors.glow} shadow-2xl`}
			>
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
				>
					<svg
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						className={colors.text}
					>
						<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
					</svg>
				</motion.div>

				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.6, type: 'spring' }}
					className="absolute -bottom-1 rounded-full bg-background px-2 py-0.5"
				>
					<span className={`font-mono text-xs font-bold ${colors.text}`}>{level}</span>
				</motion.div>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.5 }}
				className="text-center"
			>
				<h3 className="font-heading text-lg font-bold">{subject} mastered</h3>
				<p className="mt-1 font-mono text-2xl font-bold">
					{score}/{totalQuestions}
				</p>
				<p className="mt-0.5 text-xs text-muted-foreground">{percentage}% accuracy</p>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.8 }}
				className="flex gap-3"
			>
				<Button variant="outline" size="sm" onClick={onShare}>
					share badge
				</Button>
				<Button size="sm" onClick={onClose}>
					continue
				</Button>
			</motion.div>
		</motion.div>
	);
}
