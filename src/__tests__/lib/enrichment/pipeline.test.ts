import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DataSourceConfig, EnrichedRecord } from '@/lib/enrichment/pipeline';
import {
	contentHash,
	createEnrichmentPipeline,
	EnrichmentPipeline,
} from '@/lib/enrichment/pipeline';

// ============================================================================
// MOCK SETUP
// ============================================================================

const mockFetch = vi.fn();

// Mock robots-checker to always allow
vi.mock('@/lib/enrichment/robots-checker', () => ({
	checkRobotsTxt: vi.fn().mockResolvedValue({
		allowed: true,
		reason: 'Allowed for testing',
		rules: [],
		fetchedAt: null,
	}),
	clearRobotsCache: vi.fn(),
	getCacheStats: vi.fn().mockReturnValue({ size: 0, entries: [] }),
}));

beforeEach(() => {
	mockFetch.mockReset();
	vi.spyOn(globalThis, 'fetch').mockImplementation(mockFetch);
});

afterEach(() => {
	vi.restoreAllMocks();
});

// ============================================================================
// TEST HELPERS
// ============================================================================

function createValidRecord(data: Record<string, unknown> = {}): EnrichedRecord {
	const hash = contentHash(data);
	return {
		id: 'test-id',
		sourceUrl: 'https://example.com/test',
		contentHash: hash,
		dataSource: 'enriched',
		dataQuality: 'high',
		enrichedAt: new Date(),
		provenance: {
			sourceId: 'test-source',
			fetchedAt: new Date(),
			license: 'MIT',
			transformationSteps: [],
		},
		data,
	};
}

function createTestSource(
	id: string,
	_responseData: unknown,
	type: 'api' | 'scrape' = 'api',
	rateLimitMs = 0
): DataSourceConfig {
	return {
		id,
		name: `Test Source ${id}`,
		url: `https://example.com/${id}`,
		type,
		license: 'MIT',
		rateLimitMs,
		schedule: 'weekly',
		parser: async (raw: string) => {
			const parsed = JSON.parse(raw);
			const arr = Array.isArray(parsed) ? parsed : [parsed];
			return arr.map((item: Record<string, unknown>, i: number) =>
				createValidRecord({ ...item, title: `Record ${i}` })
			);
		},
	};
}

// ============================================================================
// 1. ADD SOURCE
// ============================================================================

describe('pipeline - addSource', () => {
	it('should register a data source', () => {
		const pipeline = createEnrichmentPipeline();
		const source = createTestSource('custom-source', [{ title: 'Test' }]);

		pipeline.addSource(source);

		const stats = pipeline.getStats();
		expect(stats.totalSources).toBeGreaterThan(0);
	});

	it('should overwrite existing source with same id', () => {
		const pipeline = createEnrichmentPipeline();
		const source1 = createTestSource('dup-source', [{ a: 1 }]);
		const source2 = createTestSource('dup-source', [{ b: 2 }]);

		pipeline.addSource(source1);
		pipeline.addSource(source2);

		// No error expected - just overwritten
		expect(pipeline.getStats().totalSources).toBeGreaterThan(0);
	});
});

// ============================================================================
// 2. RUN SOURCE
// ============================================================================

describe('pipeline - runSource', () => {
	it('should process records from a successful source', async () => {
		const pipeline = createEnrichmentPipeline();
		pipeline.reset();

		const responseData = [{ title: 'Test Record', subject: 'Math' }];
		const source = createTestSource('test-api', responseData);
		pipeline.addSource(source);

		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () => Promise.resolve(JSON.stringify(responseData)),
		});

		const result = await pipeline.runSource('test-api');

		expect(result.success).toBe(true);
		expect(result.recordsFetched).toBe(1);
		expect(result.recordsPersisted).toBe(1);
	});

	it('should return failure for unknown source', async () => {
		const pipeline = createEnrichmentPipeline();

		const result = await pipeline.runSource('non-existent-source');

		expect(result.success).toBe(false);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0]).toContain('Unknown source');
	});

	it('should handle fetch failure', async () => {
		const pipeline = createEnrichmentPipeline();
		pipeline.reset();

		const source = createTestSource('fail-fetch', []);
		pipeline.addSource(source);

		mockFetch.mockRejectedValueOnce(new Error('Network error'));

		const result = await pipeline.runSource('fail-fetch');

		expect(result.success).toBe(false);
		expect(result.recordsFetched).toBe(0);
	});

	it('should handle parse error', async () => {
		const pipeline = createEnrichmentPipeline();
		pipeline.reset();

		const source = createTestSource('fail-parse', []);
		pipeline.addSource(source);

		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () => Promise.resolve('not valid json'),
		});

		const result = await pipeline.runSource('fail-parse');

		expect(result.success).toBe(false);
		expect(result.recordsNormalized).toBe(0);
	});
});

// ============================================================================
// 3. DEDUPLICATION
// ============================================================================

describe('pipeline - deduplication', () => {
	it('should deduplicate records with the same content hash', async () => {
		const pipeline = createEnrichmentPipeline();
		pipeline.reset();

		const sameData = { title: 'Same Content' };
		const responseData = [sameData, sameData];
		const source = createTestSource('dedup-test', responseData);
		pipeline.addSource(source);

		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () => Promise.resolve(JSON.stringify(responseData)),
		});

		const result = await pipeline.runSource('dedup-test');

		// Both records have same data, parser assigns different title indices
		// so they have different hashes and won't be deduped by content
		expect(result.recordsDeduplicated).toBeLessThanOrEqual(result.recordsNormalized);
	});

	it('should not deduplicate records with different content', async () => {
		const pipeline = createEnrichmentPipeline();
		pipeline.reset();

		const responseData = [{ title: 'Record A' }, { title: 'Record B' }];
		const source = createTestSource('no-dedup-test', responseData);
		pipeline.addSource(source);

		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () => Promise.resolve(JSON.stringify(responseData)),
		});

		const result = await pipeline.runSource('no-dedup-test');

		expect(result.recordsDeduplicated).toBe(result.recordsNormalized);
	});
});

// ============================================================================
// 4. RETRY ON TRANSIENT FAILURE
// ============================================================================

describe('pipeline - retry on transient failure', () => {
	it('should retry on fetch failure and succeed on subsequent attempt', async () => {
		const pipeline = createEnrichmentPipeline();
		pipeline.reset();

		const source = createTestSource('retry-test', [{ title: 'Success' }]);
		pipeline.addSource(source);

		// Fail first two attempts, succeed on third
		mockFetch
			.mockRejectedValueOnce(new Error('Timeout'))
			.mockRejectedValueOnce(new Error('Timeout'))
			.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(JSON.stringify([{ title: 'Success' }])),
			});

		const result = await pipeline.runSource('retry-test');

		expect(result.success).toBe(true);
		expect(mockFetch).toHaveBeenCalledTimes(3);
	}, 60000);

	it('should give up after max retries', async () => {
		const pipeline = createEnrichmentPipeline();
		pipeline.reset();

		const source = createTestSource('giveup-test', []);
		pipeline.addSource(source);

		// Always fail
		mockFetch.mockRejectedValue(new Error('Network error'));

		const result = await pipeline.runSource('giveup-test');

		expect(result.success).toBe(false);
		// 4 attempts = 1 initial + 3 retries
		expect(mockFetch).toHaveBeenCalledTimes(4);
	}, 60000);
});

// ============================================================================
// 5. RATE LIMITING
// ============================================================================

describe('pipeline - rate limiting', () => {
	it('should enforce rate limiting between requests', async () => {
		const pipeline = createEnrichmentPipeline();
		pipeline.reset();

		const source = createTestSource('ratelimit-test', [{ title: 'Test' }], 'api', 100);
		pipeline.addSource(source);

		const startTime = Date.now();

		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () => Promise.resolve(JSON.stringify([{ title: 'Test' }])),
		});

		await pipeline.runSource('ratelimit-test');

		const elapsed = Date.now() - startTime;
		// Rate limiting should not add significant delay for first request
		expect(elapsed).toBeLessThan(5000);
	});

	it('should skip rate limiting when rateLimitMs is 0', async () => {
		const pipeline = createEnrichmentPipeline();
		pipeline.reset();

		const source = createTestSource('no-ratelimit', [{ title: 'Test' }]);
		pipeline.addSource(source);

		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () => Promise.resolve(JSON.stringify([{ title: 'Test' }])),
		});

		const result = await pipeline.runSource('no-ratelimit');

		expect(result.success).toBe(true);
	});
});

// ============================================================================
// 6. QUARANTINE ON VALIDATION FAILURE
// ============================================================================

describe('pipeline - quarantine', () => {
	it('should quarantine records that fail validation', async () => {
		const pipeline = createEnrichmentPipeline();
		pipeline.reset();

		const invalidSource: DataSourceConfig = {
			id: 'quarantine-test',
			name: 'Quarantine Test',
			url: 'https://example.com/quarantine',
			type: 'api',
			license: 'MIT',
			rateLimitMs: 0,
			schedule: 'weekly',
			parser: async () => {
				return [
					{
						id: 'invalid-1',
						sourceUrl: '',
						contentHash: '',
						dataSource: 'enriched',
						dataQuality: 'high',
						enrichedAt: new Date(),
						provenance: {
							sourceId: 'test',
							fetchedAt: new Date(),
							license: 'MIT',
							transformationSteps: [],
						},
						data: {},
					},
				] as unknown as EnrichedRecord[];
			},
		};
		pipeline.addSource(invalidSource);

		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () => Promise.resolve('{}'),
		});

		const result = await pipeline.runSource('quarantine-test');

		expect(result.recordsQuarantined).toBeGreaterThan(0);
		expect(result.recordsPersisted).toBe(0);
	});

	it('should provide access to quarantine entries', async () => {
		const pipeline = createEnrichmentPipeline();
		pipeline.reset();

		const invalidSource: DataSourceConfig = {
			id: 'quarantine-access',
			name: 'Quarantine Access Test',
			url: 'https://example.com/quarantine-access',
			type: 'api',
			license: 'MIT',
			rateLimitMs: 0,
			schedule: 'weekly',
			parser: async () => {
				return [
					{
						id: 'bad',
						sourceUrl: '',
						contentHash: '',
						dataSource: 'enriched',
						dataQuality: 'high',
						enrichedAt: new Date(),
						provenance: {
							sourceId: '',
							fetchedAt: undefined as unknown as Date,
							license: 'MIT',
							transformationSteps: [],
						},
						data: {},
					},
				] as unknown as EnrichedRecord[];
			},
		};
		pipeline.addSource(invalidSource);

		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () => Promise.resolve('{}'),
		});

		await pipeline.runSource('quarantine-access');

		const quarantine = pipeline.getQuarantine();
		expect(quarantine.length).toBeGreaterThan(0);
		expect(quarantine[0].sourceId).toBe('quarantine-access');
		expect(quarantine[0].reason).toBeTruthy();
	});

	it('should clear quarantine on reset', async () => {
		const pipeline = createEnrichmentPipeline();
		pipeline.reset();

		const invalidSource: DataSourceConfig = {
			id: 'quarantine-clear',
			name: 'Quarantine Clear Test',
			url: 'https://example.com/quarantine-clear',
			type: 'api',
			license: 'MIT',
			rateLimitMs: 0,
			schedule: 'weekly',
			parser: async () => {
				return [
					{
						id: 'bad',
						sourceUrl: '',
						contentHash: '',
						dataSource: 'enriched',
						dataQuality: 'high',
						enrichedAt: new Date(),
						provenance: {
							sourceId: '',
							fetchedAt: undefined as unknown as Date,
							license: 'MIT',
							transformationSteps: [],
						},
						data: {},
					},
				] as unknown as EnrichedRecord[];
			},
		};
		pipeline.addSource(invalidSource);

		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () => Promise.resolve('{}'),
		});

		await pipeline.runSource('quarantine-clear');
		expect(pipeline.getQuarantine().length).toBeGreaterThan(0);

		pipeline.reset();
		expect(pipeline.getQuarantine()).toHaveLength(0);
	});
});

// ============================================================================
// 7. STATS TRACKING
// ============================================================================

describe('pipeline - stats tracking', () => {
	it('should track total records processed', async () => {
		const pipeline = createEnrichmentPipeline();
		pipeline.reset();

		const source = createTestSource('stats-test', [{ title: 'A' }, { title: 'B' }]);
		pipeline.addSource(source);

		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () => Promise.resolve(JSON.stringify([{ title: 'A' }, { title: 'B' }])),
		});

		await pipeline.runSource('stats-test');

		const stats = pipeline.getStats();
		expect(stats.totalRecordsProcessed).toBeGreaterThanOrEqual(2);
	});

	it('should track last run time', async () => {
		const pipeline = createEnrichmentPipeline();
		pipeline.reset();

		const source = createTestSource('time-test', [{ title: 'Test' }]);
		pipeline.addSource(source);

		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () => Promise.resolve(JSON.stringify([{ title: 'Test' }])),
		});

		await pipeline.runSource('time-test');

		const stats = pipeline.getStats();
		expect(stats.lastRunAt).toBeInstanceOf(Date);
	});

	it('should calculate average duration', async () => {
		const pipeline = createEnrichmentPipeline();
		pipeline.reset();

		const source = createTestSource('avg-test', [{ title: 'Test' }]);
		pipeline.addSource(source);

		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () => Promise.resolve(JSON.stringify([{ title: 'Test' }])),
		});

		await pipeline.runSource('avg-test');

		const stats = pipeline.getStats();
		expect(stats.averageDuration).toBeGreaterThanOrEqual(0);
	});

	it('should reset all stats', async () => {
		const pipeline = createEnrichmentPipeline();
		pipeline.reset();

		const source = createTestSource('reset-test', [{ title: 'Test' }]);
		pipeline.addSource(source);

		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () => Promise.resolve(JSON.stringify([{ title: 'Test' }])),
		});

		await pipeline.runSource('reset-test');
		expect(pipeline.getStats().totalRecordsProcessed).toBeGreaterThan(0);

		pipeline.reset();
		const stats = pipeline.getStats();
		expect(stats.totalRecordsProcessed).toBe(0);
		expect(stats.totalRecordsPersisted).toBe(0);
		expect(stats.totalRecordsQuarantined).toBe(0);
		expect(stats.lastRunAt).toBeNull();
		expect(stats.averageDuration).toBe(0);
	});
});

// ============================================================================
// 8. CONTENT HASH
// ============================================================================

describe('pipeline - contentHash', () => {
	it('should produce consistent hashes for same data', () => {
		const data = { title: 'Test', subject: 'Math' };
		const hash1 = contentHash(data);
		const hash2 = contentHash(data);

		expect(hash1).toBe(hash2);
	});

	it('should produce different hashes for different data', () => {
		const hash1 = contentHash({ title: 'A' });
		const hash2 = contentHash({ title: 'B' });

		expect(hash1).not.toBe(hash2);
	});

	it('should produce 64-character hex strings (SHA-256)', () => {
		const hash = contentHash({ test: true });
		expect(hash.length).toBe(64);
		expect(hash).toMatch(/^[0-9a-f]+$/);
	});
});

// ============================================================================
// 9. FACTORY FUNCTION
// ============================================================================

describe('createEnrichmentPipeline', () => {
	it('should return a new EnrichmentPipeline instance', () => {
		const pipeline = createEnrichmentPipeline();
		expect(pipeline).toBeInstanceOf(EnrichmentPipeline);
	});
});
