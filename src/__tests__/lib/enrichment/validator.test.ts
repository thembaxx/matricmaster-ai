import { describe, expect, it } from 'vitest';
import type { EnrichedRecord } from '@/lib/enrichment/pipeline';
import { validateRecord, validateRecords } from '@/lib/enrichment/validator';

// ============================================================================
// TEST HELPERS
// ============================================================================

function createValidRecord(overrides: Partial<EnrichedRecord> = {}): EnrichedRecord {
	return {
		id: 'test-id-123',
		sourceUrl: 'https://example.com/test',
		contentHash: 'abc123hash',
		dataSource: 'enriched',
		dataQuality: 'high',
		enrichedAt: new Date(),
		provenance: {
			sourceId: 'test-source',
			fetchedAt: new Date(),
			license: 'MIT',
			transformationSteps: ['normalize'],
		},
		data: { title: 'Test Record', subject: 'Mathematics' },
		...overrides,
	};
}

// ============================================================================
// 1. VALID RECORDS
// ============================================================================

describe('validator - validateRecord (valid records)', () => {
	it('should pass a fully valid record', () => {
		const record = createValidRecord();
		const result = validateRecord(record);

		expect(result.valid).toBe(true);
		expect(result.errors).toEqual([]);
	});

	it('should pass a record with medium quality', () => {
		const record = createValidRecord({ dataQuality: 'medium' });
		const result = validateRecord(record);

		expect(result.valid).toBe(true);
	});

	it('should pass a record with low quality', () => {
		const record = createValidRecord({ dataQuality: 'low' });
		const result = validateRecord(record);

		expect(result.valid).toBe(true);
	});
});

// ============================================================================
// 2. MISSING REQUIRED FIELDS
// ============================================================================

describe('validator - validateRecord (missing required fields)', () => {
	it('should reject records missing sourceUrl', () => {
		const record = createValidRecord();
		delete (record as Partial<EnrichedRecord>).sourceUrl;
		const result = validateRecord(record);

		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('sourceUrl'))).toBe(true);
	});

	it('should reject records missing contentHash', () => {
		const record = createValidRecord();
		delete (record as Partial<EnrichedRecord>).contentHash;
		const result = validateRecord(record);

		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('contentHash'))).toBe(true);
	});

	it('should reject records missing dataSource', () => {
		const record = createValidRecord();
		delete (record as Partial<EnrichedRecord>).dataSource;
		const result = validateRecord(record);

		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('dataSource'))).toBe(true);
	});

	it('should reject records missing dataQuality', () => {
		const record = createValidRecord();
		delete (record as Partial<EnrichedRecord>).dataQuality;
		const result = validateRecord(record);

		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('dataQuality'))).toBe(true);
	});

	it('should reject records missing enrichedAt', () => {
		const record = createValidRecord();
		delete (record as Partial<EnrichedRecord>).enrichedAt;
		const result = validateRecord(record);

		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('enrichedAt'))).toBe(true);
	});

	it('should reject records missing provenance', () => {
		const record = createValidRecord();
		delete (record as Partial<EnrichedRecord>).provenance;
		const result = validateRecord(record);

		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('provenance'))).toBe(true);
	});
});

// ============================================================================
// 3. WRONG TYPES
// ============================================================================

describe('validator - validateRecord (wrong types)', () => {
	it('should reject records with wrong type for sourceUrl', () => {
		const record = createValidRecord({ sourceUrl: 123 as unknown as string });
		const result = validateRecord(record);

		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('sourceUrl'))).toBe(true);
	});

	it('should reject records with wrong type for contentHash', () => {
		const record = createValidRecord({ contentHash: 456 as unknown as string });
		const result = validateRecord(record);

		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('contentHash'))).toBe(true);
	});

	it('should reject records with wrong type for dataQuality', () => {
		const record = createValidRecord({ dataQuality: 99 as unknown as 'high' });
		const result = validateRecord(record);

		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('dataQuality'))).toBe(true);
	});

	it('should reject records with wrong type for enrichedAt', () => {
		const record = createValidRecord({ enrichedAt: '2024-01-01' as unknown as Date });
		const result = validateRecord(record);

		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('enrichedAt'))).toBe(true);
	});

	it('should reject records with wrong type for provenance', () => {
		const record = createValidRecord({
			provenance: 'not-an-object' as unknown as EnrichedRecord['provenance'],
		});
		const result = validateRecord(record);

		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('provenance'))).toBe(true);
	});
});

// ============================================================================
// 4. CONSTRAINT FAILURES
// ============================================================================

describe('validator - validateRecord (constraint failures)', () => {
	it('should reject records with invalid dataSource value', () => {
		const record = createValidRecord({ dataSource: 'invalid' as 'enriched' });
		const result = validateRecord(record);

		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('dataSource'))).toBe(true);
	});

	it('should reject records with invalid dataQuality value', () => {
		const record = createValidRecord({ dataQuality: 'ultra' as 'high' });
		const result = validateRecord(record);

		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('dataQuality'))).toBe(true);
	});

	it('should reject records with empty data object', () => {
		const record = createValidRecord({ data: {} });
		const result = validateRecord(record);

		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('Data object is empty'))).toBe(true);
	});

	it('should reject records with missing provenance sourceId', () => {
		const record = createValidRecord({
			provenance: {
				sourceId: '',
				fetchedAt: new Date(),
				license: 'MIT',
				transformationSteps: [],
			},
		});
		const result = validateRecord(record);

		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('sourceId'))).toBe(true);
	});

	it('should reject records with missing provenance fetchedAt', () => {
		const record = createValidRecord({
			provenance: {
				sourceId: 'test-source',
				fetchedAt: undefined as unknown as Date,
				license: 'MIT',
				transformationSteps: [],
			},
		});
		const result = validateRecord(record);

		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('fetchedAt'))).toBe(true);
	});

	it('should reject records with missing provenance license', () => {
		const record = createValidRecord({
			provenance: {
				sourceId: 'test-source',
				fetchedAt: new Date(),
				license: undefined as unknown as string,
				transformationSteps: [],
			},
		});
		const result = validateRecord(record);

		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('license'))).toBe(true);
	});

	it('should reject records with empty sourceUrl', () => {
		const record = createValidRecord({ sourceUrl: '' });
		const result = validateRecord(record);

		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('sourceUrl'))).toBe(true);
	});

	it('should reject records with empty contentHash', () => {
		const record = createValidRecord({ contentHash: '' });
		const result = validateRecord(record);

		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes('contentHash'))).toBe(true);
	});
});

// ============================================================================
// 5. VALIDATE RECORDS (BATCH)
// ============================================================================

describe('validator - validateRecords (batch validation)', () => {
	it('should separate valid and invalid records', () => {
		const records: EnrichedRecord[] = [
			createValidRecord({ id: 'valid-1' }),
			createValidRecord({ id: 'valid-2' }),
			createValidRecord({ sourceUrl: '' } as Partial<EnrichedRecord>) as EnrichedRecord,
		];

		const { valid, invalid } = validateRecords(records);

		expect(valid).toHaveLength(2);
		expect(invalid).toHaveLength(1);
		expect(valid[0].id).toBe('valid-1');
		expect(valid[1].id).toBe('valid-2');
	});

	it('should return all valid when all records are valid', () => {
		const records: EnrichedRecord[] = [
			createValidRecord({ id: 'r1' }),
			createValidRecord({ id: 'r2' }),
			createValidRecord({ id: 'r3' }),
		];

		const { valid, invalid } = validateRecords(records);

		expect(valid).toHaveLength(3);
		expect(invalid).toHaveLength(0);
	});

	it('should return all invalid when all records are invalid', () => {
		const records: EnrichedRecord[] = [
			createValidRecord({ sourceUrl: '' } as Partial<EnrichedRecord>) as EnrichedRecord,
			createValidRecord({ contentHash: '' } as Partial<EnrichedRecord>) as EnrichedRecord,
		];

		const { valid, invalid } = validateRecords(records);

		expect(valid).toHaveLength(0);
		expect(invalid).toHaveLength(2);
	});

	it('should include error messages for invalid records', () => {
		const record = createValidRecord({ dataSource: 'wrong' as 'enriched' });
		const { invalid } = validateRecords([record]);

		expect(invalid).toHaveLength(1);
		expect(invalid[0].errors.length).toBeGreaterThan(0);
		expect(invalid[0].errors.some((e) => e.includes('dataSource'))).toBe(true);
	});

	it('should handle empty input array', () => {
		const { valid, invalid } = validateRecords([]);

		expect(valid).toHaveLength(0);
		expect(invalid).toHaveLength(0);
	});
});

// ============================================================================
// 6. CUSTOM SCHEMA VALIDATION
// ============================================================================

describe('validator - custom schema', () => {
	it('should validate against a custom schema', () => {
		const customSchema = {
			fields: {
				name: { type: 'string', required: true, minLength: 2 },
				age: { type: 'number', min: 0, max: 150 },
			},
		};

		const record = {
			id: 'test',
			sourceUrl: 'https://example.com',
			contentHash: 'hash',
			dataSource: 'enriched',
			dataQuality: 'high',
			enrichedAt: new Date(),
			provenance: {
				sourceId: 'src',
				fetchedAt: new Date(),
				license: 'MIT',
				transformationSteps: [],
			},
			data: { name: 'John', age: 30 },
		};

		const result = validateRecord(record as unknown as EnrichedRecord, customSchema);
		expect(result.valid).toBe(true);
	});

	it('should fail custom schema validation for missing required field', () => {
		const customSchema = {
			fields: {
				name: { type: 'string', required: true },
			},
		};

		const record = {
			id: 'test',
			sourceUrl: 'https://example.com',
			contentHash: 'hash',
			dataSource: 'enriched',
			dataQuality: 'high',
			enrichedAt: new Date(),
			provenance: {
				sourceId: 'src',
				fetchedAt: new Date(),
				license: 'MIT',
				transformationSteps: [],
			},
			data: {},
		};

		const result = validateRecord(record as unknown as EnrichedRecord, customSchema);
		expect(result.valid).toBe(false);
	});

	it('should use DEFAULT_ENRICHED_SCHEMA when no schema provided', () => {
		const record = createValidRecord();
		const result = validateRecord(record);

		expect(result.valid).toBe(true);
	});
});
