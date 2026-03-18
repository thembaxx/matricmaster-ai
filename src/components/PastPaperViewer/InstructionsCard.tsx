'use client';

import { Card } from '@/components/ui/card';

interface InstructionsCardProps {
	instructions: string;
}

export function InstructionsCard({ instructions }: InstructionsCardProps) {
	return (
		<Card className="p-6 mb-6 bg-card dark:bg-card/80 rounded-[2rem]">
			<h3 className="font-bold text-foreground mb-3 text-sm">INSTRUCTIONS AND INFORMATION</h3>
			<p className="text-xs text-muted-foreground whitespace-pre-wrap">{instructions}</p>
		</Card>
	);
}
