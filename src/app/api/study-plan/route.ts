import { type NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { getAuth } from '@/lib/auth';
import {
	createStudyPlanAction,
	deleteStudyPlanAction,
	getActiveStudyPlanAction,
	getStudyPlansAction,
	updateStudyPlanAction,
} from '@/lib/db/study-plan-actions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/study-plan - Get user's study plans
export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
		}

		const searchParams = request.nextUrl.searchParams;
		const active = searchParams.get('active');

		if (active === 'true') {
			const plan = await getActiveStudyPlanAction(session.user.id);
			return NextResponse.json({ success: true, data: plan });
		}

		const plans = await getStudyPlansAction(session.user.id);
		return NextResponse.json({ success: true, data: plans });
	} catch (error) {
		return handleApiError(error);
	}
}

// POST /api/study-plan - Create a study plan
export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { title, targetExamDate, focusAreas, weeklyGoals } = body;

		if (!title) {
			return NextResponse.json({ error: 'missing required field: title' }, { status: 400 });
		}

		// Validate and parse targetExamDate if provided
		let parsedTargetExamDate: Date | undefined;
		if (targetExamDate) {
			parsedTargetExamDate = new Date(targetExamDate);
			if (Number.isNaN(parsedTargetExamDate.getTime())) {
				return NextResponse.json({ error: 'invalid date format' }, { status: 400 });
			}
		}

		const result = await createStudyPlanAction(
			session.user.id,
			title,
			parsedTargetExamDate,
			focusAreas,
			weeklyGoals
		);

		if (!result.success) {
			throw new Error(result.error || 'failed to create study plan');
		}

		return NextResponse.json({ success: true, data: result.plan });
	} catch (error) {
		return handleApiError(error);
	}
}

// PUT /api/study-plan - Update a study plan
export async function PUT(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
		}

		const searchParams = request.nextUrl.searchParams;
		const planId = searchParams.get('id');

		if (!planId) {
			return NextResponse.json({ error: 'missing required parameter: id' }, { status: 400 });
		}

		const body = await request.json();
		const { title, targetExamDate, focusAreas, weeklyGoals, isActive } = body;

		// Validate and parse targetExamDate if provided
		let parsedTargetExamDate: Date | null | undefined;
		if (targetExamDate !== undefined && targetExamDate !== null) {
			// If it's explicitly null, keep it as null so it can be cleared
			if (targetExamDate === null) {
				parsedTargetExamDate = null;
			} else {
				parsedTargetExamDate = new Date(targetExamDate);
				if (Number.isNaN(parsedTargetExamDate.getTime())) {
					return NextResponse.json({ error: 'invalid date format' }, { status: 400 });
				}
			}
		}

		const result = await updateStudyPlanAction(planId, session.user.id, {
			title,
			targetExamDate: parsedTargetExamDate,
			focusAreas,
			weeklyGoals,
			isActive,
		});

		if (!result.success) {
			throw new Error('failed to update study plan');
		}

		return NextResponse.json({ success: true, data: result.plan });
	} catch (error) {
		return handleApiError(error);
	}
}

// DELETE /api/study-plan - Delete a study plan
export async function DELETE(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
		}

		const searchParams = request.nextUrl.searchParams;
		const planId = searchParams.get('id');

		if (!planId) {
			return NextResponse.json({ error: 'missing required parameter: id' }, { status: 400 });
		}

		const result = await deleteStudyPlanAction(planId, session.user.id);

		if (!result.success) {
			throw new Error('failed to delete study plan');
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		return handleApiError(error);
	}
}
