import { NextResponse } from 'next/server';

/**
 * CSP Report Endpoint
 *
 * Handles Content Security Policy violation reports sent by browsers.
 * The CSP header in next.config.mjs includes: report-uri /api/csp-report;
 *
 * This endpoint receives JSON CSP violation reports and logs them for debugging.
 * In production, you could extend this to store violations in a database
 * or send them to a monitoring service like Sentry.
 */
export async function POST(request: Request) {
	try {
		const cspReport = await request.json();

		// Log the CSP violation for debugging
		console.log('[CSP Report]', JSON.stringify(cspReport, null, 2));

		// In production, you could:
		// - Store violations in a database for analysis
		// - Send to a monitoring service
		// - Aggregate and alert on critical violations

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		console.debug('[CSP Report Error]', error);
		return NextResponse.json(
			{ error: 'Failed to process CSP report' },
			{ status: 200 } // Still return 200 to prevent browser loops
		);
	}
}

// Handle other HTTP methods
export async function GET() {
	return NextResponse.json(
		{ message: 'CSP Report endpoint - POST violations here' },
		{ status: 200 }
	);
}
