'use client';

import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAccessibilityStore } from '@/services/accessibility-service';

interface BreadcrumbItem {
	label: string;
	href?: string;
	active?: boolean;
}

interface ProgressBreadcrumbsProps {
	items: BreadcrumbItem[];
	className?: string;
}

export function ProgressBreadcrumbs({ items, className = '' }: ProgressBreadcrumbsProps) {
	const settings = useAccessibilityStore();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted || !settings.progressBreadcrumbs) return null;

	return (
		<nav className={`progress-breadcrumbs ${className}`} aria-label="Progress">
			<ol className="flex items-center gap-1 list-none p-0 m-0">
				{items.map((item, index) => (
					<li key={index} className="flex items-center">
						{index > 0 && (
							<ChevronRightIcon className="h-4 w-4 mx-1 text-muted-foreground" aria-hidden="true" />
						)}
						{item.active ? (
							<span className="crumb active" aria-current="page">
								{item.label}
							</span>
						) : item.href ? (
							<Link href={item.href} className="crumb hover:underline">
								{item.label}
							</Link>
						) : (
							<span className="crumb">{item.label}</span>
						)}
					</li>
				))}
			</ol>
		</nav>
	);
}
