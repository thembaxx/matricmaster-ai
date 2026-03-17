'use client';

import { m } from 'framer-motion';
import { type LucideIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
	icon?: LucideIcon;
	title: string;
	message?: string;
	onRetry?: () => void;
	className?: string;
}

export function ErrorState({ icon: Icon, title, message, onRetry, className }: ErrorStateProps) {
	return (
		<m.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			className={cn('flex flex-col items-center justify-center py-12 text-center', className)}
		>
			{Icon && (
				<div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-2xl flex items-center justify-center mb-4">
					<Icon className="w-8 h-8 text-red-500" />
				</div>
			)}
			<h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
			{message && <p className="text-sm text-muted-foreground max-w-sm mb-6">{message}</p>}
			{onRetry && (
				<Button onClick={onRetry} variant="outline" className="gap-2">
					<RefreshCw className="w-4 h-4" />
					Try Again
				</Button>
			)}
		</m.div>
	);
}
