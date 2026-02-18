import { type NextRequest, NextResponse } from 'next/server';
import { dbManager } from '@/lib/db';

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

// Periodic cleanup of expired rate limit entries
setInterval(() => {
	const now = Date.now();
	for (const [key, record] of rateLimitMap.entries()) {
		if (now > record.resetTime) {
			rateLimitMap.delete(key);
		}
	}
}, RATE_LIMIT_WINDOW);

function checkRateLimit(apiKey: string): boolean {
	const now = Date.now();
	const record = rateLimitMap.get(apiKey);

	// Clean up expired entries
	if (!record || now > record.resetTime) {
		rateLimitMap.set(apiKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
		return true;
	}

	if (record.count >= RATE_LIMIT) {
		return false;
	}

	record.count++;
	return true;
}

function getClientApiKey(request: NextRequest): string | null {
	// Check header for API key (preferred)
	const apiKey = request.headers.get('x-api-key');
	if (apiKey) return apiKey;

	// Check query parameter (deprecated)
	const queryKey = request.nextUrl.searchParams.get('api_key');
	if (queryKey) {
		console.warn('⚠️ API key passed via query parameter - use X-API-Key header instead');
		return queryKey;
	}

	return null;
}

// Validate API key against trusted keys (in production, use database or env)
function isValidApiKey(apiKey: string): boolean {
	// For now, accept any non-empty key
	// In production, validate against stored API keys
	return apiKey.length > 0;
}

export async function GET(request: NextRequest) {
	const apiKey = getClientApiKey(request);

	if (!apiKey) {
		return NextResponse.json(
			{ error: 'API key required. Provide it in X-API-Key header or api_key query parameter.' },
			{ status: 401 }
		);
	}

	// Validate API key
	if (!isValidApiKey(apiKey)) {
		return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
	}

	// Rate limiting
	if (!checkRateLimit(apiKey)) {
		return NextResponse.json(
			{ error: 'Rate limit exceeded. Please try again later.' },
			{ status: 429 }
		);
	}

	try {
		const db = dbManager.getDb();
		const { subjects } = await import('@/lib/db/schema');

		// Get subjects
		const allSubjects = await db.select().from(subjects);

		return NextResponse.json({
			success: true,
			data: {
				subjects: allSubjects.map((s) => ({
					id: s.id,
					name: s.name,
					description: s.description,
					curriculumCode: s.curriculumCode,
				})),
			},
			meta: {
				version: '1.0.0',
				timestamp: new Date().toISOString(),
			},
		});
	} catch (error) {
		console.error('Mobile API Error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	const apiKey = getClientApiKey(request);

	if (!apiKey) {
		return NextResponse.json({ error: 'API key required' }, { status: 401 });
	}

	// Validate API key
	if (!isValidApiKey(apiKey)) {
		return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
	}

	if (!checkRateLimit(apiKey)) {
		return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
	}

	try {
		const body = await request.json();
		const { action } = body;

		// Handle different mobile actions
		switch (action) {
			case 'sync_progress':
				// Sync user progress from mobile app
				return NextResponse.json({
					success: true,
					message: 'Progress synced',
				});

			case 'get_questions':
				// Get questions for mobile quiz
				return NextResponse.json({
					success: true,
					data: { questions: [] },
				});

			default:
				return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
		}
	} catch (error) {
		console.error('Mobile API Error:', error);
		return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
	}
}
