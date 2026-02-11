import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/sign-in', '/sign-up', '/forgot-password', '/api/auth', '/api/db/init'];

// Check if a route is public
function isPublicRoute(pathname: string): boolean {
	return publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

// Check if user has a valid session via Better Auth cookie
function hasSession(request: NextRequest): boolean {
	// Check for Better Auth session cookie
	const sessionCookie = request.cookies.get('better-auth.session');
	const sessionToken = request.cookies.get('better-auth.session_token');

	// Also check for anonymous session
	const anonymousCookie = request.cookies.get('better-auth.anonymous');

	return !!(sessionCookie?.value || sessionToken?.value || anonymousCookie?.value);
}

export default function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Allow access to public routes without authentication
	if (isPublicRoute(pathname)) {
		return NextResponse.next();
	}

	// Check if user is authenticated
	if (!hasSession(request)) {
		// Redirect to sign-in page
		const signInUrl = new URL('/sign-in', request.url);
		// Add the original URL as a callback parameter
		signInUrl.searchParams.set('callbackUrl', pathname);
		return NextResponse.redirect(signInUrl);
	}

	// User is authenticated, allow access
	return NextResponse.next();
}

// Configure which routes the proxy should run on
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
