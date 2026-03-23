import {
	getEnergyPatterns,
	getOptimalStudyWindows,
	getWeeklyEnergyHistory,
} from './energy-tracking-service';
import {
	checkExamConflicts,
	getUpcomingExams,
	suggestOptimalStudySchedule,
} from './examConflictDetector';

export interface StudyTask {
	id: string;
	subject: string;
	topic: string;
	difficulty: 'easy' | 'medium' | 'hard';
	type: 'new_topic' | 'practice' | 'review' | 'flashcards' | 'quiz';
	estimatedDuration: number;
}

export interface ScheduledBlock {
	id: string;
	task: StudyTask;
	date: Date;
	startTime: string;
	endTime: string;
	energyRequired: 'high' | 'medium' | 'low';
	reason: string;
}

export interface ScheduleRecommendation {
	suggestedTime: string;
	task: StudyTask;
	reason: string;
	energyMatch: number;
}

const ENERGY_REQUIREMENTS = {
	hard: 75,
	medium: 50,
	easy: 25,
};

const TASK_TYPE_ENERGY: Record<StudyTask['type'], 'high' | 'medium' | 'low'> = {
	new_topic: 'high',
	practice: 'high',
	review: 'medium',
	flashcards: 'low',
	quiz: 'medium',
};

export async function generateSmartSchedule(tasks: StudyTask[]): Promise<ScheduleRecommendation[]> {
	const patterns = await getEnergyPatterns();
	const windows = await getOptimalStudyWindows();

	const recommendations: ScheduleRecommendation[] = [];

	if (patterns.length < 3 || windows.length === 0) {
		for (const task of tasks.slice(0, 3)) {
			recommendations.push({
				suggestedTime: getDefaultTimeForDifficulty(task.difficulty),
				task,
				reason: 'Default schedule based on typical peak hours',
				energyMatch: 70,
			});
		}
		return recommendations;
	}

	const sortedTasks = [...tasks].sort((a, b) => {
		const difficultyOrder = { hard: 0, medium: 1, easy: 2 };
		return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
	});

	for (const task of sortedTasks) {
		const requiredEnergy = ENERGY_REQUIREMENTS[task.difficulty];
		const bestWindow = windows.find((w) => w.energyLevel >= requiredEnergy);

		if (bestWindow) {
			const startHour = bestWindow.startHour;
			const endHour = bestWindow.endHour;

			recommendations.push({
				suggestedTime: `${startHour.toString().padStart(2, '0')}:00 - ${endHour.toString().padStart(2, '0')}:00`,
				task,
				reason: `Optimal energy window (${Math.round(bestWindow.energyLevel)}%) for ${task.difficulty} difficulty`,
				energyMatch: Math.min(100, bestWindow.energyLevel),
			});
		} else {
			const fallbackHour = task.difficulty === 'hard' ? 9 : task.difficulty === 'medium' ? 14 : 20;
			recommendations.push({
				suggestedTime: `${fallbackHour.toString().padStart(2, '0')}:00 - ${(fallbackHour + 1).toString().padStart(2, '0')}:00`,
				task,
				reason: 'Standard time slot - energy data limited',
				energyMatch: 50,
			});
		}
	}

	return recommendations;
}

function getDefaultTimeForDifficulty(difficulty: string): string {
	switch (difficulty) {
		case 'hard':
			return '08:00 - 10:00';
		case 'medium':
			return '14:00 - 16:00';
		case 'easy':
			return '19:00 - 20:00';
		default:
			return '09:00 - 11:00';
	}
}

export async function detectCramWarning(): Promise<{
	isCramSession: boolean;
	warnings: string[];
	suggestions: string[];
}> {
	const history = await getWeeklyEnergyHistory();
	const warnings: string[] = [];
	const suggestions: string[] = [];

	if (history.length < 3) {
		return { isCramSession: false, warnings: [], suggestions: [] };
	}

	const recentSessions = history.slice(-3);
	const lateNightCount = recentSessions.filter((h) => {
		const hour = Number.parseInt(h.avgEnergy.toString(), 10);
		return hour < 30;
	}).length;

	if (lateNightCount >= 2) {
		warnings.push('Multiple low-energy sessions detected - possible cramming pattern');
		suggestions.push('Try scheduling difficult topics earlier in the day');
		suggestions.push('Consider breaking up long sessions with short breaks');
	}

	const avgEnergy = recentSessions.reduce((a, b) => a + b.avgEnergy, 0) / recentSessions.length;
	if (avgEnergy < 40) {
		warnings.push('Your average energy this week has been low');
		suggestions.push('Consider lighter study sessions until your energy recovers');
		suggestions.push('Review material instead of learning new topics');
	}

	return {
		isCramSession: warnings.length > 0,
		warnings,
		suggestions,
	};
}

export function getTaskEnergyLevel(task: StudyTask): 'medium' | 'high' | 'low' {
	const energy = TASK_TYPE_ENERGY[task.type];
	return energy || 'medium';
}

export function getDifficultyLabel(difficulty: string): string {
	switch (difficulty) {
		case 'hard':
			return 'challenging';
		case 'medium':
			return 'moderate';
		case 'easy':
			return 'light';
		default:
			return 'moderate';
	}
}

export function formatTaskForRecommendation(task: StudyTask): string {
	return `${task.subject} - ${task.topic}`;
}

export interface ExamAwareScheduleInput {
	tasks: StudyTask[];
	existingEvents?: Array<{
		id: string;
		title: string;
		startTime: Date;
		endTime: Date;
		eventType: string;
	}>;
	availableHoursPerWeek?: number;
}

export interface ExamAwareScheduleResult {
	schedule: ScheduleRecommendation[];
	examConflicts: {
		hasConflict: boolean;
		conflicts: string[];
		warnings: string[];
	};
	studyPlan: Array<{
		subject: string;
		hoursPerWeek: number;
		priority: 'high' | 'medium' | 'low';
		reason: string;
	}>;
}

export async function generateExamAwareSchedule(
	input: ExamAwareScheduleInput
): Promise<ExamAwareScheduleResult> {
	const { tasks, existingEvents = [], availableHoursPerWeek = 20 } = input;

	const upcomingExams = getUpcomingExams(60);

	const eventsWithExamInfo = existingEvents.map((event) => ({
		...event,
		conflictsWithExam: false,
	}));

	const conflictResult = checkExamConflicts(eventsWithExamInfo);

	const studyPlan = suggestOptimalStudySchedule(upcomingExams, availableHoursPerWeek);

	const schedule = await generateSmartSchedule(tasks);

	const examWarnings: string[] = [];
	for (const warning of conflictResult.warnings) {
		if (warning.includes('prep period')) {
			examWarnings.push(warning);
		}
	}

	return {
		schedule,
		examConflicts: {
			hasConflict: conflictResult.hasConflict,
			conflicts: conflictResult.conflicts.map((c) => c.message),
			warnings: examWarnings,
		},
		studyPlan,
	};
}
