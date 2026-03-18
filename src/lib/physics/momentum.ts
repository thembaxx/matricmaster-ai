export interface MomentumResults {
	initialMomentum: number;
	finalMomentum: number;
	initialKineticEnergy: number;
	finalKineticEnergy: number;
	velocity1After: number;
	velocity2After: number;
	momentumConserved: boolean;
	energyConserved: boolean;
}

export function calculateCollision(
	m1: number,
	m2: number,
	v1: number,
	v2: number,
	type: 'elastic' | 'inelastic'
): MomentumResults {
	// Initial momentum
	const initialMomentum = m1 * v1 + m2 * v2;

	// Initial kinetic energy
	const initialKineticEnergy = 0.5 * m1 * v1 ** 2 + 0.5 * m2 * v2 ** 2;

	let velocity1After: number;
	let velocity2After: number;

	if (type === 'elastic') {
		// Elastic collision formulas
		velocity1After = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
		velocity2After = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
	} else {
		// Perfectly inelastic - objects stick together
		const finalVelocity = initialMomentum / (m1 + m2);
		velocity1After = finalVelocity;
		velocity2After = finalVelocity;
	}

	// Final momentum
	const finalMomentum = m1 * velocity1After + m2 * velocity2After;

	// Final kinetic energy
	const finalKineticEnergy = 0.5 * m1 * velocity1After ** 2 + 0.5 * m2 * velocity2After ** 2;

	return {
		initialMomentum,
		finalMomentum,
		initialKineticEnergy,
		finalKineticEnergy,
		velocity1After,
		velocity2After,
		momentumConserved: Math.abs(initialMomentum - finalMomentum) < 0.001,
		energyConserved:
			type === 'elastic' ? Math.abs(initialKineticEnergy - finalKineticEnergy) < 0.001 : false,
	};
}
