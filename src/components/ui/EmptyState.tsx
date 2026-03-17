'use client';

import { m } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
	icon?: LucideIcon;
	title: string;
	description?: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
	return (
		<m.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className={cn('flex flex-col items-center justify-center py-12 text-center', className)}
		>
			{Icon && (
				<div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-4">
					<Icon className="w-8 h-8 text-muted-foreground/50" />
				</div>
			)}
			<h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
			{description && <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>}
			{action && (
				<Button onClick={action.onClick} variant="outline">
					{action.label}
				</Button>
			)}
		</m.div>
	);
}
