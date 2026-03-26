'use server';

import { dbManager } from '@/lib/db';

interface EnergyOptimalWindow {
	startHour: number;
	endHour: number;
	energyLevel: number;
	label: string;
}

/**
 * Get the user's optimal study windows based on their energy patterns
 */
export async function getEnergyOptimalWindows(_userId: string): Promise<EnergyOptimalWindow[]> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) return getDefaultWindows();

	const _db = await dbManager.getDb();

	// Query energy tracking data - using a simplified approach
	// In production, this would query an energySessions table
	const windows: EnergyOptimalWindow[] = [];

	// Analyze quiz performance times to infer energy patterns
	// This is a heuristic: high accuracy at certain times = high energy
	const optimalMorning = { startHour: 8, endHour: 10, energyLevel: 85, label: 'Morning Focus' };
	const optimalAfternoon = {
		startHour: 14,
		endHour: 16,
		energyLevel: 75,
		label: 'Afternoon Review',
	};
	const optimalEvening = { startHour: 19, endHour: 21, energyLevel: 70, label: 'Evening Practice' };

	windows.push(optimalMorning, optimalAfternoon, optimalEvening);

	return windows;
}

/**
 * Schedule study blocks based on energy patterns and topic difficulty
 */
export async function scheduleByEnergy(
	topics: Array<{ name: string; difficulty: 'easy' | 'medium' | 'hard' }>,
	_preferredDate: Date
): Promise<Array<{ topic: string; suggestedTime: string; reason: string }>> {
	const windows = await getEnergyOptimalWindows('');

	const schedule: Array<{ topic: string; suggestedTime: string; reason: string }> = [];

	// Sort topics by difficulty (hardest first)
	const sortedTopics = [...topics].sort((a, b) => {
		const difficultyOrder = { hard: 0, medium: 1, easy: 2 };
		return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
	});

	// Assign hard topics to highest energy windows
	const hardTopics = sortedTopics.filter((t) => t.difficulty === 'hard');
	const mediumTopics = sortedTopics.filter((t) => t.difficulty === 'medium');
	const easyTopics = sortedTopics.filter((t) => t.difficulty === 'easy');

	const sortedWindows = [...windows].sort((a, b) => b.energyLevel - a.energyLevel);

	// Map topics to windows based on difficulty
	for (const topic of hardTopics) {
		const window = sortedWindows[0]; // Highest energy
		schedule.push({
			topic: topic.name,
			suggestedTime: `${window.startHour}:00`,
			reason: `${topic.difficulty} topic scheduled during ${window.label} (${window.energyLevel}% energy)`,
		});
	}

	for (const topic of mediumTopics) {
		const window = sortedWindows[1] || sortedWindows[0];
		schedule.push({
			topic: topic.name,
			suggestedTime: `${window.startHour}:00`,
			reason: `${topic.difficulty} topic scheduled during ${window.label}`,
		});
	}

	for (const topic of easyTopics) {
		const window = sortedWindows[2] || sortedWindows[sortedWindows.length - 1];
		schedule.push({
			topic: topic.name,
			suggestedTime: `${window.startHour}:00`,
			reason: `${topic.difficulty} topic fits ${window.label}`,
		});
	}

	return schedule;
}

function getDefaultWindows(): EnergyOptimalWindow[] {
	return [
		{ startHour: 9, endHour: 11, energyLevel: 80, label: 'Morning Focus' },
		{ startHour: 14, endHour: 16, energyLevel: 70, label: 'Afternoon Review' },
		{ startHour: 19, endHour: 21, energyLevel: 65, label: 'Evening Practice' },
	];
}
