export interface Resistor {
	id: string;
	resistance: number;
	config: 'series' | 'parallel';
}

export interface CircuitResults {
	equivalentResistance: number;
	totalCurrent: number;
	voltageDrops: { id: string; voltage: number; current: number; power: number }[];
}

export function calculateCircuit(voltage: number, resistors: Resistor[]): CircuitResults {
	// Separate series and parallel resistors
	const seriesResistors = resistors.filter((r) => r.config === 'series');
	const parallelResistors = resistors.filter((r) => r.config === 'parallel');

	// Series: R_total = R1 + R2 + ...
	const seriesResistance = seriesResistors.reduce((sum, r) => sum + r.resistance, 0);

	// Parallel: 1/R_total = 1/R1 + 1/R2 + ...
	const parallelResistance =
		parallelResistors.length > 0
			? 1 / parallelResistors.reduce((sum, r) => sum + 1 / r.resistance, 0)
			: 0;

	// Total resistance
	const equivalentResistance = seriesResistance + parallelResistance;

	// Total current (Ohm's Law)
	const totalCurrent = voltage / equivalentResistance;

	// Voltage drops
	const voltageDrops = resistors.map((r) => {
		let current: number;
		if (r.config === 'series') {
			current = totalCurrent;
		} else {
			// Parallel: voltage is the same, current splits
			current = voltage / r.resistance;
		}
		const vDrop = current * r.resistance;
		const power = current * vDrop;
		return { id: r.id, voltage: vDrop, current, power };
	});

	return { equivalentResistance, totalCurrent, voltageDrops };
}
