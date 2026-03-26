import { type NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
	'/dashboard',
	'/quiz',
	'/ai-tutor',
	'/settings',
	'/flashcards',
	'/study-plan',
	'/past-papers',
	'/analytics',
	'/achievements',
	'/search',
	'/profile',
	'/notifications',
	'/calendar',
	'/buddies',
	'/bookmarks',
	'/parent',
	'/leaderboard',
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/sign-in', '/sign-up'];

// Rate limiting store (in-memory for development, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

/**
 * Check if a path matches any route pattern
 */
function isProtectedRoute(pathname: string): boolean {
	return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Check if path is an auth route
 */
function isAuthRoute(pathname: string): boolean {
	return authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Check if path is an API route
 */
function isApiRoute(pathname: string): boolean {
	return pathname.startsWith('/api/');
}

/**
 * Check if path should be excluded from middleware processing
 */
function isExcludedPath(pathname: string): boolean {
	const excludedPaths = [
		'/api/auth/',
		'/api/health',
		'/api/csp-report',
		'/_next/',
		'/favicon.ico',
		'/robots.txt',
		'/sitemap.xml',
		'/public/',
		'/images/',
		'/fonts/',
	];
	return excludedPaths.some((path) => pathname.startsWith(path));
}

/**
 * Rate limiting check for API routes
 */
function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const record = rateLimitMap.get(ip);

	if (!record || now > record.resetTime) {
		rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
		return true;
	}

	if (record.count >= RATE_LIMIT_MAX) {
		return false;
	}

	record.count++;
	return true;
}

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimit(): void {
	const now = Date.now();
	for (const [key, record] of rateLimitMap.entries()) {
		if (now > record.resetTime) {
			rateLimitMap.delete(key);
		}
	}
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimit, 5 * 60 * 1000);

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Skip excluded paths
	if (isExcludedPath(pathname)) {
		return NextResponse.next();
	}

	// Rate limiting for API routes (except auth routes)
	if (isApiRoute(pathname) && !pathname.startsWith('/api/auth/')) {
		const ip =
			request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';

		if (!checkRateLimit(ip)) {
			return NextResponse.json(
				{ error: 'Too many requests', retryAfter: RATE_LIMIT_WINDOW / 1000 },
				{
					status: 429,
					headers: {
						'Retry-After': String(RATE_LIMIT_WINDOW / 1000),
						'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
						'X-RateLimit-Remaining': '0',
					},
				}
			);
		}
	}

	// For protected routes, check authentication
	if (isProtectedRoute(pathname)) {
		try {
			// Dynamically import auth to avoid circular dependencies
			const { getAuth } = await import('@/lib/auth');
			const auth = await getAuth();

			const session = await auth.api.getSession({
				headers: request.headers,
			});

			if (!session?.user) {
				// Redirect to sign-in with return URL
				const signInUrl = new URL('/sign-in', request.url);
				signInUrl.searchParams.set('callbackUrl', pathname);
				return NextResponse.redirect(signInUrl);
			}

			// Check if user is blocked (access as any since Better Auth extends user fields)
			const userData = session.user as Record<string, unknown>;
			if (userData.isBlocked === true) {
				const blockedUrl = new URL('/blocked', request.url);
				return NextResponse.redirect(blockedUrl);
			}

			// Add user info to headers for downstream use
			const response = NextResponse.next();
			response.headers.set('x-user-id', session.user.id);
			response.headers.set('x-user-email', session.user.email);
			response.headers.set('x-user-role', (userData.role as string) || 'user');

			return response;
		} catch (error) {
			console.error('[Middleware] Auth check failed:', error);
			// On error, redirect to sign-in
			const signInUrl = new URL('/sign-in', request.url);
			signInUrl.searchParams.set('callbackUrl', pathname);
			return NextResponse.redirect(signInUrl);
		}
	}

	// For auth routes, redirect to dashboard if already authenticated
	if (isAuthRoute(pathname)) {
		try {
			const { getAuth } = await import('@/lib/auth');
			const auth = await getAuth();

			const session = await auth.api.getSession({
				headers: request.headers,
			});

			if (session?.user) {
				// Check for callback URL
				const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
				const redirectUrl =
					callbackUrl && isProtectedRoute(callbackUrl) ? callbackUrl : '/dashboard';
				return NextResponse.redirect(new URL(redirectUrl, request.url));
			}
		} catch (error) {
			// If auth check fails, continue to auth page
			console.debug('[Middleware] Auth check for auth route failed:', error);
		}
	}

	// Add security headers to all responses
	const response = NextResponse.next();

	// Security headers
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('X-DNS-Prefetch-Control', 'on');

	// HSTS in production
	if (process.env.NODE_ENV === 'production') {
		response.headers.set(
			'Strict-Transport-Security',
			'max-age=63072000; includeSubDomains; preload'
		);
	}

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - static files (static/*)
		 * - image files (public/images/*)
		 * - font files (public/fonts/*)
		 * - _next static files
		 * - favicon.ico
		 */
		'/((?!_next/static|_next/image|favicon.ico|public/images|public/fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
	],
};
