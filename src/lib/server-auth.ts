import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import type { SessionUser } from './auth';

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

	const userRole = (session.user as SessionUser).role || 'user';

	if (userRole !== 'admin') {
		redirect('/dashboard');
	}

	return session;
}
