import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import type { SessionUser } from './auth';

function extractHeaders(headersList: any) {
	const safeHeaders = new Headers();
	for (const [key, value] of headersList.entries()) {
		safeHeaders.set(key, value);
	}
	return safeHeaders as Headers;
}

export async function requireAuth() {
	const auth = await getAuth();
	if (!auth?.api) {
		redirect('/login');
	}
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: extractHeaders(headersList) as any });

	if (!session?.user) {
		redirect('/login');
	}

	return session;
}

export async function optionalAuth() {
	const auth = await getAuth();
	if (!auth?.api) {
		return null;
	}
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: extractHeaders(headersList) as any });
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
