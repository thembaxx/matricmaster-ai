/**
 * Accessibility Audit Utility
 *
 * This utility performs client-side accessibility checks in development mode.
 * It helps identify common accessibility issues during development.
 *
 * Usage:
 * ```ts
 * import { runAccessibilityAudit } from '@/lib/accessibility/audit';
 * runAccessibilityAudit();
 * ```
 */

export interface AuditIssue {
	type: 'error' | 'warning' | 'info';
	rule: string;
	message: string;
	element?: HTMLElement;
	selector?: string;
}

export interface AuditResult {
	issues: AuditIssue[];
	summary: {
		errors: number;
		warnings: number;
		info: number;
	};
}

/**
 * Check for images missing alt text
 */
function checkImages(): AuditIssue[] {
	const issues: AuditIssue[] = [];
	const images = document.querySelectorAll('img');

	images.forEach((img, index) => {
		if (!img.hasAttribute('alt')) {
			issues.push({
				type: 'error',
				rule: 'img-alt',
				message: `Image #${index + 1} is missing alt attribute`,
				element: img as HTMLElement,
				selector: img.src ? `img[src="${img.src.substring(0, 50)}..."]` : `img#${index}`,
			});
		} else if (img.alt === '' && !img.hasAttribute('role') && !img.hasAttribute('aria-hidden')) {
			issues.push({
				type: 'warning',
				rule: 'img-alt-empty',
				message: `Image #${index + 1} has empty alt text. Ensure this is decorative.`,
				element: img as HTMLElement,
			});
		}
	});

	return issues;
}

/**
 * Check for form inputs missing labels
 */
function checkFormInputs(): AuditIssue[] {
	const issues: AuditIssue[] = [];
	const inputs = document.querySelectorAll('input, select, textarea');

	inputs.forEach((input, index) => {
		const id = input.id;
		const ariaLabel = input.getAttribute('aria-label');
		const ariaLabelledby = input.getAttribute('aria-labelledby');
		const hasLabel = id && document.querySelector(`label[for="${id}"]`);

		if (!ariaLabel && !ariaLabelledby && !hasLabel && !input.closest('button')) {
			const inputType = (input as HTMLInputElement).type || 'input';
			issues.push({
				type: 'error',
				rule: 'input-label',
				message: `${inputType} input #${index + 1} is missing a label`,
				element: input as HTMLElement,
			});
		}

		// Check for required fields
		if (input.hasAttribute('required') && !input.hasAttribute('aria-required')) {
			issues.push({
				type: 'info',
				rule: 'input-required',
				message: `Required input #${index + 1} should have aria-required="true"`,
				element: input as HTMLElement,
			});
		}

		// Check for invalid fields
		if (input.getAttribute('aria-invalid') === 'true') {
			const describedby = input.getAttribute('aria-describedby');
			if (!describedby || !document.getElementById(describedby)) {
				issues.push({
					type: 'warning',
					rule: 'input-error-describedby',
					message: `Invalid input #${index + 1} should have aria-describedby pointing to error message`,
					element: input as HTMLElement,
				});
			}
		}
	});

	return issues;
}

/**
 * Check for buttons without accessible names
 */
function checkButtons(): AuditIssue[] {
	const issues: AuditIssue[] = [];
	const buttons = document.querySelectorAll('button, [role="button"]');

	buttons.forEach((button, index) => {
		const hasTextContent = button.textContent?.trim();
		const hasAriaLabel = button.getAttribute('aria-label');
		const hasAriaLabelledby = button.getAttribute('aria-labelledby');
		const hasTitle = button.getAttribute('title');

		if (!hasTextContent && !hasAriaLabel && !hasAriaLabelledby && !hasTitle) {
			issues.push({
				type: 'error',
				rule: 'button-name',
				message: `Button #${index + 1} is missing an accessible name`,
				element: button as HTMLElement,
			});
		}
	});

	return issues;
}

/**
 * Check for links without accessible names
 */
function checkLinks(): AuditIssue[] {
	const issues: AuditIssue[] = [];
	const links = document.querySelectorAll('a');

	links.forEach((link, index) => {
		const hasTextContent = link.textContent?.trim();
		const hasAriaLabel = link.getAttribute('aria-label');
		const hasTitle = link.getAttribute('title');

		if (!hasTextContent && !hasAriaLabel && !hasTitle) {
			issues.push({
				type: 'error',
				rule: 'link-name',
				message: `Link #${index + 1} is missing an accessible name`,
				element: link as HTMLElement,
			});
		}

		// Check for links that open in new tab without indication
		if (
			link.target === '_blank' &&
			!hasAriaLabel?.includes('new') &&
			!hasTextContent?.includes('new')
		) {
			issues.push({
				type: 'warning',
				rule: 'link-new-tab',
				message: `Link #${index + 1} opens in new tab without indication`,
				element: link as HTMLElement,
			});
		}
	});

	return issues;
}

/**
 * Check for proper heading hierarchy
 */
function checkHeadings(): AuditIssue[] {
	const issues: AuditIssue[] = [];
	const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
	let lastLevel = 0;

	headings.forEach((heading, index) => {
		const level = Number.parseInt(heading.tagName[1], 10);

		if (index === 0 && level !== 1) {
			issues.push({
				type: 'warning',
				rule: 'heading-start',
				message: `First heading should be h1, found h${level}`,
				element: heading as HTMLElement,
			});
		}

		if (level > lastLevel + 1 && lastLevel !== 0) {
			issues.push({
				type: 'warning',
				rule: 'heading-skip',
				message: `Heading level skipped from h${lastLevel} to h${level}`,
				element: heading as HTMLElement,
			});
		}

		lastLevel = level;
	});

	return issues;
}

/**
 * Check for interactive elements with sufficient touch target size
 */
function checkTouchTargets(): AuditIssue[] {
	const issues: AuditIssue[] = [];
	const interactive = document.querySelectorAll(
		'button, a, input, select, textarea, [role="button"]'
	);

	interactive.forEach((element) => {
		const rect = element.getBoundingClientRect();
		const minSize = 44; // WCAG minimum touch target size

		if (rect.width < minSize || rect.height < minSize) {
			issues.push({
				type: 'warning',
				rule: 'touch-target',
				message: `Interactive element has small touch target (${Math.round(rect.width)}x${Math.round(rect.height)}px)`,
				element: element as HTMLElement,
			});
		}
	});

	return issues;
}

/**
 * Check for elements with low contrast (basic check)
 * Note: Full contrast checking requires computed styles and is complex
 */
function checkBasicContrast(): AuditIssue[] {
	const issues: AuditIssue[] = [];
	// This is a simplified check - full contrast checking would need more complex logic
	const textElements = document.querySelectorAll(
		'p, span, h1, h2, h3, h4, h5, h6, a, button, label'
	);

	textElements.forEach((element) => {
		const style = window.getComputedStyle(element);
		const fontSize = Number.parseFloat(style.fontSize);

		// Warn about very small text
		if (fontSize < 12) {
			issues.push({
				type: 'warning',
				rule: 'text-size',
				message: `Text element has very small font size (${fontSize}px)`,
				element: element as HTMLElement,
			});
		}
	});

	return issues;
}

/**
 * Check for missing lang attribute on html element
 */
function checkLanguage(): AuditIssue[] {
	const issues: AuditIssue[] = [];
	const html = document.documentElement;

	if (!html.hasAttribute('lang')) {
		issues.push({
			type: 'error',
			rule: 'html-lang',
			message: 'html element is missing lang attribute',
			element: html,
		});
	}

	return issues;
}

/**
 * Check for skip navigation link
 */
function checkSkipNav(): AuditIssue[] {
	const issues: AuditIssue[] = [];
	const skipLink = document.querySelector(
		'a[href="#main-content"], a[href="#content"], a[href="#main"]'
	);

	if (!skipLink) {
		issues.push({
			type: 'info',
			rule: 'skip-nav',
			message: 'No skip navigation link found',
		});
	}

	return issues;
}

/**
 * Check for ARIA landmarks
 */
function checkLandmarks(): AuditIssue[] {
	const issues: AuditIssue[] = [];

	const main = document.querySelector('main, [role="main"]');
	if (!main) {
		issues.push({
			type: 'warning',
			rule: 'landmark-main',
			message: 'No main landmark found',
		});
	}

	const nav = document.querySelector('nav, [role="navigation"]');
	if (!nav) {
		issues.push({
			type: 'info',
			rule: 'landmark-nav',
			message: 'No navigation landmark found',
		});
	}

	return issues;
}

/**
 * Run a complete accessibility audit
 */
export function runAccessibilityAudit(): AuditResult {
	if (process.env.NODE_ENV !== 'development') {
		console.log('[a11y-audit] Audit only runs in development mode');
		return { issues: [], summary: { errors: 0, warnings: 0, info: 0 } };
	}

	console.log('[a11y-audit] Running accessibility audit...');

	const allChecks = [
		...checkImages(),
		...checkFormInputs(),
		...checkButtons(),
		...checkLinks(),
		...checkHeadings(),
		...checkTouchTargets(),
		...checkBasicContrast(),
		...checkLanguage(),
		...checkSkipNav(),
		...checkLandmarks(),
	];

	const summary = {
		errors: allChecks.filter((i) => i.type === 'error').length,
		warnings: allChecks.filter((i) => i.type === 'warning').length,
		info: allChecks.filter((i) => i.type === 'info').length,
	};

	if (allChecks.length === 0) {
		console.log('[a11y-audit] No accessibility issues found!');
	} else {
		console.group('[a11y-audit] Issues found:');

		if (summary.errors > 0) {
			console.group(`Errors (${summary.errors})`);
			allChecks
				.filter((i) => i.type === 'error')
				.forEach((issue) => {
					console.error(`[${issue.rule}] ${issue.message}`, issue.element || '');
				});
			console.groupEnd();
		}

		if (summary.warnings > 0) {
			console.group(`Warnings (${summary.warnings})`);
			allChecks
				.filter((i) => i.type === 'warning')
				.forEach((issue) => {
					console.warn(`[${issue.rule}] ${issue.message}`, issue.element || '');
				});
			console.groupEnd();
		}

		if (summary.info > 0) {
			console.group(`Info (${summary.info})`);
			allChecks
				.filter((i) => i.type === 'info')
				.forEach((issue) => {
					console.info(`[${issue.rule}] ${issue.message}`, issue.element || '');
				});
			console.groupEnd();
		}

		console.groupEnd();
	}

	return { issues: allChecks, summary };
}

/**
 * Initialize automatic accessibility auditing in development.
 * Call this in your root layout or app component.
 */
export function initAccessibilityAudit(): void {
	if (process.env.NODE_ENV !== 'development') return;

	// Run audit after initial load
	if (typeof window !== 'undefined') {
		window.addEventListener('load', () => {
			setTimeout(() => runAccessibilityAudit(), 1000);
		});

		// Re-run audit when DOM changes (with debounce)
		let timeout: NodeJS.Timeout;
		const observer = new MutationObserver(() => {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				console.log('[a11y-audit] DOM changed, re-running audit...');
				runAccessibilityAudit();
			}, 2000);
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}
}

/**
 * Check if an element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
	if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {
		return false;
	}

	const tagName = element.tagName.toLowerCase();
	const tabIndex = element.getAttribute('tabindex');

	if (tabIndex !== null) {
		return Number.parseInt(tabIndex, 10) >= 0;
	}

	return (
		['a', 'area'].includes(tagName) || ['button', 'input', 'select', 'textarea'].includes(tagName)
	);
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
	const focusableSelectors = [
		'a[href]',
		'area[href]',
		'button:not([disabled])',
		'input:not([disabled]):not([type="hidden"])',
		'select:not([disabled])',
		'textarea:not([disabled])',
		'[tabindex]:not([tabindex="-1"])',
		'[contenteditable="true"]',
		'details > summary',
		'audio[controls]',
		'video[controls]',
	];

	return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors.join(', '))).filter(
		(el) => isFocusable(el)
	);
}

/**
 * Trap focus within a container element
 */
export function trapFocus(container: HTMLElement): () => void {
	const focusableElements = getFocusableElements(container);
	const firstFocusable = focusableElements[0];
	const lastFocusable = focusableElements[focusableElements.length - 1];

	function handleKeyDown(e: KeyboardEvent) {
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
	}

	container.addEventListener('keydown', handleKeyDown);

	// Focus first element
	firstFocusable?.focus();

	// Return cleanup function
	return () => {
		container.removeEventListener('keydown', handleKeyDown);
	};
}

/**
 * Announce a message to screen readers using a live region
 */
export function announceToScreenReader(
	message: string,
	politeness: 'polite' | 'assertive' = 'polite'
): void {
	const announcer = document.createElement('div');
	announcer.setAttribute('aria-live', politeness);
	announcer.setAttribute('aria-atomic', 'true');
	announcer.className = 'sr-only';
	document.body.appendChild(announcer);

	// Use setTimeout to ensure screen readers detect the change
	setTimeout(() => {
		announcer.textContent = message;
		setTimeout(() => {
			document.body.removeChild(announcer);
		}, 1000);
	}, 100);
}
