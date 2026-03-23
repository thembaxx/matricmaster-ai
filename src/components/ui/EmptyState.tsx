'use client';

import { m } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { BookOpen, FolderOpen, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
	variant?: 'loading' | 'empty' | 'noResults';
	title?: string;
	description?: string;
	icon?: LucideIcon;
	actionLabel?: string;
	onAction?: () => void;
	className?: string;
}

export function EmptyState({
	variant = 'empty',
	title,
	description,
	icon: Icon,
	actionLabel,
	onAction,
	className,
}: EmptyStateProps) {
	const defaultContent = {
		loading: {
			title: 'Loading...',
			description: 'Just a moment while we fetch your data',
			icon: undefined,
		},
		empty: {
			title: 'No items yet',
			description: "You haven't added anything here. Start your learning journey now!",
			icon: FolderOpen,
		},
		noResults: {
			title: 'No results found',
			description: 'Try adjusting your search or filters to find what you need',
			icon: SearchX,
		},
	};

	const content = defaultContent[variant];
	const finalTitle = title ?? content.title;
	const finalDescription = description ?? content.description;
	const finalIcon = Icon ?? content.icon;
	const IconComponent = finalIcon;

	return (
		<m.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className={cn('flex flex-col items-center justify-center py-12 text-center', className)}
		>
			{variant === 'loading' ? (
				<div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
			) : (
				IconComponent && (
					<div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-4">
						<IconComponent className="w-8 h-8 text-muted-foreground/50" />
					</div>
				)
			)}
			<h3 className="text-lg font-bold text-foreground mb-2">{finalTitle}</h3>
			{finalDescription && (
				<p className="text-sm text-muted-foreground max-w-sm mb-6">{finalDescription}</p>
			)}
			{actionLabel && onAction && (
				<Button onClick={onAction} variant="outline">
					{actionLabel}
				</Button>
			)}
		</m.div>
	);
}

export { BookOpen };
