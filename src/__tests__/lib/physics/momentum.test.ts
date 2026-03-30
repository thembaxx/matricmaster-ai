import { describe, expect, it } from 'vitest';
import { calculateCollision } from '@/lib/physics/momentum';

describe('physics/momentum', () => {
	describe('elastic collisions', () => {
		it('should calculate elastic collision with different masses', () => {
			const result = calculateCollision(2, 1, 6, 0, 'elastic');
			expect(result.velocity1After).toBeCloseTo(2, 2);
			expect(result.velocity2After).toBeCloseTo(8, 2);
			expect(result.momentumConserved).toBe(true);
			expect(result.energyConserved).toBe(true);
		});

		it('should calculate elastic collision with stationary target', () => {
			const result = calculateCollision(1, 2, 10, 0, 'elastic');
			expect(result.velocity1After).toBeCloseTo(-3.33, 1);
			expect(result.velocity2After).toBeCloseTo(6.67, 1);
			expect(result.momentumConserved).toBe(true);
		});

		it('should handle equal masses in elastic collision', () => {
			const result = calculateCollision(5, 5, 8, 2, 'elastic');
			expect(result.velocity1After).toBeCloseTo(2, 2);
			expect(result.velocity2After).toBeCloseTo(8, 2);
			expect(result.momentumConserved).toBe(true);
			expect(result.energyConserved).toBe(true);
		});

		it('should handle head-on collision with opposite velocities', () => {
			const result = calculateCollision(3, 2, 5, -4, 'elastic');
			expect(result.velocity1After).toBeCloseTo(-2.2, 1);
			expect(result.velocity2After).toBeCloseTo(6.8, 1);
			expect(result.momentumConserved).toBe(true);
		});

		it('should calculate elastic collision with zero initial velocity', () => {
			const result = calculateCollision(2, 3, 0, 6, 'elastic');
			expect(result.velocity1After).toBeCloseTo(7.2, 1);
			expect(result.velocity2After).toBeCloseTo(1.2, 1);
			expect(result.momentumConserved).toBe(true);
		});
	});

	describe('perfectly inelastic collisions', () => {
		it('should calculate perfectly inelastic collision', () => {
			const result = calculateCollision(2, 1, 6, 0, 'inelastic');
			expect(result.velocity1After).toBe(4);
			expect(result.velocity2After).toBe(4);
			expect(result.momentumConserved).toBe(true);
			expect(result.energyConserved).toBe(false);
		});

		it('should calculate inelastic collision with moving target', () => {
			const result = calculateCollision(1, 2, 10, 2, 'inelastic');
			expect(result.velocity1After).toBeCloseTo(4.67, 2);
			expect(result.velocity2After).toBeCloseTo(4.67, 2);
			expect(result.momentumConserved).toBe(true);
		});

		it('should handle equal masses in inelastic collision', () => {
			const result = calculateCollision(5, 5, 8, 2, 'inelastic');
			expect(result.velocity1After).toBe(5);
			expect(result.velocity2After).toBe(5);
			expect(result.momentumConserved).toBe(true);
		});

		it('should handle stationary objects in inelastic collision', () => {
			const result = calculateCollision(3, 2, 0, 0, 'inelastic');
			expect(result.velocity1After).toBe(0);
			expect(result.velocity2After).toBe(0);
			expect(result.momentumConserved).toBe(true);
		});

		it('should handle zero mass edge case', () => {
			const result = calculateCollision(0, 5, 10, 2, 'inelastic');
			expect(result.velocity1After).toBe(2);
			expect(result.velocity2After).toBe(2);
		});
	});

	describe('conservation laws', () => {
		it('should conserve momentum in elastic collision', () => {
			const m1 = 4;
			const m2 = 2;
			const v1 = 8;
			const v2 = -3;
			const result = calculateCollision(m1, m2, v1, v2, 'elastic');
			expect(result.initialMomentum).toBeCloseTo(26, 5);
			expect(result.finalMomentum).toBeCloseTo(26, 5);
			expect(result.momentumConserved).toBe(true);
		});

		it('should conserve momentum in inelastic collision', () => {
			const m1 = 3;
			const m2 = 4;
			const v1 = 12;
			const v2 = 5;
			const result = calculateCollision(m1, m2, v1, v2, 'inelastic');
			expect(result.initialMomentum).toBeCloseTo(56, 5);
			expect(result.finalMomentum).toBeCloseTo(56, 5);
			expect(result.momentumConserved).toBe(true);
		});

		it('should conserve kinetic energy in elastic collision', () => {
			const result = calculateCollision(1.5, 2.5, 10, 4, 'elastic');
			expect(result.initialKineticEnergy).toBeCloseTo(result.finalKineticEnergy, 2);
			expect(result.energyConserved).toBe(true);
		});

		it('should not conserve kinetic energy in inelastic collision', () => {
			const result = calculateCollision(2, 3, 8, 2, 'inelastic');
			expect(result.energyConserved).toBe(false);
			expect(result.finalKineticEnergy).toBeLessThan(result.initialKineticEnergy);
		});
	});

	describe('NSC Grade 12 momentum calculations', () => {
		it('should solve Grade 12 collision problem', () => {
			const result = calculateCollision(2, 2, 5, 0, 'elastic');
			expect(result.velocity1After).toBe(0);
			expect(result.velocity2After).toBe(5);
			expect(result.momentumConserved).toBe(true);
			expect(result.energyConserved).toBe(true);
		});

		it('should calculate impulse from collision', () => {
			const m1 = 1;
			const result = calculateCollision(m1, 3, 10, 0, 'elastic');
			expect(result.initialMomentum).toBe(10);
		});

		it('should handle car crash momentum problem', () => {
			const carMass = 1000;
			const truckMass = 5000;
			const carVelocity = 20;
			const truckVelocity = 0;
			const result = calculateCollision(
				carMass,
				truckMass,
				carVelocity,
				truckVelocity,
				'inelastic'
			);
			expect(result.momentumConserved).toBe(true);
			expect(result.velocity1After).toBeCloseTo(3.33, 1);
		});

		it('should handle bullet and block problem', () => {
			const bulletMass = 0.01;
			const blockMass = 2;
			const bulletVelocity = 500;
			const blockVelocity = 0;
			const result = calculateCollision(
				bulletMass,
				blockMass,
				bulletVelocity,
				blockVelocity,
				'inelastic'
			);
			expect(result.momentumConserved).toBe(true);
			expect(result.velocity1After).toBeCloseTo(2.49, 1);
		});
	});
});
