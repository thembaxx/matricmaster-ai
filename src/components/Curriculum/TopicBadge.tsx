'use client';

import { Flame, TrendingUpIcon } from 'lucide-react';
import { motion as m } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { DURATION, EASING } from '@/lib/animation-presets';

interface TopicBadgeProps {
	weightage: number;
	examPaper?: string;
}

export function TopicBadge({ weightage, examPaper }: TopicBadgeProps) {
	const isHighWeight = weightage >= 20;
	const isMediumWeight = weightage >= 15 && weightage < 20;

	if (weightage < 15) return null;

	return (
		<m.div
			className="flex items-center gap-1"
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: DURATION.quick, ease: EASING.easeOut }}
		>
			{isHighWeight && (
				<m.div
					whileHover={{ scale: 1.05 }}
					transition={{ duration: DURATION.quick, ease: EASING.easeOut }}
				>
					<Badge
						variant="secondary"
						className="bg-gradient-to-r from-red-500 to-orange-500 text-white gap-1 shadow-sm"
					>
						<Flame className="w-3 h-3" />
						<span className="font-bold">{weightage}%</span>
					</Badge>
				</m.div>
			)}
			{isMediumWeight && !isHighWeight && (
				<m.div
					whileHover={{ scale: 1.05 }}
					transition={{ duration: DURATION.quick, ease: EASING.easeOut }}
				>
					<Badge
						variant="outline"
						className="gap-1 border-amber-400/50 text-amber-700 bg-amber-50 dark:bg-amber-950/30"
					>
						<TrendingUpIcon className="w-3 h-3" />
						<span className="font-semibold">{weightage}%</span>
					</Badge>
				</m.div>
			)}
			{examPaper && (
				<Badge
					variant="outline"
					className="text-xs border-slate-300 text-slate-600 bg-white/80 dark:bg-zinc-900/80"
				>
					{examPaper}
				</Badge>
			)}
		</m.div>
	);
}

export function getTopicWeightageBadge(
	topic: string,
	subject: string
): { weightage: number; examPaper?: string } | null {
	const weightages: Record<string, Record<string, { weightage: number; examPaper?: string }>> = {
		Mathematics: {
			Calculus: { weightage: 35, examPaper: 'P1' },
			'Euclidean Geometry': { weightage: 25, examPaper: 'P1' },
			Functions: { weightage: 25, examPaper: 'P1' },
			Algebra: { weightage: 20, examPaper: 'P1' },
			Probability: { weightage: 15, examPaper: 'P2' },
			Statistics: { weightage: 15, examPaper: 'P2' },
		},
		'Physical Sciences': {
			'Chemical Equilibrium': { weightage: 20, examPaper: 'P2' },
			Electrostatics: { weightage: 15, examPaper: 'P1' },
			'Electric Circuits': { weightage: 15, examPaper: 'P1' },
			'Momentum & Impulse': { weightage: 15, examPaper: 'P1' },
			'Work, Energy & Power': { weightage: 15, examPaper: 'P1' },
		},
	};

	return weightages[subject]?.[topic] ?? null;
}
