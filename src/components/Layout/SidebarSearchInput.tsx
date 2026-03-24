'use client';

import { Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Input } from '@/components/ui/input';

interface SidebarSearchInputProps {
	value: string;
	onChange: (value: string) => void;
}

export function SidebarSearchInput({ value, onChange }: SidebarSearchInputProps) {
	return (
		<div className="relative flex items-center px-2 mt-2">
			<HugeiconsIcon
				icon={Search01Icon}
				className="absolute left-5 w-4 h-4 text-sidebar-foreground/50"
			/>
			<Input
				placeholder="search..."
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="pl-9 h-9 dark:bg-sidebar-accent/60 placeholder:text-sidebar-foreground/40 border-sidebar-border/50 focus-visible:ring-sidebar-ring rounded-lg shadow-none text-sm"
			/>
		</div>
	);
}
