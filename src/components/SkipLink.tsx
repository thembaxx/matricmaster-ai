'use client';

import { usePathname } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

interface SkipLinkProps {
	children: ReactNode;
	mainId?: string;
}

export function SkipLink({ children, mainId = 'main-content' }: SkipLinkProps) {
	const pathname = usePathname();

	useEffect(() => {
		// Focus management: move focus to main content on route change
		const main = document.getElementById(mainId);
		if (main) {
			main.focus();
		}
	}, [pathname, mainId]);

	return (
		<>
			<a
				href={`#${mainId}`}
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
			>
				Skip to main content
			</a>
			{children}
		</>
	);
}
