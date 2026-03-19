import { type NextRequest, NextResponse } from 'next/server';
import type { LoadSheddingSlot, StudyStep } from '@/services/studyPathSchedulerService';
import { generatePathSchedule } from '@/services/studyPathSchedulerService';

export interface ScheduleRequest {
	pathId: string;
	steps: StudyStep[];
	availableHours: {
		day: string;
		startHour: number;
		endHour: number;
	}[];
	loadSheddingSchedule?: LoadSheddingSlot[];
}

export async function POST(request: NextRequest) {
	try {
		const body: ScheduleRequest = await request.json();

		if (!body.pathId || !body.steps || !body.availableHours) {
			return NextResponse.json(
				{ error: 'Missing required fields: pathId, steps, availableHours' },
				{ status: 400 }
			);
		}

		if (!Array.isArray(body.steps) || body.steps.length === 0) {
			return NextResponse.json({ error: 'steps must be a non-empty array' }, { status: 400 });
		}

		if (!Array.isArray(body.availableHours) || body.availableHours.length === 0) {
			return NextResponse.json(
				{ error: 'availableHours must be a non-empty array' },
				{ status: 400 }
			);
		}

		const result = generatePathSchedule(body.steps, body.availableHours, body.loadSheddingSchedule);

		return NextResponse.json({
			success: true,
			...result,
		});
	} catch (error) {
		console.error('Error generating path schedule:', error);
		return NextResponse.json({ error: 'Failed to generate schedule' }, { status: 500 });
	}
}
