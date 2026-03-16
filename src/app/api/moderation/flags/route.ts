import { type NextRequest, NextResponse } from 'next/server';
import { getAuth, type SessionUser } from '@/lib/auth';
import {
	actionFlagAction,
	createContentFlagAction,
	dismissFlagAction,
	getContentFlagsAction,
} from '@/lib/db/actions';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const runtime = 'nodejs';

const ALLOWED_FLAG_STATUSES = ['pending', 'reviewed', 'actioned', 'dismissed'] as const;
type FlagStatus = (typeof ALLOWED_FLAG_STATUSES)[number];

function isValidFlagStatus(value: unknown): value is FlagStatus {
	return typeof value === 'string' && ALLOWED_FLAG_STATUSES.includes(value as any);
}

// GET /api/moderation/flags - Get content flags (admin only)
export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check if admin using role instead of email
		const isAdmin = (session.user as SessionUser).role === 'admin';
		if (!isAdmin) {
			return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
		}

		const searchParams = request.nextUrl.searchParams;
		const status = searchParams.get('status');

		// Validate status parameter if provided
		if (status !== null && !isValidFlagStatus(status)) {
			return NextResponse.json(
				{ error: `Invalid status. Must be one of: ${ALLOWED_FLAG_STATUSES.join(', ')}` },
				{ status: 400 }
			);
		}

		const flags = await getContentFlagsAction((status as FlagStatus | undefined) ?? undefined);
		return NextResponse.json({ success: true, data: flags });
	} catch (error) {
		console.error('[API] Error fetching flags:', error);
		return NextResponse.json({ error: 'Failed to fetch flags' }, { status: 500 });
	}
}

// POST /api/moderation/flags - Create a new flag
export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { contentType, contentId, flagReason, contentPreview, flagDetails } = body;

		if (!contentType || !contentId || !flagReason) {
			return NextResponse.json(
				{ error: 'Missing required fields: contentType, contentId, flagReason' },
				{ status: 400 }
			);
		}

		const flag = await createContentFlagAction(
			session.user.id,
			contentType,
			contentId,
			flagReason,
			contentPreview,
			flagDetails
		);

		return NextResponse.json({ success: true, data: flag });
	} catch (error) {
		console.error('[API] Error creating flag:', error);
		return NextResponse.json({ error: 'Failed to create flag' }, { status: 500 });
	}
}

// PUT /api/moderation/flags - Dismiss or action a flag (admin only)
export async function PUT(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check if admin using role instead of email
		const isAdmin = (session.user as SessionUser).role === 'admin';
		if (!isAdmin) {
			return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
		}

		const searchParams = request.nextUrl.searchParams;
		const flagId = searchParams.get('id');
		const action = searchParams.get('action'); // 'dismiss' or 'action'

		if (!flagId || !action) {
			return NextResponse.json(
				{ error: 'Missing required parameters: id, action' },
				{ status: 400 }
			);
		}

		// biome-ignore lint/suspicious/noImplicitAnyLet: This is a simple way to handle the two actions without duplicating code, and the type is clear from the context.
		let result;
		if (action === 'dismiss') {
			result = await dismissFlagAction(flagId, session.user.id);
		} else if (action === 'action') {
			result = await actionFlagAction(flagId, session.user.id);
		} else {
			return NextResponse.json(
				{ error: 'Invalid action. Use "dismiss" or "action"' },
				{ status: 400 }
			);
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error('[API] Error updating flag:', error);
		return NextResponse.json({ error: 'Failed to update flag' }, { status: 500 });
	}
}
