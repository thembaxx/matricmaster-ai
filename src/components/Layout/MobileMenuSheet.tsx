'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

export function MobileMenuSheet() {
	const { toggleSidebar } = useSidebar();

	return (
		<Button
			variant="ghost"
			size="icon"
			className="w-10 h-10 rounded-xl ios-glass active:scale-95 transition-all"
			onClick={toggleSidebar}
			aria-label="Open navigation menu"
		>
			<Menu className="w-5 h-5 text-foreground" />
		</Button>
	);
}
