import { type NextRequest, NextResponse } from 'next/server';

const ESKOM_SEPUSH_API = 'https://api.sepush.co.za/loadshedding/areas';

interface LoadSheddingSchedule {
	date: string;
	stages: { stage: number; start: string; end: string }[];
}

let cachedStage = 0;
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000;

async function getCurrentStage(): Promise<number> {
	const now = Date.now();
	if (now - lastFetch < CACHE_DURATION && cachedStage > 0) {
		return cachedStage;
	}

	const apiKey = process.env.ESKOM_SEPUSH_API_KEY;

	if (!apiKey) {
		console.debug('No EskomSePush API key configured, using default schedule');
		return getDefaultStage();
	}

	try {
		const response = await fetch('https://api.sepush.co.za/loadshedding/status', {
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		});

		if (response.ok) {
			const data = await response.json();
			cachedStage = data.stage || 0;
			lastFetch = now;
			return cachedStage;
		}
	} catch (error) {
		console.debug('Failed to fetch load shedding status:', error);
	}

	return getDefaultStage();
}

function getDefaultStage(): number {
	const hour = new Date().getHours();
	const dayOfWeek = new Date().getDay();

	if (dayOfWeek === 0) return 0;
	if (hour >= 22 || hour < 6) return 0;
	if (hour >= 17 && hour < 21) return Math.min(3, Math.floor((hour - 17) / 2) + 1);
	if (hour >= 6 && hour < 8) return Math.min(2, Math.floor((hour - 6) / 2) + 1);

	return 1;
}

async function getScheduleForArea(areaId: string): Promise<LoadSheddingSchedule[]> {
	const apiKey = process.env.ESKOM_SEPUSH_API_KEY;

	if (!apiKey) {
		return getMockSchedule();
	}

	try {
		const response = await fetch(`${ESKOM_SEPUSH_API}/${areaId}/days`, {
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		});

		if (response.ok) {
			const data = await response.json();
			return data.days || [];
		}
	} catch (error) {
		console.debug('Failed to fetch area schedule:', error);
	}

	return getMockSchedule();
}

function getMockSchedule(): LoadSheddingSchedule[] {
	const schedules: LoadSheddingSchedule[] = [];
	const today = new Date();

	for (let i = 0; i < 7; i++) {
		const date = new Date(today);
		date.setDate(date.getDate() + i);
		const dayOfWeek = date.getDay();

		if (dayOfWeek === 0) continue;

		const daySchedule: LoadSheddingSchedule = {
			date: date.toISOString().split('T')[0],
			stages: [],
		};

		const stage = (i % 4) + 1;
		daySchedule.stages.push({
			stage,
			start: '18:00',
			end: '20:00',
		});

		if (stage >= 3) {
			daySchedule.stages.push({
				stage,
				start: '08:00',
				end: '10:00',
			});
		}

		schedules.push(daySchedule);
	}

	return schedules;
}

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const area = searchParams.get('area') || 'default';

	const [stage, schedule] = await Promise.all([getCurrentStage(), getScheduleForArea(area)]);

	return NextResponse.json({
		stage,
		area,
		schedule,
		lastUpdated: new Date().toISOString(),
	});
}
