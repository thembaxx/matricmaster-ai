'use server';

import { getAuth } from '@/lib/auth';
import { useEnergyTrackingStore } from '@/stores/useEnergyTrackingStore';
import { useLoadSheddingStore } from '@/stores/useLoadSheddingStore';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';
import type { ScheduleAdjustment } from '@/types/energy-schedule';
import { adjustPlanForBurnout, detectBurnoutRisk } from './burnout-study-plan-bridge';

interface WellnessProtectionResult {
	burnoutAdjustments: ScheduleAdjustment[];
	loadSheddingAdjustments: ScheduleAdjustment[];
	burnoutLevel: 'low' | 'medium' | 'high' | 'severe';
	loadSheddingStage: number;
	recommendations: string[];
}

export async function applyWellnessProtections(): Promise<WellnessProtectionResult> {
	const auth = await getAuth();
	const session = await auth.api.getSession();

	const { currentStage } = useLoadSheddingStore.getState();
	const { blocks } = useSmartSchedulerStore.getState();

	let burnoutLevel: 'low' | 'medium' | 'high' = 'low';
	let burnoutAdjustments: ScheduleAdjustment[] = [];
	let recommendations: string[] = [];

	if (session?.user) {
		const burnout = await detectBurnoutRisk(session.user.id);
		burnoutLevel = burnout.level as 'low' | 'medium' | 'high';

		if (burnout.level !== 'low') {
			await adjustPlanForBurnout(session.user.id, burnout);
			burnoutAdjustments = generateBurnoutAdjustments(blocks, burnout.level);
			recommendations = burnout.recommendations ?? [];
		}
	}

	let loadSheddingAdjustments: ScheduleAdjustment[] = [];
	if (currentStage >= 3) {
		loadSheddingAdjustments = generateLoadSheddingAdjustments(blocks, currentStage);
		recommendations.push(`Load shedding stage ${currentStage}: Some sessions may be affected`);

		if (currentStage >= 4) {
			const { triggerAutoFreeze } = useLoadSheddingStore.getState();
			await triggerAutoFreeze();
		}
	}

	return {
		burnoutAdjustments,
		loadSheddingAdjustments,
		burnoutLevel,
		loadSheddingStage: currentStage,
		recommendations,
	};
}

function generateBurnoutAdjustments(
	blocks: { id: string; date: Date; startTime: string; duration: number }[],
	level: 'low' | 'medium' | 'high'
): ScheduleAdjustment[] {
	const reductionFactor = level === 'high' ? 0.5 : 0.25;
	const criticalBlocks = blocks.slice(0, Math.ceil(blocks.length * reductionFactor));

	return criticalBlocks.map((block) => ({
		blockId: block.id,
		originalDate: new Date(block.date),
		newDate: new Date(block.date),
		originalTime: block.startTime,
		newTime: block.startTime,
		reason: 'burnout' as const,
		description: `Reduced due to ${level} burnout risk`,
	}));
}

function generateLoadSheddingAdjustments(
	blocks: { id: string; date: Date; startTime: string; endTime: string; type: string }[],
	stage: number
): ScheduleAdjustment[] {
	const { getAffectedBlocks } = useLoadSheddingStore.getState();

	const formattedBlocks = blocks.map((b) => ({
		id: b.id,
		date: b.date instanceof Date ? b.date.toISOString().split('T')[0] : String(b.date),
		startTime: b.startTime,
		endTime: b.endTime,
		type: b.type,
	}));

	const affected = getAffectedBlocks(formattedBlocks);

	if (affected.length === 0) return [];

	return affected
		.map((blockId) => {
			const block = blocks.find((b) => b.id === blockId);
			if (!block) {
				return null;
			}

			const hour = Number.parseInt(block.startTime.split(':')[0], 10);
			const newHour = hour < 12 ? hour + 4 : hour - 4;

			return {
				blockId,
				originalDate: new Date(block.date),
				newDate: new Date(block.date),
				originalTime: block.startTime,
				newTime: `${String(newHour).padStart(2, '0')}:00`,
				reason: 'load_shedding' as const,
				description: `Rescheduled due to stage ${stage} load shedding`,
			};
		})
		.filter(Boolean) as ScheduleAdjustment[];
}

export async function getWellnessStatus(): Promise<{
	energyLevel: number;
	burnoutRisk: 'low' | 'medium' | 'high';
	loadSheddingStage: number;
	shouldAdjust: boolean;
	message: string;
}> {
	const energyStoreState = useEnergyTrackingStore?.getState?.();
	const currentEnergy = energyStoreState?.currentEnergy ?? 70;
	const { currentStage } = useLoadSheddingStore.getState();

	const auth = await getAuth();
	const session = await auth.api.getSession();

	let burnoutRisk: 'low' | 'medium' | 'high' = 'low';

	if (session?.user) {
		const burnout = await detectBurnoutRisk(session.user.id);
		burnoutRisk = burnout.level as 'low' | 'medium' | 'high';
	}

	const shouldAdjust = burnoutRisk !== 'low' || currentStage >= 3 || currentEnergy < 40;

	let message = 'Your schedule is optimized.';
	if (burnoutRisk === 'high') {
		message = 'High burnout risk detected. Study load reduced.';
	} else if (burnoutRisk === 'medium') {
		message = 'Moderate burnout risk. Consider lighter sessions.';
	} else if (currentStage >= 4) {
		message = 'Load shedding active. Streak protected.';
	} else if (currentEnergy < 40) {
		message = 'Low energy detected. Schedule adjusted for optimal times.';
	}

	return {
		energyLevel: currentEnergy,
		burnoutRisk,
		loadSheddingStage: currentStage,
		shouldAdjust,
		message,
	};
}
