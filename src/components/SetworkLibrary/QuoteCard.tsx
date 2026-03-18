'use client';

import { QuotesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card } from '@/components/ui/card';
import type { Quote } from '@/data/setworks/types';

interface QuoteCardProps {
	quote: Quote;
}

export function QuoteCard({ quote }: QuoteCardProps) {
	return (
		<Card className="p-4">
			<div className="flex gap-3">
				<HugeiconsIcon icon={QuotesIcon} className="w-5 h-5 text-primary shrink-0 mt-1" />
				<div>
					<p className="font-medium italic">"{quote.text}"</p>
					<p className="text-sm text-muted-foreground mt-2">— {quote.speaker}</p>
					<p className="text-xs text-muted-foreground mt-1">{quote.context}</p>
				</div>
			</div>
		</Card>
	);
}
