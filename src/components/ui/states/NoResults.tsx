'use client';

import { SearchX } from 'lucide-react';
import { motion as m } from 'motion/react';
import { Button } from '@/components/ui/button';

interface NoResultsProps {
	title?: string;
	description?: string;
	onClearFilters?: () => void;
}

export function NoResults({
	title = 'No papers found',
	description = 'Try adjusting your filters',
	onClearFilters,
}: NoResultsProps) {
	return (
		<m.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex flex-col items-center justify-center py-16 text-center"
		>
			<div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-4">
				<SearchX className="w-8 h-8 text-muted-foreground/50" />
			</div>
			<h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
			<p className="text-sm text-muted-foreground mb-6 max-w-sm">{description}</p>
			{onClearFilters && (
				<Button variant="outline" onClick={onClearFilters}>
					Clear Filters
				</Button>
			)}
		</m.div>
	);
}
