'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ConversionBannerProps {
	onConvert: () => void;
}

export function ConversionBanner({ onConvert }: ConversionBannerProps) {
	return (
		<Card
			className="p-6 mt-6 bg-brand-blue/5 w-full border-brand-blue/20 rounded-[2rem] flex flex-col gap-3 group cursor-pointer hover:bg-brand-blue/10 transition-colors"
			role="button"
			tabIndex={0}
			onClick={onConvert}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					onConvert();
				}
			}}
		>
			<div className="flex flex-col gap-4">
				<div>
					<h4 className="font-bold text-foreground dark:text-muted-foreground">
						Convert to Interactive
					</h4>
					<p className="text-xs font-semibold text-muted-foreground">
						Practice this paper with step-by-step feedback
					</p>
				</div>
			</div>
			<Button
				size="sm"
				className="bg-brand-blue text-white rounded-xl font-black text-[11px]  tracking-wider"
			>
				<HugeiconsIcon icon={SparklesIcon} className="w-6 h-6" />
				Start Quiz
			</Button>
		</Card>
	);
}
