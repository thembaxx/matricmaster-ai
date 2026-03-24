/**
 * Accessibility utilities for MatricMaster AI
 *
 * Export all accessibility-related utilities and components
 */

export type { AuditIssue, AuditResult } from './audit';
export {
	announceToScreenReader,
	getFocusableElements,
	initAccessibilityAudit,
	isFocusable,
	runAccessibilityAudit,
	trapFocus,
} from './audit';
