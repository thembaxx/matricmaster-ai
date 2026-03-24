'use client';

import { useMemo, useState } from 'react';
import { type MenuSection, sideMenuSections } from './sidebar-menu-data';

interface UseSidebarMenuReturn {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	openSection: string | null;
	setOpenSection: (section: string | null) => void;
	filteredSections: MenuSection[];
	handleSectionToggle: (sectionTitle: string) => void;
}

export function useSidebarMenu(): UseSidebarMenuReturn {
	const [searchQuery, setSearchQuery] = useState('');
	const [openSection, setOpenSection] = useState<string | null>('learning');

	const filteredSections = useMemo(() => {
		if (!searchQuery.trim()) return sideMenuSections;

		const query = searchQuery.toLowerCase();
		return sideMenuSections
			.map((section) => ({
				...section,
				items: section.items.filter((item) => item.label.toLowerCase().includes(query)),
			}))
			.filter((section) => section.items.length > 0);
	}, [searchQuery]);

	const hasOpenSection = filteredSections.some((s) => s.title === openSection);
	const shouldAutoOpen = searchQuery.trim() && filteredSections.length > 0 && !hasOpenSection;
	const initialSection = filteredSections[0]?.title ?? openSection;
	const computedOpenSection = shouldAutoOpen ? initialSection : openSection;

	const handleSectionToggle = (sectionTitle: string) => {
		setOpenSection((current) => (current === sectionTitle ? null : sectionTitle));
	};

	return {
		searchQuery,
		setSearchQuery,
		openSection: computedOpenSection,
		setOpenSection,
		filteredSections,
		handleSectionToggle,
	};
}
