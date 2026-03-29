import katex from 'katex';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { SVG } from 'mathjax-full/js/output/svg.js';

RegisterHTMLHandler(liteAdaptor());

const svg = new SVG({ fontCache: 'local' });
const tex = new TeX({ packages: ['base', 'ams', 'noundefined'] });
const html = mathjax.document('', { InputJax: tex, OutputJax: svg });

export type MathRenderMode = 'katex' | 'mathjax' | 'ascii' | 'raw' | 'plain';

export interface RenderResult {
	html: string;
	mode: MathRenderMode;
	originalLatex: string;
}

const ASCII_MATH_MAP: Record<string, string> = {
	'\\alpha': 'a',
	'\\beta': 'B',
	'\\gamma': 'y',
	'\\delta': '8',
	'\\Delta': 'A',
	'\\epsilon': 'e',
	'\\zeta': 'z',
	'\\eta': 'n',
	'\\theta': '0',
	'\\iota': 'i',
	'\\kappa': 'k',
	'\\lambda': 'l',
	'\\mu': 'u',
	'\\nu': 'v',
	'\\xi': 'x',
	'\\pi': 'n',
	'\\rho': 'p',
	'\\sigma': 'o',
	'\\tau': 't',
	'\\upsilon': 'u',
	'\\phi': '0',
	'\\chi': 'x',
	'\\psi': 'w',
	'\\omega': 'w',
	'\\Omega': 'W',
	'\\sum': 'E',
	'\\prod': 'II',
	'\\int': 'f',
	'\\infty': 'oo',
	'\\partial': 'd',
	'\\times': 'x',
	'\\div': '/',
	'\\pm': '+/-',
	'\\cdot': '.',
	'\\sqrt': 'sqrt',
	'\\frac': '...',
	'\\approx': '~',
	'\\neq': '!=',
	'\\leq': '<=',
	'\\geq': '>=',
	'\\rightarrow': '->',
	'\\leftarrow': '<-',
	'\\Rightarrow': '=>',
	'\\Leftarrow': '<=',
	'\\subset': 'C',
	'\\supset': 'D',
	'\\in': 'e',
	'\\notin': '!e',
};

export function latexToAscii(latex: string): string {
	let ascii = latex
		.replace(/^\$|\$$/g, '')
		.replace(/^\\\[|\\\$$/, '')
		.replace(/^\\\(|\\\)$/, '')
		.trim();

	for (const [latexSymbol, asciiSymbol] of Object.entries(ASCII_MATH_MAP)) {
		ascii = ascii.replace(new RegExp(latexSymbol, 'g'), asciiSymbol);
	}

	ascii = ascii
		.replace(/_{([^}]+)}/g, '$1_')
		.replace(/\^{([^}]+)}/g, '^$1')
		.replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1)/($2)')
		.replace(/\\sqrt{([^}]+)}/g, 'sqrt($1)')
		.replace(/\\left|\\right/g, '')
		.replace(/\\quad|\\qquad/g, ' ')
		.replace(/\\text{([^}]+)}/g, '$1')
		.replace(/\\mathbf{([^}]+)}/g, '$1')
		.replace(/\{|\}/g, '')
		.replace(/\s+/g, ' ')
		.trim();

	return ascii;
}

export function latexToPlainText(latex: string): string {
	const ascii = latexToAscii(latex);
	return ascii
		.replace(/[<>]/g, '')
		.replace(/\^\d/g, (match) => ` to the power ${match[1]}`)
		.replace(/_/g, ' subscript ')
		.replace(/sqrt\(([^)]+)\)/g, 'square root of $1')
		.replace(/\(\s*([^)]+)\s*\)\s*\/\s*\(\s*([^)]+)\s*\)/g, '$1 over $2');
}

export function renderMath(
	latex: string,
	options?: { displayMode?: boolean; throwOnError?: boolean }
): RenderResult {
	const displayMode = options?.displayMode ?? false;
	const throwOnError = options?.throwOnError ?? false;

	try {
		const html_1 = katex.renderToString(latex, {
			displayMode,
			throwOnError,
			output: 'html',
			trust: false,
			strict: 'warn',
		});

		return {
			html: html_1,
			mode: 'katex',
			originalLatex: latex,
		};
	} catch {
		// KaTeX failed, try MathJax
	}

	try {
		const node = html.convert(latex, { displayMode });
		const adaptor = liteAdaptor();
		const svgHtml = adaptor.outerHTML(node);
		const svgMatch = svgHtml.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
		const svgContent = svgMatch ? svgMatch[0] : svgHtml;

		return {
			html: svgContent,
			mode: 'mathjax',
			originalLatex: latex,
		};
	} catch {
		// MathJax failed
	}

	const ascii = latexToAscii(latex);
	const plain = latexToPlainText(latex);

	return {
		html: `<span class="math-plain" title="${latex}">${plain || ascii}</span>`,
		mode: ascii !== plain ? 'ascii' : 'plain',
		originalLatex: latex,
	};
}

export function renderMathInline(latex: string): string {
	const result = renderMath(latex, { displayMode: false });
	return result.html;
}

export function renderMathBlock(latex: string): string {
	const result = renderMath(latex, { displayMode: true });
	return result.html;
}

export function detectMathExpressions(text: string): { hasMath: boolean; expressions: string[] } {
	const mathPatterns = [
		/\$\$[\s\S]+?\$\$/g,
		/\$[^$\n]+?\$/g,
		/\\\[[\s\S]+?\\\]/g,
		/\\\([\s\S]+?\\\)/g,
	];

	const expressions: string[] = [];

	for (const pattern of mathPatterns) {
		const matches = text.match(pattern);
		if (matches) {
			expressions.push(...matches);
		}
	}

	return {
		hasMath: expressions.length > 0,
		expressions,
	};
}

export function replaceMathWithHtml(text: string): string {
	const { expressions } = detectMathExpressions(text);

	let result = text;

	for (const expr of expressions) {
		try {
			const html = renderMath(expr).html;
			result = result.replace(expr, html);
		} catch {
			// Keep original if rendering fails
		}
	}

	return result;
}

export function validateLatex(latex: string): { valid: boolean; error?: string } {
	try {
		katex.renderToString(latex, { throwOnError: true });
		return { valid: true };
	} catch (err) {
		return {
			valid: false,
			error: err instanceof Error ? err.message : 'Invalid LaTeX',
		};
	}
}
