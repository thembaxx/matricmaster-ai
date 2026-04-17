'use client';

import { Medal01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PremiumUpsellProps {
	feature?: string;
	description?: string;
	buttonText?: string;
	onClick?: () => void;
}

export function PremiumUpsell({
	feature = 'unlock past papers',
	description = 'get access to 2018-2023 exams with memos.',
	buttonText = 'go premium',
	onClick,
}: PremiumUpsellProps) {
	return (
		<div className="flex gap-6 relative z-10 pt-4">
			<div className="w-8 shrink-0" />
			<Card className="flex-1 bg-foreground text-background p-8 rounded-[2.5rem] text-center space-y-6 relative overflow-hidden shadow-elevation-3 border-none">
				<div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
				<div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
				<div className="w-14 h-14 bg-background/10 rounded-2xl flex items-center justify-center mx-auto shadow-inner relative group hover:scale-105 transition-transform">
					<HugeiconsIcon icon={Medal01Icon} className="w-8 h-8 text-yellow-400" />
					<div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-foreground" />
				</div>
				<div className="space-y-2">
					<h3 className="text-2xl font-black tracking-tight">{feature}</h3>
					<p className="text-muted-foreground font-medium text-sm px-4">{description}</p>
					<Button
						onClick={onClick}
						className="w-full bg-background text-foreground hover:bg-muted h-14 rounded-2xl font-black text-lg shadow-elevation-2 transition-all active:scale-[0.98]"
					>
						{buttonText}
					</Button>
				</div>
			</Card>
		</div>
	);
}
