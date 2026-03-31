import { describe, expect, it } from 'vitest';
import { calculateWave, generateWavePoints } from '@/lib/physics/waves';

describe('physics/waves', () => {
	describe('calculateWave', () => {
		it('should calculate wave properties for 50 Hz frequency', () => {
			const result = calculateWave(5, 50);
			expect(result.frequency).toBe(50);
			expect(result.wavelength).toBe(0.4);
			expect(result.speed).toBe(20);
			expect(result.period).toBe(0.02);
			expect(result.angularFrequency).toBeCloseTo(314.159, 2);
			expect(result.waveNumber).toBeCloseTo(15.708, 2);
		});

		it('should calculate wave properties for sound wave frequency', () => {
			const result = calculateWave(1, 440);
			expect(result.frequency).toBe(440);
			expect(result.wavelength).toBeCloseTo(0.04545, 4);
			expect(result.speed).toBeCloseTo(20, 4);
			expect(result.period).toBeCloseTo(0.00227, 4);
			expect(result.angularFrequency).toBeCloseTo(2764.6, 1);
		});

		it('should calculate wave properties for radio wave frequency', () => {
			const result = calculateWave(2, 100000000);
			expect(result.frequency).toBe(100000000);
			expect(result.wavelength).toBeCloseTo(2e-7, 9);
			expect(result.speed).toBe(20);
		});

		it('should handle zero frequency', () => {
			const result = calculateWave(5, 0);
			expect(result.frequency).toBe(0);
			expect(result.wavelength).toBe(0);
			expect(result.speed).toBe(0);
			expect(result.period).toBe(0);
		});

		it('should handle very small frequency', () => {
			const result = calculateWave(3, 0.001);
			expect(result.frequency).toBe(0.001);
			expect(result.wavelength).toBe(20000);
			expect(result.speed).toBe(20);
			expect(result.period).toBe(1000);
		});

		it('should verify wave equation v = fλ', () => {
			const result = calculateWave(4, 25);
			expect(result.speed).toBe(result.frequency * result.wavelength);
		});
	});

	describe('generateWavePoints', () => {
		it('should generate correct number of points', () => {
			const points = generateWavePoints(5, 2, 0, 100);
			expect(points).toHaveLength(100);
		});

		it('should generate sinusoidal wave with correct amplitude', () => {
			const points = generateWavePoints(5, 1, 0, 200);
			const maxY = Math.max(...points.map((p) => p.y));
			const minY = Math.min(...points.map((p) => p.y));
			expect(maxY).toBeCloseTo(5, 1);
			expect(minY).toBeCloseTo(-5, 1);
		});

		it('should apply phase shift correctly', () => {
			const pointsNoPhase = generateWavePoints(1, 1, 0, 200);
			const pointsWithPhase = generateWavePoints(1, 1, Math.PI / 2, 200);
			expect(pointsNoPhase[0].y).not.toBe(pointsWithPhase[0].y);
		});

		it('should generate points over two complete wavelengths', () => {
			const points = generateWavePoints(1, 1, 0, 100);
			const xRange = points[points.length - 1].x - points[0].x;
			expect(xRange).toBeGreaterThan(12);
			expect(xRange).toBeLessThan(13);
		});

		it('should generate correct x values progression', () => {
			const points = generateWavePoints(1, 1, 0, 5);
			expect(points[0].x).toBe(0);
			expect(points[1].x).toBeCloseTo(2.513);
			expect(points[2].x).toBeCloseTo(5.027);
			expect(points[3].x).toBeCloseTo(7.54);
			expect(points[4].x).toBeCloseTo(10.053);
		});

		it('should handle custom number of points', () => {
			const points50 = generateWavePoints(1, 1, 0, 50);
			const points500 = generateWavePoints(1, 1, 0, 500);
			expect(points50).toHaveLength(50);
			expect(points500).toHaveLength(500);
		});

		it('should return empty array for zero points', () => {
			const points = generateWavePoints(1, 1, 0, 0);
			expect(points).toHaveLength(0);
		});
	});

	describe('NSC Grade 12 wave calculations', () => {
		it('should calculate speed of sound in air', () => {
			const frequency = 500;
			const result = calculateWave(1, frequency);
			expect(result.wavelength).toBeCloseTo(0.04, 2);
			expect(result.speed).toBeCloseTo(20, 1);
		});

		it('should calculate wave period from frequency', () => {
			const frequency = 100;
			const result = calculateWave(1, frequency);
			expect(result.period).toBe(0.01);
		});

		it('should calculate wavelength from speed and frequency', () => {
			const frequency = 60;
			const result = calculateWave(1, frequency);
			expect(result.wavelength).toBeCloseTo(0.333, 2);
		});
	});
});
