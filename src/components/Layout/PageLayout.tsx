'use client';

import type { ReactNode } from 'react';
import { BackgroundMesh } from '@/components/ui/background-mesh';

interface PageLayoutProps {
	children: ReactNode;
	className?: string;
	variant?: 'default' | 'subtle';
	showBackground?: boolean;
}

export function PageLayout({
	children,
	className = '',
	variant = 'subtle',
	showBackground = true,
}: PageLayoutProps) {
	return (
		<div
			className={`flex flex-col min-h-[calc(100vh-4rem)] min-w-0 bg-background pb-32 px-4 sm:px-6 lg:px-8 overflow-x-hidden ${className}`}
		>
			{showBackground && <BackgroundMesh variant={variant} />}
			<main className="max-w-6xl mx-auto w-full pt-6 sm:pt-8 space-y-8 sm:space-y-12 relative z-10">
				{children}
			</main>
		</div>
	);
}

interface PageHeaderProps {
	title: string;
	subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
	return (
		<div className="space-y-2">
			<h1 className="text-3xl font-black text-foreground tracking-tight font-display">{title}</h1>
			{subtitle && <p className="text-muted-foreground font-medium">{subtitle}</p>}
		</div>
	);
}
