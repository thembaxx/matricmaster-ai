'use client';

import { LaptopSettingsIcon, MoonIcon, Sun01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Theme } from '@/stores/useThemeStore';

interface SidebarThemeToggleProps {
	theme: string;
	onSetTheme: (theme: Theme) => void;
}

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun01Icon; color: string }[] = [
	{ value: 'system', label: 'system', icon: LaptopSettingsIcon, color: 'text-violet-500' },
	{ value: 'light', label: 'light', icon: Sun01Icon, color: 'text-amber-500' },
	{ value: 'dark', label: 'dark', icon: MoonIcon, color: 'text-blue-400' },
];

export function SidebarThemeToggle({ theme, onSetTheme }: SidebarThemeToggleProps) {
	const currentIndex = THEME_OPTIONS.findIndex((opt) => opt.value === theme);
	const current = THEME_OPTIONS[currentIndex >= 0 ? currentIndex : 0];

	const handleCycle = () => {
		const nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
		onSetTheme(THEME_OPTIONS[nextIndex].value);
	};

	return (
		<Button
			type="button"
			variant="ghost"
			onClick={handleCycle}
			className="w-full flex items-center justify-between px-4 py-2.5 h-auto rounded-xl bg-sidebar-accent/40 hover:bg-sidebar-accent transition-colors group focus-visible:ring-2 focus-visible:ring-primary"
		>
			<span className="text-xs font-medium text-sidebar-foreground/70">{current.label}</span>
			<div className="w-7 h-7 rounded-lg bg-sidebar flex items-center justify-center shadow-sm">
				<HugeiconsIcon icon={current.icon} className={cn('w-4 h-4', current.color)} />
			</div>
		</Button>
	);
}
