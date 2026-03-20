import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import {
	claimTeamGoalReward,
	createTeamGoal,
	getTeamGoals,
	joinTeamGoal,
	updateTeamProgress,
} from '@/services/teamGoals';

export async function GET() {
	try {
		const goals = await getTeamGoals();
		return NextResponse.json({ goals });
	} catch (error) {
		console.debug('[API/team-goals] GET error:', error);
		return NextResponse.json({ goals: [] });
	}
}

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { action } = body;

		if (action === 'create') {
			const goal = await createTeamGoal(session.user.id, {
				title: body.title,
				description: body.description,
				goalType: body.goalType,
				target: body.target,
				xpReward: body.xpReward,
				endDate: new Date(body.endDate),
				maxMembers: body.maxMembers,
			});
			return NextResponse.json({ goal });
		}

		if (action === 'join') {
			await joinTeamGoal(body.goalId);
			return NextResponse.json({ success: true });
		}

		return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
	} catch (error) {
		console.debug('[API/team-goals] POST error:', error);
		return NextResponse.json({ error: 'Internal error' }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { action } = body;

		if (action === 'progress') {
			await updateTeamProgress(body.goalId, session.user.id, body.progressDelta);
			return NextResponse.json({ success: true });
		}

		if (action === 'claim') {
			const result = await claimTeamGoalReward(body.goalId);
			return NextResponse.json(result);
		}

		return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
	} catch (error) {
		console.debug('[API/team-goals] PATCH error:', error);
		return NextResponse.json({ error: 'Internal error' }, { status: 500 });
	}
}
