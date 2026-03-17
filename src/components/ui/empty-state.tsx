'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import type { HugeiconsProps } from '@hugeicons/react';
import { m } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
	title: string;
	description: string;
	illustration?: string;
	icon?: React.ElementType<HugeiconsProps>;
	actionLabel?: string;
	onAction?: () => void;
	className?: string;
}

export function EmptyState({
	title,
	description,
	illustration = 'https://cdn3d.iconscout.com/3d/premium/thumb/empty-box-6219421-5102412.png',
	icon,
	actionLabel,
	onAction,
	className,
}: EmptyStateProps) {
	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className={cn(
				'flex flex-col items-center justify-center text-center p-8 rounded-[2rem] bg-card/50 border border-border/50 shadow-clay',
				className
			)}
		>
			<div className="relative w-48 h-48 mb-6">
				<m.div
					animate={{ y: [0, -10, 0] }}
					transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
					className="relative z-10 w-full h-full flex items-center justify-center"
				>
					<Image
						src={illustration}
						alt="Empty state illustration"
						fill
						className="object-contain"
						unoptimized
					/>
				</m.div>
				<div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl -z-10" />
			</div>

			<div className="space-y-2 max-w-sm mb-8">
				{icon && (
					<div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
						<HugeiconsIcon icon={icon as any} className="w-6 h-6 text-primary" />
					</div>
				)}
				<h3 className="text-2xl font-black uppercase tracking-tight">{title}</h3>
				<p className="text-muted-foreground font-medium leading-relaxed">{description}</p>
			</div>

			{actionLabel && onAction && (
				<Button
					onClick={onAction}
					className="h-12 rounded-xl px-8 font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
				>
					{actionLabel}
				</Button>
			)}
		</m.div>
	);
}
