import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { NAV_SECTIONS, type NavSection } from '@/components/Layout/navigation-data';
import { authClient } from '@/lib/auth-client';

export function useMobileNav() {
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const router = useRouter();

	const filteredSections: NavSection[] = useMemo(() => {
		if (!searchQuery.trim()) return NAV_SECTIONS;
		const query = searchQuery.toLowerCase();
		return NAV_SECTIONS.map((section) => ({
			...section,
			items: section.items.filter((item) => item.label.toLowerCase().includes(query)),
		})).filter((section) => section.items.length > 0);
	}, [searchQuery]);

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push('/login');
		setOpen(false);
	};

	const handleNavigation = (href: string) => {
		setOpen(false);
		setSearchQuery('');
		router.push(href);
	};

	return {
		open,
		setOpen,
		searchQuery,
		setSearchQuery,
		filteredSections,
		handleSignOut,
		handleNavigation,
	};
}
