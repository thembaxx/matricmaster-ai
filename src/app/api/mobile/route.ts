import { type NextRequest, NextResponse } from 'next/server';
import { dbManager } from '@/lib/db';

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(apiKey: string): boolean {
	const now = Date.now();
	const record = rateLimitMap.get(apiKey);

	// Clean up expired entries when accessing
	if (!record || now > record.resetTime) {
		// Delete expired entry before creating new one
		if (record && now > record.resetTime) {
			rateLimitMap.delete(apiKey);
		}
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
	// Check header for API key (preferred method)
	const apiKey = request.headers.get('x-api-key');
	if (apiKey) return apiKey;

	return null;
}

// Validate API key against trusted keys from environment
function isValidApiKey(apiKey: string): boolean {
	if (!apiKey || apiKey.length === 0) {
		return false;
	}

	// In production, validate against configured trusted API keys
	// Format: comma-separated list in environment variable
	const trustedKeys = process.env.TRUSTED_API_KEYS;
	if (trustedKeys) {
		const validKeys = trustedKeys.split(',').map((k) => k.trim());
		return validKeys.includes(apiKey);
	}

	// In development, accept a single key from env or reject all
	const devApiKey = process.env.MOBILE_API_KEY;
	if (devApiKey) {
		return apiKey === devApiKey;
	}

	// No keys configured - reject all in production, accept in dev
	return process.env.NODE_ENV !== 'production';
}

export async function GET(request: NextRequest) {
	const apiKey = getClientApiKey(request);

	if (!apiKey) {
		return NextResponse.json(
			{ error: 'api key required. provide it in x-api-key header.' },
			{ status: 401 }
		);
	}

	// Validate API key
	if (!isValidApiKey(apiKey)) {
		return NextResponse.json({ error: 'invalid api key' }, { status: 401 });
	}

	// Rate limiting
	if (!checkRateLimit(apiKey)) {
		return NextResponse.json(
			{ error: 'rate limit exceeded. please try again later.' },
			{ status: 429 }
		);
	}

	try {
		await dbManager.initialize();
		const db = dbManager.getDb();
		const { subjects } = await import('@/lib/db/schema');

		// Get subjects
		const allSubjects = await db.select().from(subjects);

		return NextResponse.json({
			success: true,
			data: {
				subjects: allSubjects.map((s: (typeof allSubjects)[number]) => ({
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
		console.debug('mobile api error:', error);
		if (!apiKey) {
			return NextResponse.json(
				{ error: 'api key required. provide it in x-api-key header.' },
				{ status: 401 }
			);
		}
		return NextResponse.json({ error: 'internal server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	const apiKey = getClientApiKey(request);

	if (!apiKey) {
		return NextResponse.json({ error: 'api key required' }, { status: 401 });
	}

	// Validate API key
	if (!isValidApiKey(apiKey)) {
		return NextResponse.json({ error: 'invalid api key' }, { status: 401 });
	}

	if (!checkRateLimit(apiKey)) {
		return NextResponse.json({ error: 'rate limit exceeded' }, { status: 429 });
	}

	try {
		await dbManager.initialize();
		const body = await request.json();
		const { action } = body;

		// Handle different mobile actions
		switch (action) {
			case 'sync_progress':
				// Sync user progress from mobile app
				return NextResponse.json({
					success: true,
					message: 'progress synced',
				});

			case 'get_questions':
				// Get questions for mobile quiz
				return NextResponse.json({
					success: true,
					data: { questions: [] },
				});

			default:
				return NextResponse.json({ error: 'unknown action' }, { status: 400 });
		}
	} catch (error) {
		console.debug('mobile api error:', error);
		return NextResponse.json({ error: 'invalid request body' }, { status: 400 });
	}
}
