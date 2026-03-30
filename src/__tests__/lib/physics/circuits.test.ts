import { describe, expect, it } from 'vitest';
import { calculateCircuit, type Resistor } from '@/lib/physics/circuits';

describe('physics/circuits', () => {
	describe('series resistance', () => {
		it('should calculate total resistance for series resistors', () => {
			const resistors: Resistor[] = [
				{ id: 'r1', resistance: 10, config: 'series' },
				{ id: 'r2', resistance: 20, config: 'series' },
				{ id: 'r3', resistance: 30, config: 'series' },
			];
			const result = calculateCircuit(12, resistors);
			expect(result.equivalentResistance).toBe(60);
		});

		it('should calculate current in series circuit', () => {
			const resistors: Resistor[] = [
				{ id: 'r1', resistance: 5, config: 'series' },
				{ id: 'r2', resistance: 10, config: 'series' },
			];
			const result = calculateCircuit(30, resistors);
			expect(result.totalCurrent).toBe(2);
		});

		it('should calculate voltage drop across series resistor', () => {
			const resistors: Resistor[] = [{ id: 'r1', resistance: 100, config: 'series' }];
			const result = calculateCircuit(50, resistors);
			expect(result.voltageDrops[0].voltage).toBe(50);
			expect(result.voltageDrops[0].current).toBe(0.5);
			expect(result.voltageDrops[0].power).toBe(25);
		});

		it('should handle single series resistor', () => {
			const resistors: Resistor[] = [{ id: 'r1', resistance: 8, config: 'series' }];
			const result = calculateCircuit(24, resistors);
			expect(result.equivalentResistance).toBe(8);
			expect(result.totalCurrent).toBe(3);
		});
	});

	describe('parallel resistance', () => {
		it('should calculate equivalent resistance for two parallel resistors', () => {
			const resistors: Resistor[] = [
				{ id: 'r1', resistance: 10, config: 'parallel' },
				{ id: 'r2', resistance: 10, config: 'parallel' },
			];
			const result = calculateCircuit(10, resistors);
			expect(result.equivalentResistance).toBe(5);
		});

		it('should calculate equivalent resistance for three parallel resistors', () => {
			const resistors: Resistor[] = [
				{ id: 'r1', resistance: 6, config: 'parallel' },
				{ id: 'r2', resistance: 3, config: 'parallel' },
				{ id: 'r3', resistance: 6, config: 'parallel' },
			];
			const result = calculateCircuit(12, resistors);
			expect(result.equivalentResistance).toBe(1.5);
		});

		it('should calculate current splits correctly in parallel', () => {
			const resistors: Resistor[] = [
				{ id: 'r1', resistance: 10, config: 'parallel' },
				{ id: 'r2', resistance: 20, config: 'parallel' },
			];
			const result = calculateCircuit(20, resistors);
			expect(result.voltageDrops[0].current).toBe(2);
			expect(result.voltageDrops[1].current).toBe(1);
		});

		it('should handle unequal parallel resistances', () => {
			const resistors: Resistor[] = [
				{ id: 'r1', resistance: 100, config: 'parallel' },
				{ id: 'r2', resistance: 200, config: 'parallel' },
			];
			const result = calculateCircuit(100, resistors);
			expect(result.equivalentResistance).toBeCloseTo(66.67, 1);
		});

		it('should handle single parallel resistor', () => {
			const resistors: Resistor[] = [{ id: 'r1', resistance: 50, config: 'parallel' }];
			const result = calculateCircuit(25, resistors);
			expect(result.equivalentResistance).toBe(50);
			expect(result.totalCurrent).toBe(0.5);
		});
	});

	describe('mixed series-parallel circuits', () => {
		it('should calculate mixed circuit correctly', () => {
			const resistors: Resistor[] = [
				{ id: 'r1', resistance: 10, config: 'series' },
				{ id: 'r2', resistance: 20, config: 'parallel' },
				{ id: 'r3', resistance: 20, config: 'parallel' },
			];
			const result = calculateCircuit(40, resistors);
			expect(result.equivalentResistance).toBe(20);
		});

		it('should calculate total current in mixed circuit', () => {
			const resistors: Resistor[] = [
				{ id: 'r1', resistance: 5, config: 'series' },
				{ id: 'r2', resistance: 10, config: 'parallel' },
				{ id: 'r3', resistance: 10, config: 'parallel' },
			];
			const result = calculateCircuit(20, resistors);
			expect(result.equivalentResistance).toBe(10);
			expect(result.totalCurrent).toBe(2);
		});

		it('should handle complex mixed configuration', () => {
			const resistors: Resistor[] = [
				{ id: 'r1', resistance: 2, config: 'series' },
				{ id: 'r2', resistance: 6, config: 'parallel' },
				{ id: 'r3', resistance: 3, config: 'parallel' },
			];
			const result = calculateCircuit(12, resistors);
			expect(result.equivalentResistance).toBe(4);
			expect(result.totalCurrent).toBe(3);
		});
	});

	describe('Ohms Law calculations', () => {
		it('should calculate current using Ohms Law I = V/R', () => {
			const resistors: Resistor[] = [{ id: 'r1', resistance: 100, config: 'series' }];
			const result = calculateCircuit(50, resistors);
			expect(result.totalCurrent).toBe(0.5);
		});

		it('should calculate voltage drop V = IR', () => {
			const resistors: Resistor[] = [{ id: 'r1', resistance: 25, config: 'series' }];
			const result = calculateCircuit(100, resistors);
			expect(result.voltageDrops[0].voltage).toBe(100);
		});

		it('should calculate power P = IV', () => {
			const resistors: Resistor[] = [{ id: 'r1', resistance: 8, config: 'series' }];
			const result = calculateCircuit(16, resistors);
			expect(result.voltageDrops[0].power).toBe(32);
		});

		it('should calculate power using P = I²R', () => {
			const resistors: Resistor[] = [{ id: 'r1', resistance: 10, config: 'series' }];
			const result = calculateCircuit(20, resistors);
			expect(result.voltageDrops[0].power).toBe(40);
		});
	});

	describe('NSC Grade 12 circuit calculations', () => {
		it('should solve simple series circuit problem', () => {
			const resistors: Resistor[] = [
				{ id: 'r1', resistance: 4, config: 'series' },
				{ id: 'r2', resistance: 6, config: 'series' },
			];
			const result = calculateCircuit(20, resistors);
			expect(result.equivalentResistance).toBe(10);
			expect(result.totalCurrent).toBe(2);
		});

		it('should solve parallel circuit with equal resistors', () => {
			const resistors: Resistor[] = [
				{ id: 'r1', resistance: 12, config: 'parallel' },
				{ id: 'r2', resistance: 12, config: 'parallel' },
			];
			const result = calculateCircuit(12, resistors);
			expect(result.equivalentResistance).toBe(6);
			expect(result.totalCurrent).toBe(2);
		});

		it('should calculate voltage division in series', () => {
			const resistors: Resistor[] = [
				{ id: 'r1', resistance: 100, config: 'series' },
				{ id: 'r2', resistance: 300, config: 'series' },
			];
			const result = calculateCircuit(40, resistors);
			expect(result.voltageDrops[0].voltage).toBe(10);
			expect(result.voltageDrops[1].voltage).toBe(30);
		});

		it('should handle light bulb resistance calculation', () => {
			const resistors: Resistor[] = [{ id: 'bulb', resistance: 60, config: 'series' }];
			const result = calculateCircuit(240, resistors);
			expect(result.totalCurrent).toBe(4);
			expect(result.voltageDrops[0].power).toBe(960);
		});
	});

	describe('edge cases', () => {
		it('should handle empty resistor array', () => {
			const result = calculateCircuit(10, []);
			expect(result.equivalentResistance).toBe(0);
			expect(result.voltageDrops).toHaveLength(0);
		});

		it('should handle zero voltage', () => {
			const resistors: Resistor[] = [{ id: 'r1', resistance: 10, config: 'series' }];
			const result = calculateCircuit(0, resistors);
			expect(result.totalCurrent).toBe(0);
		});

		it('should calculate with very small resistance', () => {
			const resistors: Resistor[] = [{ id: 'r1', resistance: 0.1, config: 'series' }];
			const result = calculateCircuit(10, resistors);
			expect(result.totalCurrent).toBe(100);
		});
	});
});
