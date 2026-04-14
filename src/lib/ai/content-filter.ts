/**
 * AI Content Filter & Prompt Injection Protection
 *
 * Purpose: Protects against prompt injection, filters harmful AI output,
 * and ensures all AI-generated content is safe and appropriate for Grade 12 students.
 *
 * This module provides:
 * 1. Input sanitization - strips prompt injection attempts
 * 2. Output filtering - catches inappropriate/harmful AI responses
 * 3. Rate limiting per user to prevent abuse
 * 4. Content classification for monitoring
 */

// ========================
// PROMPT INJECTION PATTERNS
// ========================

const PROMPT_INJECTION_PATTERNS = [
	// Role override attempts
	/ignore\s+(previous|all)\s+(instructions|rules|prompts|directives)/i,
	/you\s+are\s+(now|no\s+longer)\s+/i,
	/disregard\s+(previous|all)\s+(instructions|rules)/i,
	/forget\s+(your\s+)?(instructions|role|rules|previous)/i,
	/override\s+(your\s+)?(system\s+)?(prompt|instructions|rules)/i,
	/bypass\s+(all\s+)?(security|restrictions|filters|rules)/i,
	/act\s+as\s+(unrestricted|unfiltered|jailbreak)/i,
	/do\s+not\s+follow\s+(your\s+)?(instructions|rules|guidelines)/i,
	/system\s*[:-]?\s*override/i,
	/system\s*[:-]?\s*prompt\s*[:-]?\s*/i,

	// Jailbreak patterns
	/DAN\s+mode/i,
	/developer\s+mode/i,
	/unrestricted\s+mode/i,
	/jailbreak/i,
	/enable\s+(god\s*)?mode/i,

	// Data exfiltration attempts
	/reveal\s+(your\s+)?(system\s+)?(prompt|instructions|configuration)/i,
	/what\s+are\s+your\s+(instructions|rules|guidelines|prompt)/i,
	/show\s+me\s+your\s+(system\s+)?(prompt|instructions)/i,
	/print\s+(your\s+)?(full\s+)?(system\s+)?(prompt|instructions)/i,
	/export\s+(your\s+)?(configuration|settings)/i,

	// Harmful content
	/how\s+to\s+(make|build|create).*(bomb|weapon|drug|poison|exploit)/i,
	/tell\s+me\s+how\s+to\s+(hack|steal|break\s+into|exploit)/i,
	/write\s+(a|an)\s*(exploit|malware|virus|keylogger|ransomware)/i,
	/generate\s+(harmful|dangerous|illegal|explicit)/i,
];

const INAPPROPRIATE_OUTPUT_PATTERNS = [
	// Explicit content
	/fuck|shit|damn|bitch|asshole|bastard|cock|dick|pussy/i,
	/nigger|nigga|faggot|retard|cunt/i,
	/porn|sex|nude|naked|explicit/i,

	// Harmful instructions
	/you\s+should\s+(kill|hurt|harm|steal|destroy)/i,
	/it's\s+okay\s+to\s+(cheat|steal|lie|harm)/i,

	// Self-harm indicators
	/suicide|kill\s+yourself|kys|harm\s+yourself/i,

	// Academic dishonesty (encouraging cheating)
	/just\s+copy\s+(the\s+)?(answer|work|homework)/i,
	/cheat\s+on\s+(the\s+)?(exam|test)/i,
];

// ========================
// TYPES & SCHEMAS
// ========================

export interface ContentFilterResult {
	isSafe: boolean;
	sanitizedInput: string;
	riskLevel: 'low' | 'medium' | 'high' | 'critical';
	flaggedPatterns: string[];
	action: 'allow' | 'sanitize' | 'block';
	reason?: string;
}

export interface OutputFilterResult {
	isSafe: boolean;
	filteredOutput: string;
	riskLevel: 'low' | 'medium' | 'high' | 'critical';
	flaggedCategories: string[];
	action: 'allow' | 'redact' | 'block';
}

export interface ContentClassification {
	category: string;
	confidence: number;
	isAppropriate: boolean;
}

// ========================
// INPUT FILTERING
// ========================

/**
 * Analyze and sanitize user input for prompt injection attempts
 */
export function analyzeInput(input: string): ContentFilterResult {
	const flaggedPatterns: string[] = [];
	let riskScore = 0;

	// Check for prompt injection patterns
	for (const pattern of PROMPT_INJECTION_PATTERNS) {
		const match = input.match(pattern);
		if (match) {
			flaggedPatterns.push(match[0]);
			riskScore += 3; // High weight for injection attempts
		}
	}

	// Check for excessive length (potential DoS)
	if (input.length > 10000) {
		flaggedPatterns.push('excessive_length');
		riskScore += 1;
	}

	// Check for encoded content attempts
	if (input.includes('\\x') || input.includes('\\u') || input.includes('%')) {
		const encodedCount = (input.match(/\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}|%[0-9a-fA-F]{2}/g) || [])
			.length;
		if (encodedCount > 5) {
			flaggedPatterns.push('encoded_content');
			riskScore += 2;
		}
	}

	// Determine risk level and action
	const riskLevel = getRiskLevel(riskScore);
	const action = getAction(riskLevel);

	// Sanitize input (remove dangerous patterns)
	const sanitizedInput = sanitizeInput(input);

	return {
		isSafe: riskLevel !== 'critical' && riskLevel !== 'high',
		sanitizedInput,
		riskLevel,
		flaggedPatterns,
		action,
		reason: flaggedPatterns.length > 0 ? `Flagged: ${flaggedPatterns.join(', ')}` : undefined,
	};
}

/**
 * Sanitize input by removing or escaping dangerous patterns
 */
function sanitizeInput(input: string): string {
	let sanitized = input;

	// Remove/neutralize prompt injection attempts
	for (const pattern of PROMPT_INJECTION_PATTERNS) {
		sanitized = sanitized.replace(pattern, '[REDACTED]');
	}

	// Remove excessive whitespace/newlines (prevent context manipulation)
	sanitized = sanitized.replace(/\n{4,}/g, '\n\n\n');

	// Limit length
	if (sanitized.length > 10000) {
		sanitized = `${sanitized.slice(0, 10000)}\n\n[Input truncated due to length]`;
	}

	return sanitized;
}

// ========================
// OUTPUT FILTERING
// ========================

/**
 * Filter AI output to catch inappropriate content
 */
export function filterOutput(output: string): OutputFilterResult {
	const flaggedCategories: string[] = [];
	let riskScore = 0;

	// Check for profanity/inappropriate language
	for (const pattern of INAPPROPRIATE_OUTPUT_PATTERNS) {
		const match = output.match(pattern);
		if (match) {
			const category = categorizePattern(match[0]);
			if (!flaggedCategories.includes(category)) {
				flaggedCategories.push(category);
			}
			riskScore += category === 'hate_speech' || category === 'explicit' ? 5 : 3;
		}
	}

	// Check for self-harm content (critical for student wellbeing)
	if (/\b(suicide|kill yourself|harm yourself|end it all|don't deserve to live)\b/i.test(output)) {
		flaggedCategories.push('self_harm');
		riskScore += 10; // Critical
	}

	// Check for academic dishonesty encouragement
	if (/\b(just copy|cheat|don't need to study|nobody will know)\b/i.test(output)) {
		flaggedCategories.push('academic_dishonesty');
		riskScore += 4;
	}

	// Check for medical advice (AI should not give medical advice)
	if (/\b(you should take|prescription|dosage|treatment for|diagnose)\b/i.test(output)) {
		flaggedCategories.push('medical_advice');
		riskScore += 3;
	}

	const riskLevel = getRiskLevel(riskScore);
	const action = getOutputAction(riskLevel);

	// Filter/redact inappropriate content
	const filteredOutput = redactOutput(output, flaggedCategories);

	return {
		isSafe: riskLevel !== 'critical',
		filteredOutput,
		riskLevel,
		flaggedCategories,
		action,
	};
}

/**
 * Redact inappropriate content from output
 */
function redactOutput(output: string, categories: string[]): string {
	let filtered = output;

	if (categories.includes('explicit') || categories.includes('profanity')) {
		// Replace profanity with [REDACTED]
		const profanityPattern = /fuck|shit|damn|bitch|asshole|bastard/gi;
		filtered = filtered.replace(profanityPattern, '[REDACTED]');
	}

	if (categories.includes('self_harm')) {
		// Replace with crisis intervention message
		return 'I notice you might be going through a difficult time. Please reach out to someone you trust or contact a counselor. You can also call the South African Depression and Anxiety Group (SADAG) at 0800 567 567 for free support.';
	}

	if (categories.includes('medical_advice')) {
		filtered +=
			'\n\n[Note: For health concerns, please consult a qualified healthcare professional.]';
	}

	return filtered;
}

/**
 * Categorize a flagged pattern
 */
function categorizePattern(pattern: string): string {
	if (/nigger|nigga|faggot|retard|cunt/i.test(pattern)) return 'hate_speech';
	if (/fuck|shit|bitch|asshole|cock|dick|pussy/i.test(pattern)) return 'profanity';
	if (/porn|sex|nude|naked|explicit/i.test(pattern)) return 'explicit';
	if (/suicide|kill yourself|kys/i.test(pattern)) return 'self_harm';
	if (/cheat|copy/i.test(pattern)) return 'academic_dishonesty';
	return 'other';
}

// ========================
// UTILITY FUNCTIONS
// ========================

function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
	if (score >= 10) return 'critical';
	if (score >= 5) return 'high';
	if (score >= 2) return 'medium';
	return 'low';
}

function getAction(riskLevel: string): 'allow' | 'sanitize' | 'block' {
	switch (riskLevel) {
		case 'critical':
			return 'block';
		case 'high':
			return 'sanitize';
		case 'medium':
			return 'sanitize';
		default:
			return 'allow';
	}
}

function getOutputAction(riskLevel: string): 'allow' | 'redact' | 'block' {
	switch (riskLevel) {
		case 'critical':
			return 'block';
		case 'high':
			return 'redact';
		case 'medium':
			return 'redact';
		default:
			return 'allow';
	}
}

/**
 * Validate that content is appropriate for Grade 12 students
 */
export function isContentAppropriateForStudents(content: string): boolean {
	const result = filterOutput(content);
	return result.isSafe && result.action !== 'block';
}

/**
 * Get a safe fallback message when content is blocked
 */
export function getSafeFallbackMessage(reason?: string): string {
	if (reason?.includes('self_harm')) {
		return "I care about your wellbeing. If you're struggling, please talk to a trusted adult or call SADAG at 0800 567 567 for free, confidential support.";
	}

	return "I'm here to help with your studies. Could you rephrase your question? Let's focus on your academic topics.";
}

/**
 * Log content filtering event for monitoring
 */
export function logContentFilterEvent(event: {
	userId: string;
	eventType: 'input_blocked' | 'input_sanitized' | 'output_blocked' | 'output_redacted';
	riskLevel: string;
	flaggedItems: string[];
	timestamp?: Date;
}): void {
	const filterEvent = {
		...event,
		timestamp: event.timestamp || new Date(),
		service: 'content-filter',
	};

	// Log locally for debugging
	console.log('[ContentFilter]', filterEvent);

	// Dispatch to analytics endpoint if available
	if (typeof window !== 'undefined') {
		fetch('/api/analytics/filter-event', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(filterEvent),
		}).catch(() => {
			// Silently fail - analytics should not break functionality
		});
	}

	// For critical events, also log to console with more visibility
	if (event.riskLevel === 'critical' || event.riskLevel === 'high') {
		console.warn('[ContentFilter CRITICAL]', filterEvent);
	}
}
