import { type NextRequest, NextResponse } from 'next/server';
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
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
		console.error('[API] Error fetching study plans:', error);
		return NextResponse.json({ error: 'Failed to fetch study plans' }, { status: 500 });
	}
}

// POST /api/study-plan - Create a study plan
export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { title, targetExamDate, focusAreas, weeklyGoals } = body;

		if (!title) {
			return NextResponse.json({ error: 'Missing required field: title' }, { status: 400 });
		}

		// Validate and parse targetExamDate if provided
		let parsedTargetExamDate: Date | undefined;
		if (targetExamDate) {
			parsedTargetExamDate = new Date(targetExamDate);
			if (Number.isNaN(parsedTargetExamDate.getTime())) {
				return NextResponse.json(
					{ error: 'Invalid date format for targetExamDate' },
					{ status: 400 }
				);
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
			return NextResponse.json(
				{ error: result.error || 'Failed to create study plan' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, data: result.plan });
	} catch (error) {
		console.error('[API] Error creating study plan:', error);
		return NextResponse.json({ error: 'Failed to create study plan' }, { status: 500 });
	}
}

// PUT /api/study-plan - Update a study plan
export async function PUT(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const searchParams = request.nextUrl.searchParams;
		const planId = searchParams.get('id');

		if (!planId) {
			return NextResponse.json({ error: 'Missing required parameter: id' }, { status: 400 });
		}

		const body = await request.json();
		const { title, targetExamDate, focusAreas, weeklyGoals, isActive } = body;

		// Validate and parse targetExamDate if provided
		let parsedTargetExamDate: Date | undefined;
		if (targetExamDate !== undefined && targetExamDate !== null) {
			// If it's explicitly null, keep it as null so it can be cleared
			if (targetExamDate === null) {
				parsedTargetExamDate = null as any;
			} else {
				parsedTargetExamDate = new Date(targetExamDate);
				if (Number.isNaN(parsedTargetExamDate.getTime())) {
					return NextResponse.json(
						{ error: 'Invalid date format for targetExamDate' },
						{ status: 400 }
					);
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
			return NextResponse.json({ error: 'Failed to update study plan' }, { status: 500 });
		}

		return NextResponse.json({ success: true, data: result.plan });
	} catch (error) {
		console.error('[API] Error updating study plan:', error);
		return NextResponse.json({ error: 'Failed to update study plan' }, { status: 500 });
	}
}

// DELETE /api/study-plan - Delete a study plan
export async function DELETE(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const searchParams = request.nextUrl.searchParams;
		const planId = searchParams.get('id');

		if (!planId) {
			return NextResponse.json({ error: 'Missing required parameter: id' }, { status: 400 });
		}

		const result = await deleteStudyPlanAction(planId, session.user.id);

		if (!result.success) {
			return NextResponse.json({ error: 'Failed to delete study plan' }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('[API] Error deleting study plan:', error);
		return NextResponse.json({ error: 'Failed to delete study plan' }, { status: 500 });
	}
}
