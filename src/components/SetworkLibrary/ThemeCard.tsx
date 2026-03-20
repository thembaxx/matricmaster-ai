'use client';

import { Card } from '@/components/ui/card';
import type { Theme } from '@/data/setworks/types';

interface ThemeCardProps {
	theme: Theme;
}

export function ThemeCard({ theme }: ThemeCardProps) {
	return (
		<Card className="p-4">
			<h4 className="font-bold mb-2">{theme.name}</h4>
			<p className="text-sm text-muted-foreground mb-3">{theme.description}</p>
			<div className="space-y-2">
				<p className="text-xs font-semibold uppercase text-muted-foreground">Examples:</p>
				{theme.examples.map((example, i) => (
					<p
						key={`example-${i}`}
						className="text-sm bg-secondary/50 p-2 rounded dark:bg-secondary/20"
					>
						• {example}
					</p>
				))}
			</div>
		</Card>
	);
}
