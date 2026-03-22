import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { MOBILE_NAV_SECTIONS } from '@/constants/mobile-nav';
import { authClient } from '@/lib/auth-client';

export function useMobileNav() {
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const router = useRouter();

	const filteredSections = useMemo(() => {
		if (!searchQuery.trim()) return MOBILE_NAV_SECTIONS;
		const query = searchQuery.toLowerCase();
		return MOBILE_NAV_SECTIONS.map((section) => ({
			...section,
			items: section.items.filter((item) => item.label.toLowerCase().includes(query)),
		})).filter((section) => section.items.length > 0);
	}, [searchQuery]);

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push('/sign-in');
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
