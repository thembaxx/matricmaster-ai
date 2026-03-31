import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth, type SessionUser } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import AdminDashboardClient from './AdminDashboardClient';

export const revalidate = 0;

export default async function AdminDashboardPage() {
	// Initialize database connection
	await dbManager.initialize();

	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if ((session?.user as SessionUser | undefined)?.role !== 'admin') {
		redirect('/');
	}

	return <AdminDashboardClient initialSession={session} />;
}
