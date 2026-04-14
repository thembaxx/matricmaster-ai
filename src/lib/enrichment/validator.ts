// ============================================================================
// JSON SCHEMA VALIDATOR FOR ENRICHMENT RECORDS
// ============================================================================

import type { EnrichedRecord } from './pipeline';

/**
 * Type specification for a field in a RecordSchema.
 */
export interface FieldSpec {
	type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'any';
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
	pattern?: RegExp;
	enum?: string[];
	customValidator?: (value: unknown) => boolean;
}

/**
 * Schema definition for validating enriched records.
 */
export interface RecordSchema {
	fields: Record<string, FieldSpec>;
	customValidators?: ((record: EnrichedRecord) => string | null)[];
}

/**
 * Result of validating a record against a schema.
 */
export interface ValidationResult {
	valid: boolean;
	errors: string[];
}

/**
 * Check if a value matches a type specification.
 */
function matchesType(value: unknown, type: FieldSpec['type']): boolean {
	if (value === null || value === undefined) return true; // Required check is separate

	switch (type) {
		case 'string':
			return typeof value === 'string';
		case 'number':
			return typeof value === 'number' && Number.isFinite(value);
		case 'boolean':
			return typeof value === 'boolean';
		case 'date':
			return value instanceof Date && !Number.isNaN(value.getTime());
		case 'object':
			return typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
		case 'array':
			return Array.isArray(value);
		case 'any':
			return true;
		default:
			return true;
	}
}

/**
 * Validate a single field against its specification.
 */
function validateField(key: string, value: unknown, spec: FieldSpec): string[] {
	const errors: string[] = [];

	// Required check
	if (spec.required && (value === null || value === undefined || value === '')) {
		errors.push(`Field "${key}" is required but was missing or empty`);
		return errors; // No further validation needed if required and missing
	}

	// Skip further checks if value is null/undefined and not required
	if (value === null || value === undefined) return errors;

	// Type check
	if (!matchesType(value, spec.type)) {
		errors.push(`Field "${key}" expected type "${spec.type}" but got "${typeof value}"`);
		return errors;
	}

	// String-specific checks
	if (spec.type === 'string' && typeof value === 'string') {
		if (spec.minLength !== undefined && value.length < spec.minLength) {
			errors.push(`Field "${key}" length ${value.length} is below minimum ${spec.minLength}`);
		}
		if (spec.maxLength !== undefined && value.length > spec.maxLength) {
			errors.push(`Field "${key}" length ${value.length} exceeds maximum ${spec.maxLength}`);
		}
		if (spec.pattern && !spec.pattern.test(value)) {
			errors.push(`Field "${key}" does not match required pattern`);
		}
		if (spec.enum && !spec.enum.includes(value)) {
			errors.push(
				`Field "${key}" value "${value}" is not in allowed values: ${spec.enum.join(', ')}`
			);
		}
	}

	// Number-specific checks
	if (spec.type === 'number' && typeof value === 'number') {
		if (spec.min !== undefined && value < spec.min) {
			errors.push(`Field "${key}" value ${value} is below minimum ${spec.min}`);
		}
		if (spec.max !== undefined && value > spec.max) {
			errors.push(`Field "${key}" value ${value} exceeds maximum ${spec.max}`);
		}
	}

	// Custom validator
	if (spec.customValidator && !spec.customValidator(value)) {
		errors.push(`Field "${key}" failed custom validation`);
	}

	return errors;
}

/**
 * The default schema for enriched records from web sources.
 */
export const DEFAULT_ENRICHED_SCHEMA: RecordSchema = {
	fields: {
		sourceUrl: { type: 'string', required: true, minLength: 1 },
		contentHash: { type: 'string', required: true, minLength: 1 },
		dataSource: { type: 'string', required: true, enum: ['enriched'] },
		dataQuality: { type: 'string', required: true, enum: ['high', 'medium', 'low'] },
		enrichedAt: { type: 'date', required: true },
		provenance: { type: 'object', required: true },
	},
	customValidators: [
		(record): string | null => {
			// Provenance must have sourceId, fetchedAt, license
			const prov =
				(record.data.provenance as Record<string, unknown> | undefined) ?? record.provenance;
			if (!(prov as Record<string, unknown>)?.sourceId) return 'Provenance missing sourceId';
			if (!(prov as Record<string, unknown>)?.fetchedAt) return 'Provenance missing fetchedAt';
			if (!(prov as Record<string, unknown>)?.license) return 'Provenance missing license';
			return null;
		},
		(record): string | null => {
			// Data object must not be empty
			if (
				!record.data ||
				typeof record.data !== 'object' ||
				Object.keys(record.data).length === 0
			) {
				return 'Data object is empty';
			}
			return null;
		},
	],
};

/**
 * Validate an enriched record against a schema.
 */
export function validateRecord(
	record: EnrichedRecord,
	schema: RecordSchema = DEFAULT_ENRICHED_SCHEMA
): ValidationResult {
	const errors: string[] = [];

	// Validate each field in the schema
	for (const [fieldName, spec] of Object.entries(schema.fields)) {
		// Get value from the record - check both top-level and data fields
		let value: unknown;
		if (fieldName === 'id') value = record.id;
		else if (fieldName === 'sourceUrl') value = record.sourceUrl;
		else if (fieldName === 'contentHash') value = record.contentHash;
		else if (fieldName === 'data') value = record.data;
		else if (fieldName === 'dataSource') value = record.dataSource;
		else if (fieldName === 'dataQuality') value = record.dataQuality;
		else if (fieldName === 'enrichedAt') value = record.enrichedAt;
		else if (fieldName === 'provenance') value = record.provenance;
		else if (fieldName in record.data) value = record.data[fieldName];
		else value = undefined;

		const fieldErrors = validateField(fieldName, value, spec);
		errors.push(...fieldErrors);
	}

	// Run custom validators
	if (schema.customValidators) {
		for (const validator of schema.customValidators) {
			const result = validator(record);
			if (result !== null) {
				errors.push(result);
			}
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * Validate multiple records and return aggregate results.
 */
export function validateRecords(
	records: EnrichedRecord[],
	schema?: RecordSchema
): { valid: EnrichedRecord[]; invalid: { record: EnrichedRecord; errors: string[] }[] } {
	const valid: EnrichedRecord[] = [];
	const invalid: { record: EnrichedRecord; errors: string[] }[] = [];

	for (const record of records) {
		const result = validateRecord(record, schema);
		if (result.valid) {
			valid.push(record);
		} else {
			invalid.push({ record, errors: result.errors });
		}
	}

	return { valid, invalid };
}
