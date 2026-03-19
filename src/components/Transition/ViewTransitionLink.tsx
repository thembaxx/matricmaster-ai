'use client';

import Link, { type LinkProps } from 'next/link';

type TransitionType = 'fade' | 'slide' | 'slide-up' | 'slide-down' | 'none';

interface ViewTransitionLinkProps extends Omit<LinkProps<string>, 'href'> {
	href: string;
	children: React.ReactNode;
	transitionTypes?: TransitionType[];
	className?: string;
}

export function ViewTransitionLink({
	href,
	children,
	transitionTypes = ['fade'],
	className,
	...props
}: ViewTransitionLinkProps) {
	return (
		<Link href={href} transitionTypes={transitionTypes} className={className} {...props}>
			{children}
		</Link>
	);
}

export type { TransitionType };
