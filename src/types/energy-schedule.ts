import type { StudyBlock } from './smart-scheduler';

export interface EnergyScheduleConfig {
	enableAutoSchedule: boolean;
	enableLoadSheddingFreeze: boolean;
	enableBurnoutProtection: boolean;
	minEnergyThreshold: number;
}

export interface ScheduleAdjustment {
	blockId: string;
	originalDate: Date;
	newDate: Date;
	originalTime: string;
	newTime: string;
	reason: 'energy' | 'load_shedding' | 'burnout' | 'urgency';
	description: string;
}

export interface EnergyAwareBlock extends StudyBlock {
	optimalStartHour: number;
	optimalEndHour: number;
	energyScore: number;
	urgencyScore: number;
	loadSheddingRisk: boolean;
}

export interface OptimalTimeSlot {
	startHour: number;
	endHour: number;
	energyLevel: number;
	date: Date;
}

export interface RescheduleRecommendation {
	block: StudyBlock;
	currentSlot: OptimalTimeSlot;
	recommendedSlot: OptimalTimeSlot;
	savings: number;
}
