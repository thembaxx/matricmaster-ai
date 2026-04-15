'use client';

import { m } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	return (
		<m.div
			key={pathname}
			initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
			animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
			transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
			className="h-full w-full"
		>
			{children}
		</m.div>
	);
}
