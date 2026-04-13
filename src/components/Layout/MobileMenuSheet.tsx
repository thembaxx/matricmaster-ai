'use client';

import { Menu01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

export function MobileMenuSheet() {
	const { toggleSidebar } = useSidebar();

	return (
		<m.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ type: 'spring', stiffness: 300, damping: 28 }}
		>
			<Button
				variant="ghost"
				size="icon"
				className="w-11 h-11 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-tiimo hover:bg-card active:scale-95 transition-all"
				onClick={toggleSidebar}
				aria-label="Open navigation menu"
			>
				<HugeiconsIcon icon={Menu01Icon} className="w-5 h-5 text-foreground" />
			</Button>
		</m.div>
	);
}
