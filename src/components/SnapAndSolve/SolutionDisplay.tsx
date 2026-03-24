'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { memo } from 'react';
import { MarkdownRenderer } from '@/components/AI/MarkdownRenderer';
import { Card } from '@/components/ui/card';

type SolutionDisplayProps = Record<string, never>;

export const SolutionDisplay = memo(function SolutionDisplay(_props: SolutionDisplayProps) {
	return (
		<div className="flex items-center gap-2">
			<div className="p-1.5 bg-success/10 rounded-lg">
				<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-success" />
			</div>
			<span className="text-[10px] font-black text-success  tracking-widest">
				Step-by-Step Solution
			</span>
		</div>
	);
});

interface SolutionCardProps {
	solution: string;
}

export const SolutionCard = memo(function SolutionCard({ solution }: SolutionCardProps) {
	return (
		<Card className="rounded-[2.5rem] p-8 border border-border shadow-tiimo bg-card/50 backdrop-blur-sm overflow-hidden relative">
			<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
			<MarkdownRenderer content={solution} />
		</Card>
	);
});
