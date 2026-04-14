/**
 * Accessibility Service for Science Simulations & Math Rendering
 *
 * Purpose: Ensures all science simulations, math rendering (MathJax/KaTeX),
 * and interactive content are accessible to users with disabilities.
 *
 * Covers:
 * - Screen reader support for math content
 * - Keyboard navigation for simulations
 * - ARIA labels and roles
 * - Color contrast and visual accessibility
 * - Focus management
 * - Alternative text descriptions for visual content
 */

// ========================
// MATH ACCESSIBILITY
// ========================

/**
 * Generate accessible math description for screen readers
 * Converts LaTeX to spoken math description
 */
export function generateMathSpeech(latex: string): string {
	// Common LaTeX to speech mappings
	const mappings: Record<string, string> = {
		// Fractions
		'\\frac': 'fraction',
		// Square root
		'\\sqrt': 'square root of',
		// Superscripts
		'^{2}': 'squared',
		'^{3}': 'cubed',
		// Greek letters
		'\\alpha': 'alpha',
		'\\beta': 'beta',
		'\\gamma': 'gamma',
		'\\delta': 'delta',
		'\\pi': 'pi',
		'\\theta': 'theta',
		// Operators
		'\\times': 'times',
		'\\div': 'divided by',
		'\\pm': 'plus or minus',
		'\\leq': 'less than or equal to',
		'\\geq': 'greater than or equal to',
		'\\neq': 'not equal to',
		'\\approx': 'approximately equal to',
		'\\infty': 'infinity',
		// Sum and integral
		'\\sum': 'sum of',
		'\\int': 'integral of',
		// Parentheses
		'\\left(': 'open parenthesis',
		'\\right)': 'close parenthesis',
		'\\left[': 'open bracket',
		'\\right]': 'close bracket',
	};

	let speech = latex;

	// Apply mappings
	for (const [latexSymbol, speechText] of Object.entries(mappings)) {
		speech = speech.replace(new RegExp(latexSymbol.replace('\\', '\\\\'), 'g'), speechText);
	}

	// Handle subscripts
	speech = speech.replace(/_\{([^}]+)\}/g, 'sub $1 end sub');
	speech = speech.replace(/_([a-zA-Z0-9])/g, 'sub $1 end sub');

	// Handle superscripts (general case)
	speech = speech.replace(/\^\{([^}]+)\}/g, 'to the power of $1');

	// Clean up
	speech = speech
		.replace(/\\left|\\right/g, '')
		.replace(/[{}]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

	return speech;
}

/**
 * Create accessible math wrapper with ARIA attributes
 */
export function createAccessibleMath(
	mathContent: string,
	role: 'math' | 'chemistry' = 'math'
): {
	html: string;
	ariaLabel: string;
} {
	const speechDescription = generateMathSpeech(mathContent);

	return {
		html: `<div
			role="${role === 'math' ? 'math' : 'img'}"
			aria-label="${speechDescription}"
			aria-describedby="math-description-${Math.random().toString(36).slice(2, 9)}"
			tabindex="0"
			class="accessible-math"
		>
			${mathContent}
			<span id="math-description" class="sr-only">${speechDescription}</span>
		</div>`,
		ariaLabel: speechDescription,
	};
}

// ========================
// SIMULATION ACCESSIBILITY
// ========================

export interface SimulationAccessibilityConfig {
	name: string;
	description: string;
	keyboardControls: KeyboardControl[];
	alternativeText: string;
	ariaRole: string;
}

export interface KeyboardControl {
	key: string;
	action: string;
	description: string;
}

/**
 * Generate accessibility configuration for a simulation
 */
export function createSimulationAccessibility(
	name: string,
	description: string,
	controls: KeyboardControl[]
): SimulationAccessibilityConfig {
	return {
		name,
		description,
		keyboardControls: controls,
		alternativeText: `Interactive simulation: ${name}. ${description}`,
		ariaRole: 'application',
	};
}

/**
 * Common keyboard controls for simulations
 */
export const COMMON_CONTROLS = {
	ARROW_UP: { key: 'ArrowUp', action: 'increase', description: 'Increase value or move up' },
	ARROW_DOWN: { key: 'ArrowDown', action: 'decrease', description: 'Decrease value or move down' },
	ARROW_LEFT: { key: 'ArrowLeft', action: 'previous', description: 'Go to previous item' },
	ARROW_RIGHT: { key: 'ArrowRight', action: 'next', description: 'Go to next item' },
	SPACE: { key: ' ', action: 'select', description: 'Select or activate' },
	ENTER: { key: 'Enter', action: 'confirm', description: 'Confirm or submit' },
	ESCAPE: { key: 'Escape', action: 'cancel', description: 'Cancel or close' },
	TAB: { key: 'Tab', action: 'focus_next', description: 'Move to next interactive element' },
	SHIFT_TAB: {
		key: 'Shift+Tab',
		action: 'focus_prev',
		description: 'Move to previous interactive element',
	},
} as const;

// ========================
// CIRCUIT DIAGRAM ACCESSIBILITY
// ========================

export interface CircuitComponent {
	type: 'resistor' | 'capacitor' | 'inductor' | 'battery' | 'switch' | 'led' | 'wire';
	value?: string;
	position: { x: number; y: number };
	id: string;
}

/**
 * Generate text description of circuit for screen readers
 */
export function describeCircuit(components: CircuitComponent[]): string {
	if (components.length === 0) {
		return 'Empty circuit diagram';
	}

	const descriptions = components.map((comp) => {
		const typeDesc = comp.type.charAt(0).toUpperCase() + comp.type.slice(1);
		const valueDesc = comp.value ? ` with value ${comp.value}` : '';
		return `${typeDesc}${valueDesc}`;
	});

	return `Circuit diagram containing: ${descriptions.join(', ')}. Use keyboard navigation to explore components.`;
}

// ========================
// CHART ACCESSIBILITY
// ========================

export interface AccessibleChartData {
	title: string;
	description: string;
	dataPoints: Array<{ label: string; value: number }>;
	chartType: 'bar' | 'line' | 'pie' | 'scatter';
}

/**
 * Generate accessible data table alternative for charts
 */
export function createAccessibleDataTable(chartData: AccessibleChartData): string {
	const rows = chartData.dataPoints
		.map((point) => `<tr><th scope="row">${point.label}</th><td>${point.value}</td></tr>`)
		.join('');

	return `
		<table role="table" aria-label="${chartData.title}" aria-describedby="chart-desc-${chartData.title.toLowerCase().replace(/\s+/g, '-')}">
			<caption id="chart-desc">${chartData.description}</caption>
			<thead>
				<tr>
					<th scope="col">Category</th>
					<th scope="col">Value</th>
				</tr>
			</thead>
			<tbody>
				${rows}
			</tbody>
		</table>
	`;
}

/**
 * Generate chart accessibility announcement
 */
export function announceChart(chartData: AccessibleChartData): string {
	const summary = chartData.dataPoints.map((p) => `${p.label}: ${p.value}`).join(', ');

	return `Chart: ${chartData.title}. ${chartData.description}. Data points: ${summary}`;
}

// ========================
// COLOR CONTRAST UTILITIES
// ========================

/**
 * Check WCAG 2.1 AA color contrast compliance
 */
export function checkContrastRatio(
	foreground: string,
	background: string
): {
	ratio: number;
	aaNormal: boolean;
	aaLarge: boolean;
	aaaNormal: boolean;
	aaaLarge: boolean;
} {
	const fg = parseColor(foreground);
	const bg = parseColor(background);

	const fgLuminance = getRelativeLuminance(fg);
	const bgLuminance = getRelativeLuminance(bg);

	const ratio =
		(Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05);

	return {
		ratio: Math.round(ratio * 100) / 100,
		aaNormal: ratio >= 4.5, // AA normal text
		aaLarge: ratio >= 3, // AA large text
		aaaNormal: ratio >= 7, // AAA normal text
		aaaLarge: ratio >= 4.5, // AAA large text
	};
}

function parseColor(hex: string): { r: number; g: number; b: number } {
	const cleaned = hex.replace('#', '');
	return {
		r: Number.parseInt(cleaned.slice(0, 2), 16) / 255,
		g: Number.parseInt(cleaned.slice(2, 4), 16) / 255,
		b: Number.parseInt(cleaned.slice(4, 6), 16) / 255,
	};
}

function getRelativeLuminance(color: { r: number; g: number; b: number }): number {
	const [rs, gs, bs] = [color.r, color.g, color.b].map((c) =>
		c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
	);
	return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// ========================
// FOCUS MANAGEMENT
// ========================

/**
 * Manage focus for interactive elements
 */
export function focusElement(elementId: string): void {
	const element = document.getElementById(elementId);
	if (element) {
		element.focus();
		element.setAttribute('tabindex', '-1');
	}
}

/**
 * Create focus trap for modals/dialogs
 */
export function createFocusTrap(container: HTMLElement): {
	activate: () => void;
	deactivate: () => void;
} {
	const focusableElements = container.querySelectorAll(
		'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
	);

	const firstFocusable = focusableElements[0] as HTMLElement;
	const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

	const handleTabKey = (e: KeyboardEvent) => {
		if (e.key !== 'Tab') return;

		if (e.shiftKey) {
			if (document.activeElement === firstFocusable) {
				e.preventDefault();
				lastFocusable?.focus();
			}
		} else {
			if (document.activeElement === lastFocusable) {
				e.preventDefault();
				firstFocusable?.focus();
			}
		}
	};

	return {
		activate: () => {
			document.addEventListener('keydown', handleTabKey);
			firstFocusable?.focus();
		},
		deactivate: () => {
			document.removeEventListener('keydown', handleTabKey);
		},
	};
}

// ========================
// SCREEN READER ANNOUNCEMENTS
// ========================

/**
 * Create live region for screen reader announcements
 */
export function createLiveRegion(id = 'sr-live-region'): void {
	if (document.getElementById(id)) return;

	const liveRegion = document.createElement('div');
	liveRegion.id = id;
	liveRegion.setAttribute('aria-live', 'polite');
	liveRegion.setAttribute('aria-atomic', 'true');
	liveRegion.className = 'sr-only';
	document.body.appendChild(liveRegion);
}

/**
 * Announce message to screen readers
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
	let liveRegion = document.getElementById('sr-live-region');

	if (!liveRegion) {
		createLiveRegion();
		liveRegion = document.getElementById('sr-live-region')!;
	}

	liveRegion.setAttribute('aria-live', priority);
	liveRegion.textContent = message;

	// Clear after delay to prevent repeated announcements
	setTimeout(() => {
		if (liveRegion) {
			liveRegion.textContent = '';
		}
	}, 3000);
}

// ========================
// ACCESSIBILITY AUDIT UTILITIES
// ========================

export interface AccessibilityIssue {
	element: string;
	type: 'missing_alt' | 'missing_aria' | 'low_contrast' | 'keyboard_trap' | 'missing_label';
	severity: 'critical' | 'serious' | 'moderate';
	description: string;
	suggestion: string;
}

/**
 * Audit a page for common accessibility issues
 */
export function auditPageAccessibility(
	container: HTMLElement = document.body
): AccessibilityIssue[] {
	const issues: AccessibilityIssue[] = [];

	// Check images without alt text
	const images = container.querySelectorAll('img:not([alt]), img[alt=""]');
	images.forEach((img) => {
		issues.push({
			element: img.tagName.toLowerCase(),
			type: 'missing_alt',
			severity: 'critical',
			description: 'Image missing alternative text',
			suggestion: 'Add descriptive alt text or alt="" for decorative images',
		});
	});

	// Check interactive elements without labels
	const buttons = container.querySelectorAll(
		'button:not([aria-label]):not([aria-labelledby]):not([title])'
	);
	buttons.forEach((btn) => {
		if (!btn.textContent?.trim()) {
			issues.push({
				element: btn.tagName.toLowerCase(),
				type: 'missing_label',
				severity: 'serious',
				description: 'Button without accessible label',
				suggestion: 'Add aria-label, aria-labelledby, or visible text content',
			});
		}
	});

	// Check for proper heading hierarchy
	const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
	let lastLevel = 0;
	headings.forEach((heading) => {
		const level = Number.parseInt(heading.tagName[1], 10);
		if (level > lastLevel + 1 && lastLevel !== 0) {
			issues.push({
				element: heading.tagName.toLowerCase(),
				type: 'missing_aria',
				severity: 'moderate',
				description: `Heading level skipped from h${lastLevel} to h${level}`,
				suggestion: 'Maintain sequential heading hierarchy',
			});
		}
		lastLevel = level;
	});

	// Check forms without labels
	const inputs = container.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
	inputs.forEach((input) => {
		const id = input.getAttribute('id');
		if (id) {
			const label = container.querySelector(`label[for="${id}"]`);
			if (!label) {
				issues.push({
					element: input.tagName.toLowerCase(),
					type: 'missing_label',
					severity: 'serious',
					description: 'Form input without associated label',
					suggestion: 'Add a <label> element or aria-label attribute',
				});
			}
		}
	});

	return issues;
}
