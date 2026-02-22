import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth, type SessionUser } from '@/lib/auth';
import CMSScreen from '@/screens/CMS';

export const metadata: Metadata = {
	title: 'CMS | MatricMaster AI',
	description: 'Content management system for administrators.',
};

export default async function CMSPage() {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if ((session?.user as SessionUser | undefined)?.role !== 'admin') {
		redirect('/');
	}

	return <CMSScreen />;
}
