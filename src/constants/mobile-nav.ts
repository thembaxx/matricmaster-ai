import { NAV_SECTIONS } from '@/components/Layout/navigation-data';

export type MobileNavItem = {
	href: string;
	label: string;
	icon?: string;
	fluentEmoji?: string;
};

export type MobileNavSection = {
	title: string;
	items: MobileNavItem[];
};

export const MOBILE_NAV_SECTIONS: MobileNavSection[] = NAV_SECTIONS.map((section) => ({
	...section,
	items: section.items.map((item) => ({
		href: item.href,
		label: item.label,
		icon: item.icon ? 'icon' : undefined,
		fluentEmoji: item.fluentEmoji,
	})),
}));
