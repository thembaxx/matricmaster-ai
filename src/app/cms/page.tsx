import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { ClientOnly } from '@/components/ClientOnly';
import { getAuth, type SessionUser } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import CMSScreen from '@/screens/CMS';

export const metadata: Metadata = {
	title: 'CMS | MatricMaster',
	description: 'Content management system for administrators.',
};

export default async function CMSPage() {
	// Initialize database connection for the server request
	await dbManager.initialize();

	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if ((session?.user as SessionUser | undefined)?.role !== 'admin') {
		redirect('/');
	}

	return (
		<Suspense fallback={null}>
			<ClientOnly>
				<CMSScreen />
			</ClientOnly>
		</Suspense>
	);
}
