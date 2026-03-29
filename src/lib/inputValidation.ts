const MAX_INPUT_LENGTH = 10000;
const TRUNCATE_WARNING_LENGTH = 9000;

export interface ValidationResult {
	isValid: boolean;
	sanitized: string;
	truncated: boolean;
	warning?: string;
	error?: string;
}

const CONTROL_CHARS = '[\x00-\x1F\x7F-\x9F]';

export function sanitizeInput(input: string): string {
	if (!input || typeof input !== 'string') return '';
	return input
		.replace(new RegExp(CONTROL_CHARS, 'g'), '')
		.replace(/<script[^>]*>.*?<\/script>/gi, '')
		.replace(/<[^>]+>/g, '')
		.trim();
}

export function sanitizeSearchQuery(query: string): string {
	if (!query || typeof query !== 'string') return '';
	return query.replace(/[<>]/g, '').replace(/['";]/g, '').trim();
}

export function truncateInput(
	input: string,
	maxLength: number = MAX_INPUT_LENGTH
): ValidationResult {
	if (!input || typeof input !== 'string') {
		return { isValid: false, sanitized: '', truncated: false, error: 'Input is empty' };
	}

	if (input.length > maxLength) {
		return {
			isValid: true,
			sanitized: input.substring(0, maxLength),
			truncated: true,
			warning: `Input truncated from ${input.length} to ${maxLength} characters`,
		};
	}

	return { isValid: true, sanitized: input, truncated: false };
}

export function validateAndSanitize(
	input: string,
	options?: {
		maxLength?: number;
		allowEmpty?: boolean;
		required?: boolean;
	}
): ValidationResult {
	const { maxLength = MAX_INPUT_LENGTH, allowEmpty = false, required = false } = options || {};

	if (!input || input.trim().length === 0) {
		if (required) {
			return { isValid: false, sanitized: '', truncated: false, error: 'Input is required' };
		}
		if (!allowEmpty) {
			return { isValid: false, sanitized: '', truncated: false, error: 'Input cannot be empty' };
		}
		return { isValid: true, sanitized: '', truncated: false };
	}

	const sanitized = sanitizeInput(input);

	if (sanitized.length === 0) {
		return {
			isValid: false,
			sanitized: '',
			truncated: false,
			error: 'Input contains only invalid characters',
		};
	}

	const truncated = sanitized.length > maxLength;

	return {
		isValid: true,
		sanitized: truncated ? sanitized.substring(0, maxLength) : sanitized,
		truncated,
		warning: truncated ? `Input was truncated to ${maxLength} characters` : undefined,
	};
}

export function validateEmail(email: string): boolean {
	if (!email || typeof email !== 'string') return false;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

export function validateUsername(username: string): ValidationResult {
	if (!username || typeof username !== 'string') {
		return { isValid: false, sanitized: '', truncated: false, error: 'Username is required' };
	}

	const sanitized = username
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9_-]/g, '');

	if (sanitized.length < 3) {
		return {
			isValid: false,
			sanitized: '',
			truncated: false,
			error: 'Username must be at least 3 characters',
		};
	}

	if (sanitized.length > 20) {
		return {
			isValid: false,
			sanitized: '',
			truncated: false,
			error: 'Username must be at most 20 characters',
		};
	}

	return { isValid: true, sanitized, truncated: false };
}

export function prepareForAI(
	input: string,
	options?: {
		maxLength?: number;
		preserveMath?: boolean;
	}
): string {
	const { maxLength = MAX_INPUT_LENGTH, preserveMath = true } = options || {};

	let processed = input;

	if (preserveMath) {
		processed = processed
			.replace(/\$\$([^$]+)\$\$/g, '[$MATH]$1[/MATH]')
			.replace(/\$([^$\n]+)\$/g, '[$MATH]$1[/MATH]');
	}

	processed = sanitizeInput(processed);

	if (processed.length > maxLength) {
		processed = processed.substring(0, TRUNCATE_WARNING_LENGTH);
		processed += `\n\n[Input truncated - showing first ${TRUNCATE_WARNING_LENGTH} characters]`;
	}

	if (preserveMath) {
		processed = processed.replace(/\[MATH\]/g, '$').replace(/\[\/MATH\]/g, '$');
	}

	return processed;
}

export function handleEmptySubmission(): { error: string; suggestion: string } {
	return {
		error: 'No input provided',
		suggestion: 'Please enter something to search or process',
	};
}
