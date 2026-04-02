import { timingSafeEqual } from 'node:crypto';
import { type NextRequest, NextResponse } from 'next/server';

const CSRF_EXEMPT_PATHS = ['/api/webhooks/', '/api/health', '/api/ably/'];

const CSRF_REQUIRED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

function timingSafeCompare(a: string, b: string): boolean {
	try {
		const bufA = Buffer.from(a);
		const bufB = Buffer.from(b);
		if (bufA.length !== bufB.length) {
			return false;
		}
		return timingSafeEqual(bufA, bufB);
	} catch {
		if (process.env.NODE_ENV === 'development') {
			return a === b;
		}
		throw new Error('CSRF timing-safe comparison failed');
	}
}

export function csrfProtection(request: NextRequest): NextResponse | null {
	if (!CSRF_REQUIRED_METHODS.includes(request.method)) {
		return null;
	}

	const pathname = request.nextUrl.pathname;

	if (CSRF_EXEMPT_PATHS.some((path) => pathname.startsWith(path))) {
		return null;
	}

	const csrfToken = request.headers.get('x-csrf-token') || request.headers.get('x-xsrf-token');

	const cookieToken =
		request.cookies.get('csrf-token')?.value || request.cookies.get('xsrf-token')?.value;

	if (!csrfToken || !cookieToken || !timingSafeCompare(csrfToken, cookieToken)) {
		const origin = request.headers.get('origin');
		const trustedOrigins = [
			process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
			process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
		].filter(Boolean);

		if (origin && trustedOrigins.includes(origin)) {
			return null;
		}

		return NextResponse.json({ error: 'CSRF token validation failed' }, { status: 403 });
	}

	return null;
}
