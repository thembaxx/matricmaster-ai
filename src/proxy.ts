import { getSessionCookie } from 'better-auth/cookies';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Route categorization for better organization and security
export const ROUTE_CATEGORIES = {
	// Routes that don't require any authentication
	PUBLIC: [
		'/',
		'/sign-in',
		'/sign-up',
		'/forgot-password',
		'/api/auth',
		'/api/db/init',
		'/onboarding',
		'/api/health',
		'/api/csp-report',
		'/api/uploadthing',
	],

	// Routes that are public but may have enhanced features for authenticated users
	CONTENT: [
		'/search',
		'/past-papers',
		'/physics',
		'/lessons',
		'/api/past-papers',
		'/api/lessons',
		'/api/search',
	],

	// Routes that require authentication
	PROTECTED: [
		'/dashboard',
		'/profile',
		'/settings',
		'/tutor',
		'/study-plan',
		'/study-buddies',
		'/bookmarks',
		'/notifications',
		'/achievements',
		'/leaderboard',
		'/quiz',
		'/interactive-quiz',
		'/practice-quiz',
		'/math-quiz',
		'/physics-quiz',
		'/test',
		'/review',
		'/calendar',
		'/comments',
		'/channels',
		'/flashcards',
		'/lesson-complete',
		'/past-paper',
		'/language',
		'/onboarding',
		'/error-hint',
		'/api/progress',
		'/api/streak',
		'/api/sessions',
		'/api/user-progress',
		'/api/achievements',
		'/api/leaderboard',
		'/api/quiz',
		'/api/interactive-quiz',
		'/api/flashcards',
		'/api/study-plan',
		'/api/notifications',
		'/api/comments',
		'/api/channels',
	],

	// 2FA routes (require pending session - user signed in but needs to complete 2FA)
	TWO_FA: ['/2fa'],

	// Admin routes (require admin role - role check happens in page/route handler)
	ADMIN: ['/admin', '/cms', '/api/admin', '/api/cms', '/api/users'],
};

// API route patterns for mutation protection
export const API_MUTATION_PROTECTED = [
	'/api/progress',
	'/api/streak',
	'/api/sessions',
	'/api/user-progress',
	'/api/achievements',
	'/api/leaderboard',
	'/api/quiz',
	'/api/interactive-quiz',
	'/api/flashcards',
	'/api/study-plan',
	'/api/notifications',
	'/api/comments',
	'/api/channels',
	'/api/admin',
	'/api/cms',
	'/api/users',
] as const;

// Check if route matches any in the list
function matchesRoute(pathname: string, routes: string[]): boolean {
	return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

// Check if user has a valid session cookie
function hasSessionCookie(request: NextRequest): boolean {
	const sessionCookie = getSessionCookie(request);
	return !!sessionCookie;
}

// Log proxy activity in development
function logProxyActivity(pathname: string, authenticated: boolean, action: string) {
	if (process.env.NODE_ENV === 'development') {
		console.log(`[Proxy] ${action}: ${pathname} (Authenticated: ${authenticated})`);
	}
}

export default async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// 1. Allow public routes without authentication
	if (matchesRoute(pathname, ROUTE_CATEGORIES.PUBLIC)) {
		logProxyActivity(pathname, false, 'Public route');
		return NextResponse.next();
	}

	// 2. 2FA routes - allow access but verify session exists
	if (matchesRoute(pathname, ROUTE_CATEGORIES.TWO_FA)) {
		const hasCookie = hasSessionCookie(request);
		if (!hasCookie) {
			// No session at all - redirect to sign in
			const signInUrl = new URL('/sign-in', request.url);
			signInUrl.searchParams.set('callbackUrl', pathname);
			logProxyActivity(pathname, false, '2FA without session');
			return NextResponse.redirect(signInUrl);
		}
		// Allow 2FA verification flow to proceed
		logProxyActivity(pathname, true, '2FA verification');
		return NextResponse.next();
	}

	// 3. Check for API routes
	if (pathname.startsWith('/api/')) {
		// Allow public API routes
		if (matchesRoute(pathname, ROUTE_CATEGORIES.PUBLIC)) {
			logProxyActivity(pathname, false, 'Public API');
			return NextResponse.next();
		}

		// For mutation methods (POST, PUT, DELETE, PATCH), require auth
		if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
			const hasCookie = hasSessionCookie(request);
			if (!hasCookie) {
				logProxyActivity(pathname, false, 'Unauthorized API mutation');
				return new NextResponse(
					JSON.stringify({ error: 'Unauthorized', message: 'Authentication required' }),
					{
						status: 401,
						headers: { 'Content-Type': 'application/json' },
					}
				);
			}
			logProxyActivity(pathname, true, 'Authorized API mutation');
			return NextResponse.next();
		}

		// GET requests to API - allow but session will be validated in route handler
		logProxyActivity(pathname, hasSessionCookie(request), 'API GET request');
		return NextResponse.next();
	}

	// 4. Protected routes - require authentication
	if (matchesRoute(pathname, ROUTE_CATEGORIES.PROTECTED)) {
		const hasCookie = hasSessionCookie(request);
		if (!hasCookie) {
			const signInUrl = new URL('/sign-in', request.url);
			signInUrl.searchParams.set('callbackUrl', pathname);
			logProxyActivity(pathname, false, 'Protected route without auth');
			return NextResponse.redirect(signInUrl);
		}
		logProxyActivity(pathname, true, 'Protected route');
		return NextResponse.next();
	}

	// 5. Admin routes - require authentication (role check in page/route handler)
	if (matchesRoute(pathname, ROUTE_CATEGORIES.ADMIN)) {
		const hasCookie = hasSessionCookie(request);
		if (!hasCookie) {
			const signInUrl = new URL('/sign-in', request.url);
			signInUrl.searchParams.set('callbackUrl', pathname);
			logProxyActivity(pathname, false, 'Admin route without auth');
			return NextResponse.redirect(signInUrl);
		}
		// Role verification happens in the page/route handler
		logProxyActivity(pathname, true, 'Admin route');
		return NextResponse.next();
	}

	// 6. Public content routes (auth optional for enhanced features)
	if (matchesRoute(pathname, ROUTE_CATEGORIES.CONTENT)) {
		logProxyActivity(pathname, hasSessionCookie(request), 'Public content route');
		return NextResponse.next();
	}

	// 7. Default: Allow access (catches any routes not explicitly listed)
	logProxyActivity(pathname, hasSessionCookie(request), 'Default route');
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
