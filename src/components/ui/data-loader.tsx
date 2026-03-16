'use client';

import { RefreshIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface DataLoaderProps {
	children: React.ReactNode;
	isLoading?: boolean;
	isError?: boolean;
	error?: string | null;
	onRetry?: () => void;
	loadingText?: string;
	loadingSkeleton?: React.ReactNode;
	className?: string;
}

export function DataLoader({
	children,
	isLoading = false,
	isError = false,
	error = null,
	onRetry,
	loadingText = 'Loading...',
	loadingSkeleton,
	className,
}: DataLoaderProps) {
	if (isLoading) {
		if (loadingSkeleton) {
			return <div className={className}>{loadingSkeleton}</div>;
		}
		return (
			<div className={cn('flex flex-col items-center justify-center py-12 gap-4', className)}>
				<Spinner className="w-8 h-8 text-primary" />
				<p className="text-sm text-muted-foreground">{loadingText}</p>
			</div>
		);
	}

	if (isError) {
		return (
			<div className={cn('flex flex-col items-center justify-center py-12 gap-4', className)}>
				<div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
					<HugeiconsIcon icon={RefreshIcon} className="w-6 h-6 text-destructive" />
				</div>
				<p className="text-sm text-muted-foreground text-center max-w-sm">
					{error || 'Something went wrong'}
				</p>
				{onRetry && (
					<Button variant="outline" size="sm" onClick={onRetry}>
						Try Again
					</Button>
				)}
			</div>
		);
	}

	return <div className={className}>{children}</div>;
}

interface DataEmptyProps {
	icon?: React.ReactNode;
	title: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
}

export function DataEmpty({ icon, title, description, action, className }: DataEmptyProps) {
	return (
		<div className={cn('flex flex-col items-center justify-center py-12 gap-4', className)}>
			{icon && (
				<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
					{icon}
				</div>
			)}
			<div className="text-center">
				<h3 className="font-semibold text-lg text-foreground">{title}</h3>
				{description && (
					<p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
				)}
			</div>
			{action && <div className="mt-2">{action}</div>}
		</div>
	);
}

interface DataSectionProps {
	title?: string;
	description?: string;
	action?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
}

export function DataSection({ title, description, action, children, className }: DataSectionProps) {
	return (
		<section className={cn('space-y-4', className)}>
			{(title || action) && (
				<div className="flex items-center justify-between">
					<div>
						{title && <h2 className="text-xl font-semibold text-foreground">{title}</h2>}
						{description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
					</div>
					{action}
				</div>
			)}
			{children}
		</section>
	);
}
