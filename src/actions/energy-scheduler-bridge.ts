'use server';

import { useEnergyTrackingStore } from '@/stores/useEnergyTrackingStore';
import { useLoadSheddingStore } from '@/stores/useLoadSheddingStore';
import type {
	EnergyAwareBlock,
	OptimalTimeSlot,
	ScheduleAdjustment,
} from '@/types/energy-schedule';
import type { StudyBlock } from '@/types/smart-scheduler';

const DEFAULT_OPTIMAL_WINDOWS = [
	{ startHour: 9, endHour: 11, energyLevel: 80 },
	{ startHour: 14, endHour: 16, energyLevel: 75 },
	{ startHour: 19, endHour: 21, energyLevel: 60 },
];

export async function getOptimalTimeSlots(): Promise<OptimalTimeSlot[]> {
	const { optimalWindows } = useEnergyTrackingStore.getState();

	if (!optimalWindows || optimalWindows.length === 0) {
		return DEFAULT_OPTIMAL_WINDOWS.map((w) => ({
			...w,
			date: new Date(),
		}));
	}

	return optimalWindows.map((w) => ({
		startHour: w.startHour,
		endHour: w.endHour,
		energyLevel: w.energyLevel,
		date: new Date(),
	}));
}

export async function calculateEnergyScore(
	blockStartHour: number,
	optimalSlots: OptimalTimeSlot[]
): Promise<number> {
	const slot = optimalSlots.find(
		(s) => blockStartHour >= s.startHour && blockStartHour < s.endHour
	);

	if (!slot) {
		const hourDiff = Math.min(
			Math.abs(blockStartHour - 10),
			Math.abs(blockStartHour - 15),
			Math.abs(blockStartHour - 20)
		);
		return Math.max(0, 100 - hourDiff * 20);
	}

	return slot.energyLevel;
}

export async function isInOptimalWindow(
	blockStartHour: number,
	optimalSlots: OptimalTimeSlot[]
): Promise<boolean> {
	return optimalSlots.some((s) => blockStartHour >= s.startHour && blockStartHour < s.endHour);
}

export async function findBetterSlot(
	block: StudyBlock,
	optimalSlots: OptimalTimeSlot[]
): Promise<ScheduleAdjustment | null> {
	const blockHour = Number.parseInt(block.startTime.split(':')[0], 10);

	const inOptimal = await isInOptimalWindow(blockHour, optimalSlots);
	if (inOptimal) {
		return null;
	}

	const bestSlot = optimalSlots.reduce((best, current) =>
		current.energyLevel > best.energyLevel ? current : best
	);

	return {
		blockId: block.id,
		originalDate: new Date(block.date),
		newDate: new Date(block.date),
		originalTime: block.startTime,
		newTime: `${String(bestSlot.startHour).padStart(2, '0')}:00`,
		reason: 'energy',
		description: `Rescheduled from ${block.startTime} to ${bestSlot.startHour}:00 for optimal energy`,
	};
}

export async function generateEnergyAwareBlocks(
	topics: { topic: string; subject: string; urgencyScore?: number }[]
): Promise<EnergyAwareBlock[]> {
	const optimalSlots = await getOptimalTimeSlots();
	const { currentStage, schedule: loadSheddingSchedule } = useLoadSheddingStore.getState();

	return topics.map((topic, index) => {
		const window = optimalSlots[index % optimalSlots.length];
		const startHour = window?.startHour ?? 9;

		const block: EnergyAwareBlock = {
			id: crypto.randomUUID(),
			subject: topic.subject,
			topic: topic.topic,
			date: new Date(),
			startTime: `${String(startHour).padStart(2, '0')}:00`,
			endTime: `${String(startHour + 1).padStart(2, '0')}:00`,
			duration: 60,
			type: topic.urgencyScore && topic.urgencyScore >= 60 ? 'study' : 'review',
			isCompleted: false,
			isAISuggested: true,
			optimalStartHour: window?.startHour ?? 9,
			optimalEndHour: window?.endHour ?? 11,
			energyScore: window?.energyLevel ?? 70,
			urgencyScore: topic.urgencyScore ?? 0,
			loadSheddingRisk: currentStage >= 4 || isDuringLoadShedding(startHour, loadSheddingSchedule),
		};

		return block;
	});
}

function isDuringLoadShedding(
	hour: number,
	schedule: { date: string; stages: { stage: number; start: string; end: string }[] }[]
): boolean {
	const today = new Date().toISOString().split('T')[0];
	const todaySchedule = schedule.find((s) => s.date === today);

	if (!todaySchedule) return false;

	return todaySchedule.stages.some((st) => {
		const startHour = Number.parseInt(st.start.split(':')[0], 10);
		const endHour = Number.parseInt(st.end.split(':')[0], 10);
		return hour >= startHour && hour < endHour;
	});
}

export async function rescheduleForEnergy(blocks: StudyBlock[]): Promise<ScheduleAdjustment[]> {
	const optimalSlots = await getOptimalTimeSlots();

	const adjustments = await Promise.all(blocks.map((block) => findBetterSlot(block, optimalSlots)));
	return adjustments.filter((adj): adj is ScheduleAdjustment => adj !== null);
}
