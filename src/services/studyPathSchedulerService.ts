import { addDays, format, setHours, setMinutes, startOfWeek } from 'date-fns';
import type { StudyBlock } from '@/types/smart-scheduler';

export interface StudyStep {
	id: string;
	title: string;
	type: 'lesson' | 'practice' | 'quiz';
	durationMinutes: number;
	topic: string;
	subject: string;
}

export interface AvailableHours {
	day: string;
	startHour: number;
	endHour: number;
}

export interface LoadSheddingSlot {
	day: string;
	startHour: number;
	endHour: number;
	stage: number;
}

export interface ScheduleConflict {
	type: 'time' | 'load_shedding' | 'overlap';
	affectedBlocks: string[];
	suggestion: string;
}

export interface PathScheduleResult {
	blocks: StudyBlock[];
	conflicts: ScheduleConflict[];
	loadSheddingAdjusted: boolean;
	totalMinutes: number;
	estimatedDays: number;
}

const DAY_MAP: Record<string, number> = {
	Sunday: 0,
	Monday: 1,
	Tuesday: 2,
	Wednesday: 3,
	Thursday: 4,
	Friday: 5,
	Saturday: 6,
};

const BLOCK_TYPE_MAP: Record<StudyStep['type'], StudyBlock['type']> = {
	lesson: 'study',
	practice: 'practice',
	quiz: 'review',
};

export function generatePathSchedule(
	pathSteps: StudyStep[],
	availableHours: AvailableHours[],
	userLoadSheddingSchedule?: LoadSheddingSlot[]
): PathScheduleResult {
	const blocks: StudyBlock[] = [];
	const conflicts: ScheduleConflict[] = [];
	let loadSheddingAdjusted = false;

	const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

	let currentWeekIndex = 0;
	let currentDayIndex = 0;
	let currentStartHour = availableHours[0]?.startHour ?? 16;

	for (const step of pathSteps) {
		let scheduled = false;
		let attempts = 0;
		const maxAttempts = availableHours.length * 7;

		while (!scheduled && attempts < maxAttempts) {
			const daySchedule = availableHours[currentDayIndex % availableHours.length];
			if (!daySchedule) {
				currentDayIndex++;
				attempts++;
				continue;
			}

			const slotDate = addDays(weekStart, DAY_MAP[daySchedule.day] + currentWeekIndex * 7);

			const effectiveStartHour =
				currentDayIndex === 0 && attempts === 0 ? currentStartHour : daySchedule.startHour;
			const effectiveEndHour = daySchedule.endHour;

			let startTime = setHours(setMinutes(slotDate, 0), effectiveStartHour);
			let endTime = setHours(
				setMinutes(slotDate, 0),
				effectiveStartHour + Math.ceil(step.durationMinutes / 60)
			);

			if (userLoadSheddingSchedule && userLoadSheddingSchedule.length > 0) {
				const slotConflict = userLoadSheddingSchedule.find(
					(ls) =>
						ls.day === daySchedule.day &&
						((effectiveStartHour >= ls.startHour && effectiveStartHour < ls.endHour) ||
							(effectiveStartHour < ls.startHour &&
								effectiveStartHour + Math.ceil(step.durationMinutes / 60) > ls.startHour))
				);

				if (slotConflict) {
					loadSheddingAdjusted = true;
					startTime = setHours(setMinutes(slotDate, 0), slotConflict.endHour);
					endTime = setHours(
						setMinutes(slotDate, 0),
						slotConflict.endHour + Math.ceil(step.durationMinutes / 60)
					);

					if (slotConflict.endHour + Math.ceil(step.durationMinutes / 60) > effectiveEndHour) {
						conflicts.push({
							type: 'load_shedding',
							affectedBlocks: [step.id],
							suggestion: `Moved "${step.title}" past load shedding (Stage ${slotConflict.stage}). May extend into evening.`,
						});
					}
				}
			}

			const blockEndHour = effectiveStartHour + Math.ceil(step.durationMinutes / 60);
			if (blockEndHour <= effectiveEndHour) {
				const block: StudyBlock = {
					id: crypto.randomUUID(),
					subject: step.subject,
					topic: step.title,
					date: startTime,
					startTime: format(startTime, 'HH:mm'),
					endTime: format(endTime, 'HH:mm'),
					duration: step.durationMinutes,
					type: BLOCK_TYPE_MAP[step.type],
					isCompleted: false,
					isAISuggested: true,
				};

				blocks.push(block);
				scheduled = true;

				const nextStartHour = blockEndHour;
				if (nextStartHour >= effectiveEndHour) {
					currentDayIndex++;
					if (currentDayIndex >= availableHours.length) {
						currentDayIndex = 0;
						currentWeekIndex++;
					}
					currentStartHour =
						availableHours[currentDayIndex % availableHours.length]?.startHour ?? 16;
				} else {
					currentStartHour = nextStartHour;
				}
			} else {
				currentDayIndex++;
				if (currentDayIndex >= availableHours.length) {
					currentDayIndex = 0;
					currentWeekIndex++;
				}
				currentStartHour = availableHours[currentDayIndex % availableHours.length]?.startHour ?? 16;
			}

			attempts++;
		}

		if (!scheduled) {
			conflicts.push({
				type: 'overlap',
				affectedBlocks: [step.id],
				suggestion: `Could not fit "${step.title}" (${step.durationMinutes} min) in available hours. Consider extending your schedule.`,
			});

			const lastBlock = blocks[blocks.length - 1];
			if (lastBlock) {
				const fallbackDate = addDays(new Date(lastBlock.date), 1);
				blocks.push({
					id: crypto.randomUUID(),
					subject: step.subject,
					topic: step.title,
					date: fallbackDate,
					startTime: '16:00',
					endTime: format(
						setHours(setMinutes(fallbackDate, 0), 16 + Math.ceil(step.durationMinutes / 60)),
						'HH:mm'
					),
					duration: step.durationMinutes,
					type: BLOCK_TYPE_MAP[step.type],
					isCompleted: false,
					isAISuggested: true,
				});
			}
		}
	}

	const uniqueDays = new Set(blocks.map((b) => format(new Date(b.date), 'yyyy-MM-dd')));
	const totalMinutes = pathSteps.reduce((sum, s) => sum + s.durationMinutes, 0);

	return {
		blocks,
		conflicts,
		loadSheddingAdjusted,
		totalMinutes,
		estimatedDays: uniqueDays.size,
	};
}

export function adjustForLoadShedding(
	blocks: StudyBlock[],
	schedule: LoadSheddingSlot[]
): { adjustedBlocks: StudyBlock[]; conflicts: ScheduleConflict[] } {
	if (!schedule || schedule.length === 0) {
		return { adjustedBlocks: blocks, conflicts: [] };
	}

	const adjustedBlocks: StudyBlock[] = [];
	const conflicts: ScheduleConflict[] = [];

	for (const block of blocks) {
		const blockDate = new Date(block.date);
		const dayName = format(blockDate, 'EEEE');
		const blockStartHour = Number.parseInt(block.startTime.split(':')[0], 10);

		const conflictingSlot = schedule.find(
			(ls) =>
				ls.day === dayName &&
				((blockStartHour >= ls.startHour && blockStartHour < ls.endHour) ||
					(blockStartHour < ls.startHour &&
						blockStartHour + Math.ceil(block.duration / 60) > ls.startHour))
		);

		if (conflictingSlot) {
			const newStartTime = setHours(setMinutes(blockDate, 0), conflictingSlot.endHour);
			const newEndTime = setHours(
				setMinutes(blockDate, 0),
				conflictingSlot.endHour + Math.ceil(block.duration / 60)
			);

			conflicts.push({
				type: 'load_shedding',
				affectedBlocks: [block.id],
				suggestion: `"${block.topic}" moved from ${block.startTime} to ${format(newStartTime, 'HH:mm')} due to Stage ${conflictingSlot.stage} load shedding.`,
			});

			adjustedBlocks.push({
				...block,
				date: newStartTime,
				startTime: format(newStartTime, 'HH:mm'),
				endTime: format(newEndTime, 'HH:mm'),
			});
		} else {
			adjustedBlocks.push(block);
		}
	}

	return { adjustedBlocks, conflicts };
}
