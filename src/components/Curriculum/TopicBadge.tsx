'use client';

import { Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TopicBadgeProps {
	weightage: number;
	examPaper?: string;
}

export function TopicBadge({ weightage, examPaper }: TopicBadgeProps) {
	const isHighWeight = weightage >= 20;
	const isMediumWeight = weightage >= 15 && weightage < 20;

	if (weightage < 15) return null;

	return (
		<div className="flex items-center gap-1">
			{isHighWeight && (
				<Badge variant="secondary" className="bg-red-100 text-red-700 gap-1">
					<Flame className="w-3 h-3" />
					{weightage}%
				</Badge>
			)}
			{isMediumWeight && !isHighWeight && (
				<Badge variant="outline" className="gap-1">
					{weightage}%
				</Badge>
			)}
			{examPaper && (
				<Badge variant="outline" className="text-xs">
					{examPaper}
				</Badge>
			)}
		</div>
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
