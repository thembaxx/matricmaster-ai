'use client';

import { Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useDeferredValue, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

interface SidebarSearchInputProps {
	value: string;
	onChange: (value: string) => void;
}

export function SidebarSearchInput({ value, onChange }: SidebarSearchInputProps) {
	const [localValue, setLocalValue] = useState(value);
	const [isDebouncing, setIsDebouncing] = useState(false);
	const _deferredValue = useDeferredValue(localValue);

	useEffect(() => {
		if (localValue !== value) {
			setIsDebouncing(true);
			const timer = setTimeout(() => {
				onChange(localValue);
				setIsDebouncing(false);
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [localValue, onChange, value]);

	return (
		<div className="relative flex items-center px-2 mt-2">
			<HugeiconsIcon
				icon={Search01Icon}
				className={`absolute left-5 w-4 h-4 text-sidebar-foreground/50 transition-opacity ${isDebouncing ? 'animate-pulse' : ''}`}
			/>
			<Input
				placeholder="search..."
				value={localValue}
				onChange={(e) => setLocalValue(e.target.value)}
				className="pl-9 h-9 dark:bg-sidebar-accent/60 placeholder:text-sidebar-foreground/40 border-sidebar-border/50 focus-visible:ring-sidebar-ring rounded-lg shadow-none text-sm"
			/>
		</div>
	);
}
