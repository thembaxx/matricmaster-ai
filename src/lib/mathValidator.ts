import { isChemicalNotation, renderChemistry } from './chemRenderer';
import { validateLatex } from './mathRenderer';

export interface ValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
	normalizedExpression: string;
}

export interface UnitConversion {
	from: string;
	to: string;
	factor: number;
}

const UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
	km: { m: 1000, cm: 100000, mm: 1000000, mi: 0.621371, ft: 3280.84 },
	m: { km: 0.001, cm: 100, mm: 1000, mi: 0.000621371, ft: 3.28084 },
	cm: { km: 0.00001, m: 0.01, mm: 10, mi: 0.0000062137, ft: 0.0328084 },
	mm: { km: 0.000001, m: 0.001, cm: 0.1, mi: 0.00000062137, ft: 0.00328084 },
	kg: { g: 1000, mg: 1000000, lb: 2.20462 },
	g: { kg: 0.001, mg: 1000, lb: 0.00220462 },
	mg: { kg: 0.000001, g: 0.001, lb: 0.00000220462 },
	s: { min: 1 / 60, h: 1 / 3600, ms: 1000 },
	min: { s: 60, h: 1 / 60, ms: 60000 },
	h: { s: 3600, min: 60, ms: 3600000 },
	A: { mA: 1000, uA: 1000000 },
	V: { mV: 1000, kV: 0.001 },
	J: { kJ: 0.001, cal: 0.239006, eV: 6.242e18 },
	W: { kW: 0.001, MW: 0.000001 },
};

export function validateMathExpression(latex: string): ValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	const validation = validateLatex(latex);

	if (!validation.valid) {
		errors.push(validation.error || 'Invalid LaTeX syntax');
	}

	const hasUnmatchedBraces = (latex.match(/{/g) || []).length !== (latex.match(/}/g) || []).length;
	if (hasUnmatchedBraces) {
		errors.push('Unmatched braces in expression');
	}

	const hasMathFunctions = /\\(sin|cos|tan|log|ln|sqrt|exp|abs)/i.test(latex);
	if (hasMathFunctions) {
		const hasCorrectArg =
			/\\(sin|cos|tan)\s*\{/i.test(latex) || /\\(sin|cos|tan)\s*[a-z]/i.test(latex);
		if (!hasCorrectArg) {
			warnings.push('Trigonometric functions may need proper argument syntax');
		}
	}

	const normalized = latex
		.replace(/\s+/g, ' ')
		.replace(/\s*,\s*/g, ',')
		.trim();

	if (normalized.includes('  ')) {
		warnings.push('Multiple spaces detected in expression');
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
		normalizedExpression: normalized,
	};
}

export function convertImageMathToLatex(imageText: string): string {
	let latex = imageText;

	latex = latex.replace(/(\d+)\s*x\s*(\d+)/gi, '$1\\times$2');
	latex = latex.replace(/(\d+)\s*\*\s*(\d+)/g, '$1\\times$2');

	latex = latex.replace(/sqrt\(([^)]+)\)/gi, '\\sqrt{$1}');
	latex = latex.replace(/square root of\s+(\w+)/gi, '\\sqrt{$1}');

	latex = latex.replace(/(\w+)\s*\^\s*(\d+)/g, '$1^{$2}');
	latex = latex.replace(/(\w+)\s*to the power of\s+(\d+)/gi, '$1^{$2}');

	latex = latex.replace(/(\w+)\s*_(\d+)/g, '$1_{$2}');
	latex = latex.replace(/(\w+)\s*subscript\s+(\d+)/gi, '$1_{$2}');

	latex = latex.replace(/pi/gi, '\\pi');
	latex = latex.replace(/alpha/gi, '\\alpha');
	latex = latex.replace(/beta/gi, '\\beta');
	latex = latex.replace(/gamma/gi, '\\gamma');
	latex = latex.replace(/theta/gi, '\\theta');
	latex = latex.replace(/delta/gi, '\\delta');

	latex = latex.replace(/\(\s+/g, '\\left(');
	latex = latex.replace(/\s+\)/g, '\\right)');
	latex = latex.replace(/\[/g, '\\[');
	latex = latex.replace(/\]/g, '\\]');

	return latex;
}

export function convertUnits(
	value: number,
	fromUnit: string,
	toUnit: string
): { result: number; factor: number } | null {
	const fromLower = fromUnit.toLowerCase().trim();
	const toLower = toUnit.toLowerCase().trim();

	if (fromLower === toLower) {
		return { result: value, factor: 1 };
	}

	const conversions = UNIT_CONVERSIONS[fromLower];
	if (!conversions) {
		return null;
	}

	const factor = conversions[toLower];
	if (factor === undefined) {
		return null;
	}

	return {
		result: value * factor,
		factor,
	};
}

export function detectUnit(text: string): { value: number; unit: string } | null {
	const unitPattern = /^([+-]?\d+\.?\d*)\s*([a-zA-Z%]+)$/;
	const match = text.match(unitPattern);

	if (match) {
		return {
			value: Number.parseFloat(match[1]),
			unit: match[2],
		};
	}

	return null;
}

export function normalizeMathInput(input: string): string {
	let normalized = input.trim();

	normalized = convertImageMathToLatex(normalized);

	if (isChemicalNotation(normalized)) {
		const result = renderChemistry(normalized);
		return result.html;
	}

	const validation = validateMathExpression(normalized);
	if (!validation.valid) {
		console.warn('Math validation errors:', validation.errors);
		return input.trim();
	}

	return validation.normalizedExpression;
}

export function extractNumericValue(text: string): number | null {
	const numberPattern = /([+-]?\d+\.?\d*)/;
	const match = text.match(numberPattern);

	if (match) {
		return Number.parseFloat(match[1]);
	}

	return null;
}

export function hasMathExpression(text: string): boolean {
	const mathPatterns = [
		/\$.*\$/,
		/\\\[.*\\\]/,
		/\\\([^)]*\\\)/,
		/[0-9]+\s*[+\-*÷×]\s*[0-9]+/,
		/[a-z]\s*=\s*[0-9]+/i,
		/(?:sqrt|square root|pi|alpha|beta)/i,
	];

	return mathPatterns.some((pattern) => pattern.test(text));
}

export function formatScientificNotation(num: number, decimals = 2): string {
	if (Math.abs(num) < 0.001 || Math.abs(num) > 1000000) {
		return num.toExponential(decimals);
	}

	return num.toPrecision(decimals);
}

export function parseMathQuery(query: string): {
	expression: string;
	unit: string | null;
	isEquation: boolean;
} {
	const equationPattern = /^(.+?)\s*=\s*(.+)$/;
	const equationMatch = query.match(equationPattern);

	if (equationMatch) {
		return {
			expression: `${equationMatch[1].trim()} = ${equationMatch[2].trim()}`,
			unit: null,
			isEquation: true,
		};
	}

	const { unit } = detectUnit(query) || { unit: null };

	return {
		expression: query,
		unit: unit || null,
		isEquation: false,
	};
}
