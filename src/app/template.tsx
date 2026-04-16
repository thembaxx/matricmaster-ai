'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useNavigationTransition, ViewTransition } from '@/components/Transition/ViewTransition';

export default function Template({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { forward, back } = useNavigationTransition();

	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const anchor = target.closest('a');
			if (!anchor) return;

			const href = anchor.getAttribute('href');
			if (
				!href ||
				href.startsWith('#') ||
				href.startsWith('http') ||
				href.startsWith('mailto:') ||
				href.startsWith('tel:')
			)
				return;

			e.preventDefault();

			const isBack =
				href.length < pathname.length || (pathname.startsWith(href) && href !== pathname);

			if (isBack) {
				back(href);
			} else {
				forward(href);
			}
		};

		document.addEventListener('click', handleClick, true);
		return () => document.removeEventListener('click', handleClick, true);
	}, [pathname, forward, back]);

	return (
		<ViewTransition
			enter={{
				'nav-forward': 'vt-slide-from-right',
				'nav-back': 'vt-slide-from-left',
				default: 'vt-fade-in',
			}}
			exit={{
				'nav-forward': 'vt-slide-to-left',
				'nav-back': 'vt-slide-to-right',
				default: 'vt-fade-out',
			}}
			default="none"
		>
			<div key={pathname} className="h-full w-full">
				{children}
			</div>
		</ViewTransition>
	);
}
