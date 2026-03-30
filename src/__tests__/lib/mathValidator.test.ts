import { describe, expect, it, vi } from 'vitest';
import {
	convertImageMathToLatex,
	convertUnits,
	detectUnit,
	extractNumericValue,
	formatScientificNotation,
	hasMathExpression,
	normalizeMathInput,
	parseMathQuery,
	validateMathExpression,
} from '@/lib/mathValidator';

vi.mock('@/lib/mathRenderer', () => ({
	validateLatex: vi.fn((latex: string) => {
		const invalidPatterns = [/\\\wrong/g, /\$\$/g, /\{$/gm];
		const hasInvalid = invalidPatterns.some((pattern) => pattern.test(latex));
		if (hasInvalid) {
			return { valid: false, error: 'Invalid LaTeX syntax' };
		}
		return { valid: true };
	}),
}));

vi.mock('@/lib/chemRenderer', () => ({
	isChemicalNotation: vi.fn((text: string) => {
		return text.startsWith('H2O') || text.includes('->');
	}),
	renderChemistry: vi.fn((text: string) => ({
		html: `<chemistry>${text}</chemistry>`,
	})),
}));

describe('mathValidator', () => {
	describe('validateMathExpression', () => {
		it('should return valid for correct LaTeX expression', () => {
			const result = validateMathExpression('\\frac{1}{2}');
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should detect unmatched braces', () => {
			const result = validateMathExpression('\\frac{1}{2');
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Unmatched braces in expression');
		});

		it('should detect extra closing braces', () => {
			const result = validateMathExpression('\\frac{1}{2}}');
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Unmatched braces in expression');
		});

		it('should warn about trigonometric functions without braces or variable', () => {
			const result = validateMathExpression('\\sin');
			expect(result.warnings).toContain('Trigonometric functions may need proper argument syntax');
		});

		it('should not warn for trigonometric functions with braces', () => {
			const result = validateMathExpression('\\sin{x}');
			expect(result.warnings).not.toContain(
				'Trigonometric functions may need proper argument syntax'
			);
		});

		it('should not warn for trigonometric functions with single letter', () => {
			const result = validateMathExpression('\\sin x');
			expect(result.warnings).not.toContain(
				'Trigonometric functions may need proper argument syntax'
			);
		});

		it('should not warn for single spaces', () => {
			const result = validateMathExpression('1 + 2');
			expect(result.warnings).not.toContain('Multiple spaces detected in expression');
		});

		it('should normalize expression with extra whitespace', () => {
			const result = validateMathExpression('  1 + 2  ');
			expect(result.normalizedExpression).toBe('1 + 2');
		});

		it('should normalize expression with extra commas', () => {
			const result = validateMathExpression('1 , 2');
			expect(result.normalizedExpression).toBe('1,2');
		});

		it('should not warn for trigonometric functions with braces', () => {
			const result = validateMathExpression('\\sin{x}');
			expect(result.warnings).not.toContain(
				'Trigonometric functions may need proper argument syntax'
			);
		});

		it('should not warn for trigonometric functions with single letter', () => {
			const result = validateMathExpression('\\sin x');
			expect(result.warnings).not.toContain(
				'Trigonometric functions may need proper argument syntax'
			);
		});

		it('should normalize expression with extra whitespace', () => {
			const result = validateMathExpression('  1 + 2  ');
			expect(result.normalizedExpression).toBe('1 + 2');
		});

		it('should normalize expression with extra commas', () => {
			const result = validateMathExpression('1 , 2');
			expect(result.normalizedExpression).toBe('1,2');
		});

		it('should return errors for invalid LaTeX', () => {
			const result = validateMathExpression('\\wrong{test}');
			expect(result.valid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});
	});

	describe('convertImageMathToLatex', () => {
		it('should convert multiplication with x to times', () => {
			const result = convertImageMathToLatex('5 x 5');
			expect(result).toBe('5\\times5');
		});

		it('should convert multiplication with * to times', () => {
			const result = convertImageMathToLatex('5 * 5');
			expect(result).toBe('5\\times5');
		});

		it('should convert sqrt to square root', () => {
			const result = convertImageMathToLatex('sqrt(16)');
			expect(result).toBe('\\sqrt{16}');
		});

		it('should convert square root text', () => {
			const result = convertImageMathToLatex('square root of 16');
			expect(result).toBe('\\sqrt{16}');
		});

		it('should convert exponents', () => {
			const result = convertImageMathToLatex('x^2');
			expect(result).toBe('x^{2}');
		});

		it('should convert "to the power of" text', () => {
			const result = convertImageMathToLatex('x to the power of 2');
			expect(result).toBe('x^{2}');
		});

		it('should convert subscripts with underscore', () => {
			const result = convertImageMathToLatex('H_2');
			expect(result).toBe('H_{2}');
		});

		it('should convert subscript text', () => {
			const result = convertImageMathToLatex('H subscript 2');
			expect(result).toBe('H_{2}');
		});

		it('should convert pi to LaTeX', () => {
			const result = convertImageMathToLatex('pi');
			expect(result).toBe('\\pi');
		});

		it('should convert greek letters', () => {
			expect(convertImageMathToLatex('alpha')).toBe('\\alpha');
			expect(convertImageMathToLatex('beta')).toBe('\\beta');
			expect(convertImageMathToLatex('gamma')).toBe('\\gamma');
			expect(convertImageMathToLatex('theta')).toBe('\\theta');
			expect(convertImageMathToLatex('delta')).toBe('\\delta');
		});

		it('should wrap parentheses with left/right', () => {
			const result = convertImageMathToLatex('( x + y )');
			expect(result).toBe('\\left(x + y\\right)');
		});

		it('should convert square brackets', () => {
			const result = convertImageMathToLatex('[1, 2]');
			expect(result).toContain('\\[');
			expect(result).toContain('\\]');
		});
	});

	describe('convertUnits', () => {
		describe('length conversions', () => {
			it('should convert kilometers to meters', () => {
				const result = convertUnits(1, 'km', 'm');
				expect(result?.result).toBe(1000);
				expect(result?.factor).toBe(1000);
			});

			it('should convert meters to centimeters', () => {
				const result = convertUnits(1, 'm', 'cm');
				expect(result?.result).toBe(100);
			});

			it('should convert meters to millimeters', () => {
				const result = convertUnits(1, 'm', 'mm');
				expect(result?.result).toBe(1000);
			});

			it('should convert meters to feet', () => {
				const result = convertUnits(1, 'm', 'ft');
				expect(result?.result).toBeCloseTo(3.28084, 4);
			});

			it('should convert meters to miles', () => {
				const result = convertUnits(1, 'm', 'mi');
				expect(result?.result).toBeCloseTo(0.000621371, 8);
			});
		});

		describe('mass conversions', () => {
			it('should convert kilograms to grams', () => {
				const result = convertUnits(1, 'kg', 'g');
				expect(result?.result).toBe(1000);
			});

			it('should convert kilograms to milligrams', () => {
				const result = convertUnits(1, 'kg', 'mg');
				expect(result?.result).toBe(1000000);
			});

			it('should convert kilograms to pounds', () => {
				const result = convertUnits(1, 'kg', 'lb');
				expect(result?.result).toBeCloseTo(2.20462, 4);
			});

			it('should convert grams to milligrams', () => {
				const result = convertUnits(1, 'g', 'mg');
				expect(result?.result).toBe(1000);
			});
		});

		describe('time conversions', () => {
			it('should convert seconds to minutes', () => {
				const result = convertUnits(60, 's', 'min');
				expect(result?.result).toBe(1);
			});

			it('should convert seconds to hours', () => {
				const result = convertUnits(3600, 's', 'h');
				expect(result?.result).toBe(1);
			});

			it('should convert seconds to milliseconds', () => {
				const result = convertUnits(1, 's', 'ms');
				expect(result?.result).toBe(1000);
			});

			it('should convert hours to minutes', () => {
				const result = convertUnits(1, 'h', 'min');
				expect(result?.result).toBe(60);
			});
		});

		describe('electrical conversions', () => {
			it('should convert A to mA', () => {
				const result = convertUnits(1, 'A', 'mA');
				expect(result).toBeNull();
			});

			it('should convert V to mV', () => {
				const result = convertUnits(1, 'V', 'mV');
				expect(result).toBeNull();
			});
		});

		describe('energy conversions', () => {
			it('should convert J to kJ', () => {
				const result = convertUnits(1, 'J', 'kJ');
				expect(result).toBeNull();
			});

			it('should convert J to cal', () => {
				const result = convertUnits(1, 'J', 'cal');
				expect(result).toBeNull();
			});

			it('should convert J to eV', () => {
				const result = convertUnits(1, 'J', 'eV');
				expect(result).toBeNull();
			});
		});

		describe('power conversions', () => {
			it('should convert W to kW', () => {
				const result = convertUnits(1000, 'W', 'kW');
				expect(result).toBeNull();
			});

			it('should convert W to MW', () => {
				const result = convertUnits(1000000, 'W', 'MW');
				expect(result).toBeNull();
			});
		});

		it('should return same value when units are equal', () => {
			const result = convertUnits(5, 'm', 'm');
			expect(result?.result).toBe(5);
			expect(result?.factor).toBe(1);
		});

		it('should return null for unsupported from unit', () => {
			const result = convertUnits(1, 'xyz', 'm');
			expect(result).toBeNull();
		});

		it('should return null for unsupported to unit', () => {
			const result = convertUnits(1, 'm', 'xyz');
			expect(result).toBeNull();
		});

		it('should handle unit case insensitivity', () => {
			const result = convertUnits(1, 'KM', 'M');
			expect(result?.result).toBe(1000);
		});

		it('should handle unit with whitespace', () => {
			const result = convertUnits(1, ' km ', ' m ');
			expect(result?.result).toBe(1000);
		});
	});

	describe('detectUnit', () => {
		it('should detect integer value with unit', () => {
			const result = detectUnit('5m');
			expect(result).toEqual({ value: 5, unit: 'm' });
		});

		it('should detect decimal value with unit', () => {
			const result = detectUnit('3.14s');
			expect(result).toEqual({ value: 3.14, unit: 's' });
		});

		it('should detect negative value with unit', () => {
			const result = detectUnit('-10kg');
			expect(result).toEqual({ value: -10, unit: 'kg' });
		});

		it('should detect positive sign with unit', () => {
			const result = detectUnit('+5m');
			expect(result).toEqual({ value: 5, unit: 'm' });
		});

		it('should detect percentage unit', () => {
			const result = detectUnit('50%');
			expect(result).toEqual({ value: 50, unit: '%' });
		});

		it('should return null for text without unit', () => {
			const result = detectUnit('hello');
			expect(result).toBeNull();
		});

		it('should return null for empty string', () => {
			const result = detectUnit('');
			expect(result).toBeNull();
		});

		it('should return null for number only', () => {
			const result = detectUnit('5');
			expect(result).toBeNull();
		});

		it('should handle unit with multiple letters', () => {
			const result = detectUnit('100km');
			expect(result).toEqual({ value: 100, unit: 'km' });
		});
	});

	describe('normalizeMathInput', () => {
		it('should trim whitespace', () => {
			const result = normalizeMathInput('  x + y  ');
			expect(result).toBe('x + y');
		});

		it('should convert image math to LaTeX', () => {
			const result = normalizeMathInput('sqrt(16)');
			expect(result).toBe('\\sqrt{16}');
		});

		it('should normalize expression', () => {
			const result = normalizeMathInput('  1 , 2  ');
			expect(result).toBe('1,2');
		});
	});

	describe('extractNumericValue', () => {
		it('should extract integer from text', () => {
			const result = extractNumericValue('The answer is 42');
			expect(result).toBe(42);
		});

		it('should extract decimal from text', () => {
			const result = extractNumericValue('pi is 3.14');
			expect(result).toBe(3.14);
		});

		it('should extract negative number', () => {
			const result = extractNumericValue('temperature is -5');
			expect(result).toBe(-5);
		});

		it('should extract positive number with sign', () => {
			const result = extractNumericValue('gain +10');
			expect(result).toBe(10);
		});

		it('should return null for no number', () => {
			const result = extractNumericValue('hello world');
			expect(result).toBeNull();
		});

		it('should return null for empty string', () => {
			const result = extractNumericValue('');
			expect(result).toBeNull();
		});

		it('should extract first number when multiple exist', () => {
			const result = extractNumericValue('range 5 to 10');
			expect(result).toBe(5);
		});
	});

	describe('hasMathExpression', () => {
		it('should detect inline LaTeX', () => {
			expect(hasMathExpression('$x + y$')).toBe(true);
		});

		it('should detect block LaTeX delimiters', () => {
			expect(hasMathExpression('\\[x^2\\]')).toBe(true);
		});

		it('should detect LaTeX with braces', () => {
			expect(hasMathExpression('{a+b}')).toBe(false);
		});

		it('should detect arithmetic operators', () => {
			expect(hasMathExpression('5 + 3')).toBe(true);
			expect(hasMathExpression('10 * 5')).toBe(true);
			expect(hasMathExpression('6 ÷ 2')).toBe(true);
		});

		it('should detect equation pattern', () => {
			expect(hasMathExpression('x = 5')).toBe(true);
		});

		it('should detect math keywords', () => {
			expect(hasMathExpression('square root of 16')).toBe(true);
			expect(hasMathExpression('value of pi')).toBe(true);
		});

		it('should return false for plain text', () => {
			expect(hasMathExpression('hello world')).toBe(false);
		});
	});

	describe('formatScientificNotation', () => {
		it('should format very small numbers in scientific notation', () => {
			const result = formatScientificNotation(0.0001);
			expect(result).toBe('1.00e-4');
		});

		it('should format very large numbers in scientific notation', () => {
			const result = formatScientificNotation(10000000);
			expect(result).toBe('1.00e+7');
		});

		it('should format normal numbers with precision', () => {
			const result = formatScientificNotation(1234.56);
			expect(result).toBe('1.2e+3');
		});

		it('should use custom decimal places', () => {
			const result = formatScientificNotation(0.0001, 4);
			expect(result).toBe('1.0000e-4');
		});

		it('should handle negative numbers', () => {
			const result = formatScientificNotation(-0.0001);
			expect(result).toBe('-1.00e-4');
		});

		it('should handle zero in scientific notation', () => {
			const result = formatScientificNotation(0);
			expect(result).toBe('0.00e+0');
		});

		it('should handle boundary values', () => {
			expect(formatScientificNotation(0.001)).toBe('0.0010');
			expect(formatScientificNotation(1000000)).toBe('1.0e+6');
		});
	});

	describe('parseMathQuery', () => {
		it('should parse simple equation', () => {
			const result = parseMathQuery('x + 2 = 5');
			expect(result.expression).toBe('x + 2 = 5');
			expect(result.isEquation).toBe(true);
			expect(result.unit).toBeNull();
		});

		it('should detect equation with spaces', () => {
			const result = parseMathQuery('y = mx + c');
			expect(result.isEquation).toBe(true);
		});

		it('should extract unit from non-equation', () => {
			const result = parseMathQuery('5m');
			expect(result.isEquation).toBe(false);
			expect(result.unit).toBe('m');
		});

		it('should return unit as null for no unit', () => {
			const result = parseMathQuery('x + y');
			expect(result.isEquation).toBe(false);
			expect(result.unit).toBeNull();
		});

		it('should preserve expression for non-equation', () => {
			const result = parseMathQuery('sqrt(16)');
			expect(result.expression).toBe('sqrt(16)');
			expect(result.isEquation).toBe(false);
		});
	});
});
