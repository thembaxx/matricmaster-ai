import { and, asc, eq, gte, lte } from 'drizzle-orm';
import { type DbType, dbManager } from '@/lib/db';
import { calendarEvents, energyPatterns } from '@/lib/db/schema';

async function getDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

interface EnergyPatternData {
	hour: number;
	averageEnergy: number;
	sampleCount: number;
}

interface ScheduleOptimization {
	sessionId: string;
	originalTime: Date;
	newTime: Date;
	reason: string;
}

export async function analyzeEnergyPatterns(userId: string): Promise<EnergyPatternData[]> {
	const db = await getDb();

	const patterns = await db
		.select({
			hour: energyPatterns.hour,
			averageEnergy: energyPatterns.averageEnergy,
			sampleCount: energyPatterns.sampleSize,
		})
		.from(energyPatterns)
		.where(eq(energyPatterns.userId, userId))
		.orderBy(energyPatterns.hour);

	return patterns.map((p) => ({
		hour: Number(p.hour),
		averageEnergy: Number(p.averageEnergy) || 50,
		sampleCount: Number(p.sampleCount) || 1,
	}));
}

export function getOptimalStudyHours(patterns: EnergyPatternData[], minThreshold = 0.7): number[] {
	const thresholdValue = minThreshold * 100;

	return patterns
		.filter((p) => p.averageEnergy >= thresholdValue)
		.sort((a, b) => b.averageEnergy - a.averageEnergy)
		.map((p) => p.hour);
}

async function checkCalendarConflict(db: DbType, userId: string, dateTime: Date): Promise<boolean> {
	const startTime = new Date(dateTime);
	startTime.setMinutes(0, 0, 0);
	const endTime = new Date(startTime);
	endTime.setHours(endTime.getHours() + 1);

	try {
		const conflicts = await db
			.select({ id: calendarEvents.id })
			.from(calendarEvents)
			.where(
				and(
					eq(calendarEvents.userId, userId),
					lte(calendarEvents.startTime, endTime),
					gte(calendarEvents.endTime, startTime)
				)
			)
			.limit(1);

		return conflicts.length > 0;
	} catch {
		return false;
	}
}

async function checkLoadShedding(_dateTime: Date): Promise<boolean> {
	return false;
}

export async function optimizeStudyScheduleForEnergy(
	userId: string,
	options: { daysAhead?: number; minEnergyImprovement?: number } = {}
): Promise<{ optimized: ScheduleOptimization[]; errors: string[] }> {
	const { daysAhead = 7, minEnergyImprovement = 15 } = options;
	const result = { optimized: [] as ScheduleOptimization[], errors: [] as string[] };

	try {
		const db = await getDb();

		const patterns = await analyzeEnergyPatterns(userId);
		const optimalHours = getOptimalStudyHours(patterns, 0.6);

		if (optimalHours.length === 0) {
			return result;
		}

		const now = new Date();
		const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

		const savedPatterns = await db
			.select({
				hour: energyPatterns.hour,
				averageEnergy: energyPatterns.averageEnergy,
				sampleSize: energyPatterns.sampleSize,
			})
			.from(energyPatterns)
			.where(eq(energyPatterns.userId, userId))
			.orderBy(energyPatterns.hour);

		const patternMap = new Map(
			savedPatterns.map((p) => [
				p.hour,
				{ energy: Number(p.averageEnergy) / 100, sampleSize: p.sampleSize },
			])
		);

		const calendarSessions = await db
			.select({
				id: calendarEvents.id,
				title: calendarEvents.title,
				startTime: calendarEvents.startTime,
				eventType: calendarEvents.eventType,
			})
			.from(calendarEvents)
			.where(
				and(
					eq(calendarEvents.userId, userId),
					eq(calendarEvents.eventType, 'study'),
					gte(calendarEvents.startTime, now),
					lte(calendarEvents.startTime, futureDate)
				)
			)
			.orderBy(asc(calendarEvents.startTime));

		for (const session of calendarSessions) {
			const currentHour = new Date(session.startTime).getHours();
			const currentEnergy = patternMap.get(currentHour)?.energy || 0.5;

			const betterHour = findBetterHour(
				optimalHours,
				currentHour,
				currentEnergy,
				minEnergyImprovement
			);

			if (betterHour !== null) {
				const newTime = new Date(session.startTime);
				newTime.setHours(betterHour, 0, 0, 0);

				const hasConflict = await checkCalendarConflict(db, userId, newTime);
				const hasLoadShedding = await checkLoadShedding(newTime);

				if (!hasConflict && !hasLoadShedding) {
					await db
						.update(calendarEvents)
						.set({
							startTime: newTime,
							endTime: new Date(newTime.getTime() + 60 * 60 * 1000),
							updatedAt: new Date(),
						})
						.where(eq(calendarEvents.id, session.id));

					const newEnergy = patternMap.get(betterHour)?.energy || 0.5;

					result.optimized.push({
						sessionId: session.id,
						originalTime: new Date(session.startTime),
						newTime,
						reason: `Energy improved from ${Math.round(currentEnergy * 100)}% to ${Math.round(newEnergy * 100)}%`,
					});
				}
			}
		}
	} catch (error) {
		result.errors.push(String(error));
	}

	return result;
}

function findBetterHour(
	optimalHours: number[],
	_currentHour: number,
	currentEnergy: number,
	minImprovement: number
): number | null {
	for (const hour of optimalHours) {
		const improvement = 0.7 - currentEnergy;
		if (improvement > minImprovement / 100) {
			return hour;
		}
	}

	return null;
}

export async function rescheduleForLoadShedding(
	userId: string,
	affectedSlots: Date[],
	options: { daysAhead?: number } = {}
): Promise<ScheduleOptimization[]> {
	const { daysAhead = 3 } = options;
	const result: ScheduleOptimization[] = [];

	try {
		const db = await getDb();

		const patterns = await analyzeEnergyPatterns(userId);
		const optimalHours = getOptimalStudyHours(patterns, 0.6);

		for (const slot of affectedSlots) {
			for (let dayOffset = 1; dayOffset <= daysAhead; dayOffset++) {
				for (const hour of optimalHours) {
					const candidate = new Date(slot);
					candidate.setDate(candidate.getDate() + dayOffset);
					candidate.setHours(hour, 0, 0, 0);

					const hasConflict = await checkCalendarConflict(db, userId, candidate);
					const hasLoadShedding = await checkLoadShedding(candidate);

					if (!hasConflict && !hasLoadShedding) {
						const sessions = await db
							.select({ id: calendarEvents.id })
							.from(calendarEvents)
							.where(and(eq(calendarEvents.userId, userId), eq(calendarEvents.startTime, slot)))
							.limit(1);

						if (sessions.length > 0) {
							await db
								.update(calendarEvents)
								.set({
									startTime: candidate,
									endTime: new Date(candidate.getTime() + 60 * 60 * 1000),
									updatedAt: new Date(),
								})
								.where(eq(calendarEvents.id, sessions[0].id));

							result.push({
								sessionId: sessions[0].id,
								originalTime: slot,
								newTime: candidate,
								reason: 'Load shedding reschedule to optimal energy slot',
							});
						}
						break;
					}
				}
			}
		}
	} catch (error) {
		console.error('Load shedding reschedule error:', error);
	}

	return result;
}
