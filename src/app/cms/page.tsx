import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { appConfig } from '@/app.config';
import { ClientOnly } from '@/components/ClientOnly';
import { getAuth, type SessionUser } from '@/lib/auth';
import { dbManager } from '@/lib/db';

const CMSScreen = dynamic(() => import('@/screens/CMS'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh]" />,
});

export const metadata: Metadata = {
	title: `CMS | ${appConfig.name} AI`,
	description: 'Content management system for administrators.',
};

export const revalidate = 0;

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
