export type ChemRenderMode = 'unicode' | 'latex' | 'plain';

export interface ChemRenderResult {
	html: string;
	mode: ChemRenderMode;
	original: string;
}

const CHEMISTRY_LATEX_TO_UNICODE: Record<string, string> = {
	'\\rightarrow': '→',
	'\\leftarrow': '←',
	'\\Rightarrow': '⇒',
	'\\Leftarrow': '⇐',
	'\\leftrightarrow': '↔',
	'\\longleftrightarrow': '⇔',
	'\\uparrow': '↑',
	'\\downarrow': '↓',
	'\\alpha': 'α',
	'\\beta': 'β',
	'\\gamma': 'γ',
	'\\delta': 'δ',
	'\\epsilon': 'ε',
	'\\theta': 'θ',
	'\\lambda': 'λ',
	'\\mu': 'μ',
	'\\pi': 'π',
	'\\sigma': 'σ',
	'\\phi': 'φ',
	'\\omega': 'ω',
	'\\Delta': 'Δ',
	'\\Sigma': 'Σ',
	'\\Omega': 'Ω',
	'\\times': '×',
	'\\div': '÷',
	'\\cdot': '·',
	'\\pm': '±',
	'\\cong': '≅',
	'\\approx': '≈',
	'\\neq': '≠',
	'\\leq': '≤',
	'\\geq': '≥',
	'^{0}': '⁰',
	'^{1}': '¹',
	'^{2}': '²',
	'^{3}': '³',
	'^{4}': '⁴',
	'^{5}': '⁵',
	'^{6}': '⁶',
	'^{7}': '⁷',
	'^{8}': '⁸',
	'^{9}': '⁹',
	'^{-}': '⁻',
	'^{2-}': '²⁻',
	'^{3-}': '³⁻',
	'^{+}': '⁺',
	'_{2}': '₂',
	'_{3}': '₃',
	'_{4}': '₄',
	'_{5}': '₅',
	'\\quad': '',
};

const CHEMICAL_ELEMENTS: Record<string, string> = {
	H: 'H',
	He: 'He',
	Li: 'Li',
	Be: 'Be',
	B: 'B',
	C: 'C',
	N: 'N',
	O: 'O',
	F: 'F',
	Ne: 'Ne',
	Na: 'Na',
	Mg: 'Mg',
	Al: 'Al',
	Si: 'Si',
	P: 'P',
	S: 'S',
	Cl: 'Cl',
	Ar: 'Ar',
	K: 'K',
	Ca: 'Ca',
	Fe: 'Fe',
	Cu: 'Cu',
	Zn: 'Zn',
	Br: 'Br',
	Ag: 'Ag',
	I: 'I',
	Au: 'Au',
};

export function renderChemistry(latex: string): ChemRenderResult {
	try {
		let html = latex;

		for (const [latexSymbol, unicode] of Object.entries(CHEMISTRY_LATEX_TO_UNICODE)) {
			html = html.split(latexSymbol).join(unicode);
		}

		const subscriptPattern = /_(\d+)/g;
		html = html.replace(subscriptPattern, (_, num) => {
			const subscripts: Record<string, string> = {
				'0': '₀',
				'1': '₁',
				'2': '₂',
				'3': '₃',
				'4': '₄',
				'5': '₅',
				'6': '₆',
				'7': '₇',
				'8': '₈',
				'9': '₉',
			};
			return num
				.split('')
				.map((d: string) => subscripts[d] || d)
				.join('');
		});

		const superscriptPattern = /\^([+-]?\d?)/g;
		html = html.replace(superscriptPattern, (_, num) => {
			const superscripts: Record<string, string> = {
				'0': '⁰',
				'1': '¹',
				'2': '²',
				'3': '³',
				'4': '⁴',
				'5': '⁵',
				'6': '⁶',
				'7': '⁷',
				'8': '⁸',
				'9': '⁹',
				'+': '⁺',
				'-': '⁻',
			};
			return num
				.split('')
				.map((d: string) => superscripts[d] || d)
				.join('');
		});

		html = html.replace(/\{|\}/g, '');
		html = html.replace(/\\mathrm\{([^}]+)\}/g, '$1');
		html = html.replace(/\\text\{([^}]+)\}/g, '$1');
		html = html.replace(/\\mathbf\{([^}]+)\}/g, '$1');
		html = html.replace(/\\textit\{([^}]+)\}/g, '$1');

		const elementPattern = /\\([A-Z][a-z]?)(\d*)/g;
		html = html.replace(elementPattern, (_, element, subscript) => {
			const base = CHEMICAL_ELEMENTS[element] || element;
			return subscript ? `${base}<sub>${subscript}</sub>` : base;
		});

		if (html !== latex) {
			return { html, mode: 'unicode', original: latex };
		}
	} catch {
		// Fall through to plain
	}

	return {
		html: latex.replace(/[\\{}$]/g, ''),
		mode: 'plain',
		original: latex,
	};
}

export function latexToUnicode(latex: string): string {
	const result = renderChemistry(latex);
	return result.html;
}

export function unicodeToLatex(unicode: string): string {
	let latex = unicode;

	const reverseMap: Record<string, string> = {
		'→': '\\rightarrow',
		'←': '\\leftarrow',
		'⇒': '\\Rightarrow',
		'⇐': '\\Leftarrow',
		'↔': '\\leftrightarrow',
		'↑': '\\uparrow',
		'↓': '\\downarrow',
		α: '\\alpha',
		β: '\\beta',
		γ: '\\gamma',
		δ: '\\delta',
		θ: '\\theta',
		λ: '\\lambda',
		μ: '\\mu',
		π: '\\pi',
		σ: '\\sigma',
		φ: '\\phi',
		ω: '\\omega',
		'×': '\\times',
		'÷': '\\div',
		'·': '\\cdot',
		'±': '\\pm',
		'₁': '_{1}',
		'₂': '_{2}',
		'₃': '_{3}',
		'₄': '_{4}',
		'⁰': '^{0}',
		'¹': '^{1}',
		'²': '^{2}',
		'³': '^{3}',
		'⁴': '^{4}',
		'⁺': '^{+} ',
		'⁻': '^{-}',
	};

	for (const [char, replacement] of Object.entries(reverseMap)) {
		latex = latex.split(char).join(replacement);
	}

	return latex;
}

export function formatChemicalEquation(equation: string): string {
	const parts = equation.split(/->|→|<-|←|=/);

	if (parts.length >= 2) {
		const reactants = parts[0]
			.trim()
			.split('+')
			.map((s) => s.trim());
		const products = parts[1]
			.trim()
			.split('+')
			.map((s) => s.trim());

		const formattedReactants = reactants.map((r) => latexToUnicode(r)).join(' + ');
		const formattedProducts = products.map((p) => latexToUnicode(p)).join(' + ');

		return `${formattedReactants} → ${formattedProducts}`;
	}

	return latexToUnicode(equation);
}

export function isChemicalNotation(text: string): boolean {
	const indicators = [
		/->|→|<-|←|=/,
		/[A-Z][a-z]?\d/g,
		/\+\d*-|-\d*\+/,
		/\\(rightarrow|leftarrow|Delta|Sigma|Omega)/,
	];

	return indicators.some((pattern) => pattern.test(text));
}

export function detectChemistryExpressions(text: string): string[] {
	const patterns = [
		/\$[^$]+\$/g,
		/[A-Z][a-z]?\d*(?:\s*[+-]\s*[A-Z][a-z]?\d*)*\s*(?:->|→|<-|←|=)\s*[A-Z][a-z]?\d*(?:\s*[+-]\s*[A-Z][a-z]?\d*)*/g,
	];

	const expressions: string[] = [];

	for (const pattern of patterns) {
		const matches = text.match(pattern);
		if (matches) {
			expressions.push(...matches);
		}
	}

	return [...new Set(expressions)];
}
