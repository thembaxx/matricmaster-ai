import { headers } from 'next/headers';
import { getAuth, type SessionUser } from '@/lib/auth';

/**
 * Ensures the current user is authenticated and returns the user object
 */
export async function ensureAuthenticated() {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user) {
		throw new Error('Unauthorized: Authentication required');
	}
	return session.user;
}

/**
 * Ensures the current user has admin privileges
 */
export async function ensureAdmin() {
	const user = await ensureAuthenticated();
	if ((user as SessionUser).role !== 'admin') {
		throw new Error('Unauthorized: Admin access required');
	}
	return user;
}
