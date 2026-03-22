export function getTimeOfDayModifier(hour: number): number {
	const timeModifiers: Record<number, number> = {
		6: 15,
		7: 20,
		8: 25,
		9: 20,
		10: 15,
		11: 10,
		12: 5,
		13: 5,
		14: 10,
		15: 15,
		16: 10,
		17: 5,
		18: 0,
		19: -5,
		20: 5,
		21: -10,
		22: -20,
		23: -30,
		0: -40,
		1: -45,
		2: -50,
		3: -50,
		4: -45,
		5: -30,
	};
	return timeModifiers[hour] ?? 0;
}

const BASE_LEVEL = 70;

export function getCurrentEnergyLevel(): number {
	const hour = new Date().getHours();
	const baseLevel = BASE_LEVEL;
	const timeModifier = getTimeOfDayModifier(hour);
	return Math.max(0, Math.min(100, baseLevel + timeModifier));
}
