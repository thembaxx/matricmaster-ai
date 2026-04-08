'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface VirtualLabProps {
	title: string;
	subject: string;
	children?: ReactNode;
	className?: string;
	visualization: ReactNode;
}

export function VirtualLab({
	title,
	subject,
	children,
	className,
	visualization,
}: VirtualLabProps) {
	return (
		<div
			className={cn(
				'rounded-2xl border border-border/30 bg-card shadow-lg overflow-hidden',
				className
			)}
		>
			<div className="px-6 py-4 border-b border-border/30">
				<div className="flex items-center gap-3">
					<span className="text-[10px] font-medium tracking-wide text-muted-foreground">
						{subject}
					</span>
				</div>
				<h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold mt-1">{title}</h3>
			</div>

			<div className="p-6">
				<div className="rounded-2xl border border-border/30 bg-secondary/20 overflow-hidden min-h-[280px] flex items-center justify-center">
					{visualization}
				</div>
			</div>

			{children && (
				<div className="px-6 pb-6">
					<div className="rounded-2xl border border-border/30 bg-secondary/10 p-4 space-y-4">
						<span className="text-[10px] font-medium tracking-wide text-muted-foreground">
							Controls
						</span>
						{children}
					</div>
				</div>
			)}
		</div>
	);
}
