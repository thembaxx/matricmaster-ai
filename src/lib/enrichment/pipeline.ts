// ============================================================================
// ENRICHMENT PIPELINE - Phase 3: Web Data Enrichment
// ============================================================================
// Fetches data from web sources, checks robots.txt, parses, normalizes,
// deduplicates, validates, and persists enriched records.
// ============================================================================

import { createHash } from 'node:crypto';
import { checkRobotsTxt } from './robots-checker';
import { DATA_SOURCES } from './sources';
import { type ValidationResult, validateRecord } from './validator';

// ============================================================================
// TYPES
// ============================================================================

export interface DataSourceConfig {
	id: string;
	name: string;
	url: string;
	type: 'api' | 'scrape' | 'manual';
	license: string;
	rateLimitMs: number;
	parser: (raw: string) => Promise<EnrichedRecord[]>;
	schedule: 'weekly' | 'monthly' | 'quarterly';
}

export interface EnrichedRecord {
	id: string;
	sourceUrl: string;
	contentHash: string;
	data: Record<string, unknown>;
	dataSource: 'enriched';
	dataQuality: 'high' | 'medium' | 'low';
	enrichedAt: Date;
	provenance: {
		sourceId: string;
		fetchedAt: Date;
		license: string;
		transformationSteps: string[];
	};
}

export interface PipelineResult {
	success: boolean;
	sourceId: string;
	recordsFetched: number;
	recordsNormalized: number;
	recordsDeduplicated: number;
	recordsValidated: number;
	recordsPersisted: number;
	recordsQuarantined: number;
	errors: string[];
	duration: number;
}

export interface PipelineStats {
	totalSources: number;
	totalRecordsProcessed: number;
	totalRecordsPersisted: number;
	totalRecordsQuarantined: number;
	lastRunAt: Date | null;
	averageDuration: number;
}

interface QuarantineEntry {
	record: EnrichedRecord | unknown;
	sourceId: string;
	reason: string;
	timestamp: Date;
}

// ============================================================================
// RATE LIMITER
// ============================================================================

class RateLimiter {
	private lastRequestTime: Map<string, number> = new Map();

	async waitForDomain(domain: string, minIntervalMs: number): Promise<void> {
		const lastTime = this.lastRequestTime.get(domain) ?? 0;
		const now = Date.now();
		const elapsed = now - lastTime;

		if (elapsed < minIntervalMs) {
			const waitTime = minIntervalMs - elapsed;
			await new Promise((resolve) => setTimeout(resolve, waitTime));
		}

		this.lastRequestTime.set(domain, Date.now());
	}
}

// ============================================================================
// CONTENT HASHING
// ============================================================================

/**
 * Generate SHA-256 hash of normalized JSON for dedup keys.
 */
export function contentHash(data: Record<string, unknown>): string {
	const normalized = JSON.stringify(data, Object.keys(data).sort());
	return createHash('sha256').update(normalized).digest('hex');
}

// ============================================================================
// QUALITY SCORING
// ============================================================================

function calculateQuality(record: EnrichedRecord): 'high' | 'medium' | 'low' {
	const data = record.data;
	const keys = Object.keys(data);

	if (keys.length === 0) return 'low';

	// Check for required fields
	const hasRequiredFields =
		'title' in data || 'subject' in data || 'content' in data || 'summary' in data;

	if (!hasRequiredFields) return 'low';

	// Count non-empty values
	const nonEmptyCount = keys.filter((k) => {
		const v = data[k];
		return v !== null && v !== undefined && v !== '';
	}).length;

	const ratio = nonEmptyCount / keys.length;

	if (ratio >= 0.9) return 'high';
	if (ratio >= 0.5) return 'medium';
	return 'low';
}

// ============================================================================
// PIPELINE CLASS
// ============================================================================

export class EnrichmentPipeline {
	private sources: Map<string, DataSourceConfig> = new Map();
	private rateLimiter: RateLimiter = new RateLimiter();
	private quarantine: QuarantineEntry[] = [];
	private seenHashes: Set<string> = new Set();
	private stats: {
		totalRecordsProcessed: number;
		totalRecordsPersisted: number;
		totalRecordsQuarantined: number;
		lastRunAt: Date | null;
		durations: number[];
	} = {
		totalRecordsProcessed: 0,
		totalRecordsPersisted: 0,
		totalRecordsQuarantined: 0,
		lastRunAt: null,
		durations: [],
	};

	constructor() {
		// Register default sources
		for (const source of DATA_SOURCES) {
			this.sources.set(source.id, source);
		}
	}

	/**
	 * Add a data source to the pipeline.
	 */
	addSource(config: DataSourceConfig): void {
		this.sources.set(config.id, config);
	}

	/**
	 * Run the full pipeline for all sources.
	 */
	async runAll(): Promise<PipelineResult[]> {
		const results: PipelineResult[] = [];
		for (const [, source] of this.sources) {
			if (source.type === 'manual') continue; // Skip manual sources
			const result = await this.runSource(source.id);
			results.push(result);
		}
		return results;
	}

	/**
	 * Run the pipeline for a specific source.
	 */
	async runSource(sourceId: string): Promise<PipelineResult> {
		const startTime = Date.now();
		const errors: string[] = [];
		const source = this.sources.get(sourceId);

		if (!source) {
			return {
				success: false,
				sourceId,
				recordsFetched: 0,
				recordsNormalized: 0,
				recordsDeduplicated: 0,
				recordsValidated: 0,
				recordsPersisted: 0,
				recordsQuarantined: 0,
				errors: [`Unknown source: ${sourceId}`],
				duration: 0,
			};
		}

		try {
			// Step 1: Fetch data (with robots.txt check and rate limiting)
			const raw = await this.fetchWithRetry(source);
			const recordsFetched = raw ? 1 : 0;

			if (!raw) {
				const result: PipelineResult = {
					success: false,
					sourceId,
					recordsFetched: 0,
					recordsNormalized: 0,
					recordsDeduplicated: 0,
					recordsValidated: 0,
					recordsPersisted: 0,
					recordsQuarantined: 0,
					errors: [`Failed to fetch data from ${source.url}`],
					duration: Date.now() - startTime,
				};
				this.stats.lastRunAt = new Date();
				this.stats.durations.push(result.duration);
				return result;
			}

			// Step 2: Parse records
			let parsed: EnrichedRecord[];
			try {
				parsed = await source.parser(raw);
			} catch (parseError) {
				errors.push(
					`Parse error: ${parseError instanceof Error ? parseError.message : String(parseError)}`
				);
				const result: PipelineResult = {
					success: false,
					sourceId,
					recordsFetched: 1,
					recordsNormalized: 0,
					recordsDeduplicated: 0,
					recordsValidated: 0,
					recordsPersisted: 0,
					recordsQuarantined: 0,
					errors,
					duration: Date.now() - startTime,
				};
				this.stats.lastRunAt = new Date();
				this.stats.durations.push(result.duration);
				return result;
			}

			// Step 3: Normalize (add metadata)
			const normalized = parsed.map((r) => this.normalizeRecord(r, source));
			const recordsNormalized = normalized.length;

			// Step 4: Deduplicate
			const deduplicated = this.deduplicate(normalized);
			const recordsDeduplicated = deduplicated.length;

			// Step 5: Validate
			const { valid, invalid } = this.validate(deduplicated);
			const recordsValidated = valid.length;

			// Quarantine invalid records
			for (const { record, errs } of invalid) {
				this.quarantine.push({
					record,
					sourceId,
					reason: errs.join('; '),
					timestamp: new Date(),
				});
			}

			// Step 6: Persist (store in-memory for now)
			const persisted = await this.persist(valid);
			const recordsPersisted = persisted.length;

			// Update stats
			this.stats.totalRecordsProcessed += parsed.length;
			this.stats.totalRecordsPersisted += recordsPersisted;
			this.stats.totalRecordsQuarantined += invalid.length;
			this.stats.lastRunAt = new Date();

			const duration = Date.now() - startTime;
			this.stats.durations.push(duration);

			return {
				success: true,
				sourceId,
				recordsFetched,
				recordsNormalized,
				recordsDeduplicated,
				recordsValidated,
				recordsPersisted,
				recordsQuarantined: invalid.length,
				errors,
				duration,
			};
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : String(err);
			errors.push(`Pipeline error: ${errorMessage}`);

			const duration = Date.now() - startTime;
			this.stats.lastRunAt = new Date();
			this.stats.durations.push(duration);

			return {
				success: false,
				sourceId,
				recordsFetched: 0,
				recordsNormalized: 0,
				recordsDeduplicated: 0,
				recordsValidated: 0,
				recordsPersisted: 0,
				recordsQuarantined: 0,
				errors,
				duration,
			};
		}
	}

	/**
	 * Get pipeline statistics.
	 */
	getStats(): PipelineStats {
		const avgDuration =
			this.stats.durations.length > 0
				? this.stats.durations.reduce((a, b) => a + b, 0) / this.stats.durations.length
				: 0;

		return {
			totalSources: this.sources.size,
			totalRecordsProcessed: this.stats.totalRecordsProcessed,
			totalRecordsPersisted: this.stats.totalRecordsPersisted,
			totalRecordsQuarantined: this.stats.totalRecordsQuarantined,
			lastRunAt: this.stats.lastRunAt,
			averageDuration: Math.round(avgDuration),
		};
	}

	/**
	 * Reset pipeline state (clears hashes, quarantine, stats).
	 */
	reset(): void {
		this.seenHashes.clear();
		this.quarantine = [];
		this.stats = {
			totalRecordsProcessed: 0,
			totalRecordsPersisted: 0,
			totalRecordsQuarantined: 0,
			lastRunAt: null,
			durations: [],
		};
	}

	/**
	 * Get quarantine entries.
	 */
	getQuarantine(): QuarantineEntry[] {
		return [...this.quarantine];
	}

	// ============================================================================
	// INTERNAL METHODS
	// ============================================================================

	/**
	 * Fetch data from a source with robots.txt check, rate limiting, and retry.
	 */
	private async fetchWithRetry(source: DataSourceConfig, maxRetries = 3): Promise<string | null> {
		// Skip robots.txt check for API sources with known endpoints
		if (source.type === 'scrape' && source.url) {
			const robotsCheck = await checkRobotsTxt(source.url);
			if (!robotsCheck.allowed) {
				console.warn(`[Enrichment] Blocked by robots.txt for ${source.url}: ${robotsCheck.reason}`);
				return null;
			}
		}

		let lastError: Error | null = null;
		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			try {
				// Rate limiting
				if (source.rateLimitMs > 0) {
					const domain = this.extractDomain(source.url);
					await this.rateLimiter.waitForDomain(domain, source.rateLimitMs);
				}

				const response = await this.fetchWithTimeout(source.url, 30000);

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}

				return await response.text();
			} catch (err) {
				lastError = err instanceof Error ? err : new Error(String(err));
				if (attempt < maxRetries) {
					// Exponential backoff: 1s, 2s, 4s
					const backoffMs = 1000 * 2 ** attempt;
					await new Promise((resolve) => setTimeout(resolve, backoffMs));
				}
			}
		}

		console.error(
			`[Enrichment] Failed to fetch ${source.url} after ${maxRetries} retries: ${lastError?.message}`
		);
		return null;
	}

	/**
	 * Fetch with AbortController timeout.
	 */
	private async fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

		try {
			return await fetch(url, {
				signal: controller.signal,
				headers: {
					'User-Agent': 'MatricMasterAI-Enrichment/1.0',
					Accept: 'application/json, text/html, */*',
				},
			});
		} finally {
			clearTimeout(timeoutId);
		}
	}

	/**
	 * Extract domain from URL for rate limiting.
	 */
	private extractDomain(url: string): string {
		try {
			return new URL(url).origin;
		} catch {
			return url;
		}
	}

	/**
	 * Normalize a record with metadata.
	 */
	private normalizeRecord(record: EnrichedRecord, source: DataSourceConfig): EnrichedRecord {
		const hash = contentHash(record.data);
		return {
			...record,
			contentHash: hash,
			dataSource: 'enriched',
			dataQuality: calculateQuality(record),
			enrichedAt: record.enrichedAt ?? new Date(),
			provenance: {
				...record.provenance,
				sourceId: source.id,
				license: source.license,
				fetchedAt: record.provenance?.fetchedAt ?? new Date(),
				transformationSteps: [...(record.provenance?.transformationSteps ?? []), 'normalization'],
			},
		};
	}

	/**
	 * Deduplicate records using content hash.
	 */
	private deduplicate(records: EnrichedRecord[]): EnrichedRecord[] {
		return records.filter((record) => {
			const key = `${record.sourceUrl}:${record.contentHash}`;
			if (this.seenHashes.has(key)) return false;
			this.seenHashes.add(key);
			return true;
		});
	}

	/**
	 * Validate records against schema.
	 */
	private validate(records: EnrichedRecord[]): {
		valid: EnrichedRecord[];
		invalid: { record: EnrichedRecord; errs: string[] }[];
	} {
		const valid: EnrichedRecord[] = [];
		const invalid: { record: EnrichedRecord; errs: string[] }[] = [];

		for (const record of records) {
			const result: ValidationResult = validateRecord(record);
			if (result.valid) {
				valid.push(record);
			} else {
				invalid.push({ record, errs: result.errors });
			}
		}

		return { valid, invalid };
	}

	/**
	 * Persist records (in-memory for now, can be extended to DB).
	 */
	private async persist(records: EnrichedRecord[]): Promise<EnrichedRecord[]> {
		// In production, this would insert into the database
		// For now, just return the records as "persisted"
		// Could integrate with db from '@/lib/db' here
		return [...records];
	}
}

// ============================================================================
// FACTORY
// ============================================================================

/**
 * Create a new enrichment pipeline instance.
 */
export const createEnrichmentPipeline = (): EnrichmentPipeline => {
	return new EnrichmentPipeline();
};

// ============================================================================
// SINGLETON
// ============================================================================

let pipelineInstance: EnrichmentPipeline | null = null;

/**
 * Get the singleton pipeline instance.
 */
export function getEnrichmentPipeline(): EnrichmentPipeline {
	if (!pipelineInstance) {
		pipelineInstance = new EnrichmentPipeline();
	}
	return pipelineInstance;
}
