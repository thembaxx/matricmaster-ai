import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';

export async function requireAuth() {
	const auth = await getAuth();
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });

	if (!session?.user) {
		redirect('/sign-in');
	}

	return session;
}

export async function optionalAuth() {
	const auth = await getAuth();
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });
	return session;
}

export async function requireAdmin() {
	const session = await requireAuth();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any

	const userRole = (session.user as any).role || 'user';

	if (userRole !== 'admin') {
		redirect('/dashboard');
	}

	return session;
}
