import { describe, expect, it } from 'vitest';
import {
	getGradientColors,
	getGradientColorsArray,
	SUBJECT_GRADIENTS,
} from '@/lib/subject-gradients';

describe('subject-gradients', () => {
	describe('SUBJECT_GRADIENTS', () => {
		it('should have mathematics gradient', () => {
			expect(SUBJECT_GRADIENTS.mathematics).toBeDefined();
			expect(SUBJECT_GRADIENTS.mathematics.primary).toBe('#667eea');
		});

		it('should have physics gradient', () => {
			expect(SUBJECT_GRADIENTS.physics).toBeDefined();
			expect(SUBJECT_GRADIENTS.physics.secondary).toBe('#38ef7d');
		});

		it('should have chemistry gradient', () => {
			expect(SUBJECT_GRADIENTS.chemistry).toBeDefined();
		});

		it('should have all required subjects', () => {
			const subjects = [
				'mathematics',
				'physics',
				'chemistry',
				'life-sciences',
				'english',
				'geography',
				'history',
				'accounting',
				'economics',
			];
			subjects.forEach((subject) => {
				expect(SUBJECT_GRADIENTS[subject]).toBeDefined();
			});
		});

		it('should have primary, secondary, and accent colors', () => {
			Object.values(SUBJECT_GRADIENTS).forEach((gradient) => {
				expect(gradient.primary).toBeDefined();
				expect(gradient.secondary).toBeDefined();
				expect(gradient.accent).toBeDefined();
			});
		});
	});

	describe('getGradientColors', () => {
		it('should return colors for mathematics', () => {
			const colors = getGradientColors('mathematics');
			expect(colors.primary).toBe('#667eea');
			expect(colors.secondary).toBe('#764ba2');
			expect(colors.accent).toBe('#a855f7');
		});

		it('should return colors for physics', () => {
			const colors = getGradientColors('physics');
			expect(colors.primary).toBe('#11998e');
			expect(colors.secondary).toBe('#38ef7d');
		});

		it('should return default colors for unknown subject', () => {
			const colors = getGradientColors('unknown-subject');
			expect(colors.primary).toBe('#667eea');
			expect(colors.secondary).toBe('#764ba2');
			expect(colors.accent).toBe('#a855f7');
		});

		it('should handle life-sciences', () => {
			const colors = getGradientColors('life-sciences');
			expect(colors.primary).toBe('#56ab2f');
		});

		it('should handle geography', () => {
			const colors = getGradientColors('geography');
			expect(colors.primary).toBe('#8e2de2');
		});

		it('should handle history', () => {
			const colors = getGradientColors('history');
			expect(colors.primary).toBe('#cb2d3e');
		});

		it('should handle accounting', () => {
			const colors = getGradientColors('accounting');
			expect(colors.primary).toBe('#0f4c75');
		});

		it('should handle economics', () => {
			const colors = getGradientColors('economics');
			expect(colors.primary).toBe('#f59e0b');
		});
	});

	describe('getGradientColorsArray', () => {
		it('should return array of three colors', () => {
			const colors = getGradientColorsArray('mathematics');
			expect(colors).toHaveLength(3);
			expect(colors[0]).toBe('#667eea');
			expect(colors[1]).toBe('#764ba2');
			expect(colors[2]).toBe('#a855f7');
		});

		it('should return default colors for unknown subject', () => {
			const colors = getGradientColorsArray('unknown');
			expect(colors).toHaveLength(3);
		});
	});
});
