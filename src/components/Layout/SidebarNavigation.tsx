'use client';

import { ArrowDown01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { SidebarGroup, SidebarSeparator } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { SidebarMenuSection } from './SidebarMenuSection';
import type { MenuSection } from './sidebar-menu-data';

interface SidebarNavigationProps {
	filteredSections: MenuSection[];
	openSection: string | null;
	onSectionToggle: (title: string) => void;
	pathname: string;
	onLinkClick: () => void;
}

export function SidebarNavigation({
	filteredSections,
	openSection,
	onSectionToggle,
	pathname,
	onLinkClick,
}: SidebarNavigationProps) {
	if (filteredSections.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-sidebar-foreground/40">
				<HugeiconsIcon icon={Search01Icon} className="w-8 h-8 mb-2" />
				<p className="text-sm">no results found</p>
			</div>
		);
	}

	return (
		<>
			{filteredSections.map((section, index) => (
				<div key={section.title}>
					<SidebarGroup className="py-1">
						<button
							type="button"
							onClick={() => onSectionToggle(section.title)}
							className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
						>
							<span className="text-[9px] font-medium tracking-wider text-sidebar-foreground/35 grow truncate text-left">
								{section.title}
							</span>
							<HugeiconsIcon
								icon={ArrowDown01Icon}
								className={cn(
									'w-3 h-3 transition-transform duration-200',
									openSection === section.title
										? 'rotate-180 text-sidebar-foreground/70'
										: 'text-sidebar-foreground/30'
								)}
							/>
						</button>
						<div
							className={cn(
								'overflow-hidden transition-all duration-200',
								openSection === section.title ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
							)}
						>
							<SidebarMenuSection
								items={section.items}
								pathname={pathname}
								onLinkClick={onLinkClick}
							/>
						</div>
					</SidebarGroup>
					{index < filteredSections.length - 1 && (
						<SidebarSeparator className="bg-sidebar-border/20 my-1" />
					)}
				</div>
			))}
		</>
	);
}
