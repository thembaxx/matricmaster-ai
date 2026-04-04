import type { SeededRandom } from './seeded-random';

export interface DateRange {
	start: Date;
	end: Date;
}

export type ActivityIntensity = 'low' | 'medium' | 'high';

export const activityConfig: Record<
	ActivityIntensity,
	{
		dailySessions: { min: number; max: number };
		weeklySessions: { min: number; max: number };
		sessionDuration: { min: number; max: number };
		completionRate: number;
		weekendBias: number;
		eveningBias: number;
	}
> = {
	low: {
		dailySessions: { min: 1, max: 2 },
		weeklySessions: { min: 5, max: 10 },
		sessionDuration: { min: 15, max: 30 },
		completionRate: 0.8,
		weekendBias: 1.2,
		eveningBias: 1.0,
	},
	medium: {
		dailySessions: { min: 2, max: 4 },
		weeklySessions: { min: 10, max: 20 },
		sessionDuration: { min: 30, max: 60 },
		completionRate: 0.85,
		weekendBias: 1.3,
		eveningBias: 1.1,
	},
	high: {
		dailySessions: { min: 4, max: 8 },
		weeklySessions: { min: 20, max: 35 },
		sessionDuration: { min: 45, max: 90 },
		completionRate: 0.9,
		weekendBias: 1.4,
		eveningBias: 1.2,
	},
};

export function generateDateRange(
	_rng: SeededRandom,
	monthsBack: number,
	_intensity: ActivityIntensity = 'medium'
): DateRange {
	const end = new Date();
	end.setHours(23, 59, 59, 999);

	const start = new Date(end);
	start.setMonth(start.getMonth() - monthsBack);
	start.setHours(0, 0, 0, 0);

	return { start, end };
}

export function distributeOverPeriod(
	rng: SeededRandom,
	range: DateRange,
	intensity: ActivityIntensity = 'medium'
): Date[] {
	const config = activityConfig[intensity];
	const results: Date[] = [];

	const startTime = range.start.getTime();
	const endTime = range.end.getTime();
	const totalMs = endTime - startTime;

	const weeks = totalMs / (7 * 24 * 60 * 60 * 1000);
	const targetSessions = (weeks * config.weeklySessions.min + config.weeklySessions.max) / 2;

	const totalSessions = Math.floor(targetSessions);

	for (let i = 0; i < totalSessions; i++) {
		const randProgress = rng.next();
		const dayOffset = randProgress * totalMs;

		const date = new Date(startTime + dayOffset);

		const isWeekend = date.getDay() === 0 || date.getDay() === 6;
		const hourBias = isWeekend ? config.weekendBias : 1;
		const hourRand = rng.next() * hourBias;

		let hour: number;
		if (isWeekend) {
			hour = Math.floor(hourRand * 9) + 9;
		} else {
			const eveningRand = hourRand * config.eveningBias;
			if (eveningRand < 0.3) {
				hour = Math.floor(eveningRand * 5) + 16;
			} else if (eveningRand < 0.7) {
				hour = Math.floor((eveningRand - 0.3) * 7) + 18;
			} else {
				hour = Math.floor((eveningRand - 0.7) * 10) + 21;
			}
		}

		hour = Math.max(6, Math.min(22, hour));
		date.setHours(hour, rng.nextInt(0, 59), rng.nextInt(0, 59));

		results.push(date);
	}

	return results.sort((a, b) => a.getTime() - b.getTime());
}

export function scoreDistribution(rng: SeededRandom, mean = 65, stdDev = 15): number {
	let score = rng.normal(mean, stdDev);
	score = Math.max(0, Math.min(100, score));
	return Math.round(score * 100) / 100;
}

export function timePerQuestionDistribution(
	rng: SeededRandom,
	min = 30,
	max = 120,
	mean = 60
): number {
	const time = rng.normal(mean, (max - min) / 4);
	return Math.max(min, Math.min(max, Math.round(time)));
}

export function sessionDurationDistribution(
	rng: SeededRandom,
	config: typeof activityConfig.high
): number {
	const duration = rng.logNormal(3.5, 0.5);
	const clamped = Math.max(
		config.sessionDuration.min,
		Math.min(config.sessionDuration.max, Math.round(duration))
	);
	return clamped;
}
