import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { dbManager } from '@/lib/db';
import { getAuth, type SessionUser } from '@/lib/auth';
import AdminDashboardClient from './AdminDashboardClient';

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
