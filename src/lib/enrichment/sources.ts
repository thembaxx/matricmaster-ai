// ============================================================================
// REGISTRY OF KNOWN GOOD DATA SOURCES FOR ENRICHMENT PIPELINE
// ============================================================================

import {
	normalizeAnswerFormat,
	normalizeDate,
	normalizeGradeLevel,
	normalizeSubjectName,
} from './normalizer';
import type { DataSourceConfig, EnrichedRecord } from './pipeline';

/**
 * South African Department of Basic Education (DBE) Past Papers.
 * Public domain - South African government works are not copyrighted.
 */
export const dbePastPapersSource: DataSourceConfig = {
	id: 'dbe-past-papers',
	name: 'DBE Past Examination Papers',
	url: 'https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx',
	type: 'scrape',
	license: 'Public Domain (South African Government)',
	rateLimitMs: 5000,
	schedule: 'quarterly',
	parser: async (raw: string): Promise<EnrichedRecord[]> => {
		// Parser extracts paper references from DBE page
		// In production, this would use a proper HTML parser or API
		const records: EnrichedRecord[] = [];
		try {
			// Extract links to PDF papers from the HTML
			const linkRegex = /href="([^"]*\.pdf[^"]*)"[^>]*>([^<]*)<\/a>/gi;
			let match: RegExpExecArray | null;
			while ((match = linkRegex.exec(raw)) !== null) {
				const [, url, title] = match;
				if (!url || !title) continue;

				// Parse subject and year from title
				const yearMatch = title.match(/(20\d{2})/);
				const year = yearMatch ? Number.parseInt(yearMatch[1], 10) : null;

				records.push({
					id: `dbe-${Date.now()}-${records.length}`,
					sourceUrl: url,
					contentHash: '', // Will be set by pipeline
					data: {
						title: title.trim(),
						subject: normalizeSubjectName(title),
						year: year ?? 2024,
						type: 'past-paper',
						curriculum: 'NSC',
						gradeLevel: 12,
					},
					dataSource: 'enriched',
					dataQuality: 'medium',
					enrichedAt: new Date(),
					provenance: {
						sourceId: 'dbe-past-papers',
						fetchedAt: new Date(),
						license: 'Public Domain (South African Government)',
						transformationSteps: ['html-extraction', 'subject-normalization', 'date-parsing'],
					},
				});
			}
		} catch {
			// Return empty on parse failure - pipeline will quarantine
		}
		return records;
	},
};

/**
 * OpenStax Textbooks.
 * Licensed under CC BY 4.0 - attribution required.
 */
export const openStaxSource: DataSourceConfig = {
	id: 'openstax-textbooks',
	name: 'OpenStax Educational Content',
	url: 'https://openstax.org/subjects',
	type: 'api',
	license: 'CC BY 4.0',
	rateLimitMs: 2000,
	schedule: 'monthly',
	parser: async (raw: string): Promise<EnrichedRecord[]> => {
		const records: EnrichedRecord[] = [];
		try {
			const data = JSON.parse(raw);
			const books = Array.isArray(data) ? data : (data.books ?? data.items ?? []);

			for (const book of books) {
				if (!book?.title) continue;

				records.push({
					id: `openstax-${book.id ?? Date.now()}-${records.length}`,
					sourceUrl: book.webUrl ?? book.htmlUrl ?? `https://openstax.org/details/${book.id}`,
					contentHash: '',
					data: {
						title: book.title,
						subject: normalizeSubjectName(book.subject ?? ''),
						description: book.description ?? '',
						type: 'textbook',
						authors: book.authors ?? [],
						publishedDate: normalizeDate(book.publishDate ?? book.published),
						gradeLevel: normalizeGradeLevel(book.level ?? '12'),
						language: book.language ?? 'en',
						openStaxId: book.id,
					},
					dataSource: 'enriched',
					dataQuality: 'high',
					enrichedAt: new Date(),
					provenance: {
						sourceId: 'openstax-textbooks',
						fetchedAt: new Date(),
						license: 'CC BY 4.0',
						transformationSteps: ['json-parse', 'subject-normalization', 'grade-mapping'],
					},
				});
			}
		} catch {
			// Try to parse as HTML if JSON fails
			const titleRegex = /<h[^>]*>([^<]+)<\/h/gi;
			let match: RegExpExecArray | null;
			while ((match = titleRegex.exec(raw)) !== null) {
				const title = match[1]?.trim();
				if (!title || title.length < 3) continue;

				records.push({
					id: `openstax-html-${Date.now()}-${records.length}`,
					sourceUrl: 'https://openstax.org/subjects',
					contentHash: '',
					data: {
						title,
						subject: normalizeSubjectName(title),
						type: 'textbook-reference',
						gradeLevel: 12,
					},
					dataSource: 'enriched',
					dataQuality: 'low',
					enrichedAt: new Date(),
					provenance: {
						sourceId: 'openstax-textbooks',
						fetchedAt: new Date(),
						license: 'CC BY 4.0',
						transformationSteps: ['html-fallback-extraction', 'subject-normalization'],
					},
				});
			}
		}
		return records;
	},
};

/**
 * Wikipedia Subject Summaries.
 * Licensed under CC BY-SA 4.0.
 */
export const wikipediaSource: DataSourceConfig = {
	id: 'wikipedia-summaries',
	name: 'Wikipedia Subject Summaries',
	url: 'https://en.wikipedia.org/api/rest_v1',
	type: 'api',
	license: 'CC BY-SA 4.0',
	rateLimitMs: 1000,
	schedule: 'monthly',
	parser: async (raw: string): Promise<EnrichedRecord[]> => {
		const records: EnrichedRecord[] = [];
		try {
			const data = JSON.parse(raw);
			const pages = data.pages ?? data.extract ?? [];

			// Handle REST API response format
			const entries = Array.isArray(pages)
				? pages
				: typeof pages === 'object'
					? Object.values(pages)
					: [];

			for (const entry of entries as Record<string, unknown>[]) {
				if (!entry) continue;
				const title = (entry.title ?? entry.name ?? '') as string;
				const extract = (entry.extract ?? entry.summary ?? '') as string;

				if (!title) continue;

				records.push({
					id: `wiki-${entry.pageid ?? entry.id ?? Date.now()}-${records.length}`,
					sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
					contentHash: '',
					data: {
						title,
						subject: normalizeSubjectName(title),
						summary: normalizeAnswerFormat(extract),
						type: 'encyclopedia-summary',
						gradeLevel: 12,
						wikipediaTitle: title,
					},
					dataSource: 'enriched',
					dataQuality: extract.length > 100 ? 'high' : 'medium',
					enrichedAt: new Date(),
					provenance: {
						sourceId: 'wikipedia-summaries',
						fetchedAt: new Date(),
						license: 'CC BY-SA 4.0',
						transformationSteps: ['json-parse', 'extract-cleanup', 'subject-normalization'],
					},
				});
			}
		} catch {
			// Fallback: try to extract from HTML
		}
		return records;
	},
};

/**
 * Khan Academy (if API access is available).
 * Licensed under CC BY-NC-SA.
 */
export const khanAcademySource: DataSourceConfig = {
	id: 'khan-academy',
	name: 'Khan Academy Content',
	url: 'https://www.khanacademy.org/api/v1',
	type: 'api',
	license: 'CC BY-NC-SA',
	rateLimitMs: 3000,
	schedule: 'monthly',
	parser: async (raw: string): Promise<EnrichedRecord[]> => {
		const records: EnrichedRecord[] = [];
		try {
			const data = JSON.parse(raw);
			const items = data.items ?? data.exercises ?? data.videos ?? [];

			for (const item of items) {
				if (!item?.title) continue;

				records.push({
					id: `ka-${item.id ?? item.readableId ?? Date.now()}-${records.length}`,
					sourceUrl: `https://www.khanacademy.org/${item.url ?? item.relativeUrl ?? ''}`,
					contentHash: '',
					data: {
						title: item.title,
						subject: normalizeSubjectName(item.subject ?? item.category ?? ''),
						description: normalizeAnswerFormat(item.description ?? item.summary ?? ''),
						type: item.kind ?? 'educational-content',
						gradeLevel: normalizeGradeLevel(item.grade ?? '12'),
						duration: item.duration ?? null,
						videoUrl: item.videoUrl ?? item.youtubeId ?? null,
					},
					dataSource: 'enriched',
					dataQuality: item.description ? 'high' : 'medium',
					enrichedAt: new Date(),
					provenance: {
						sourceId: 'khan-academy',
						fetchedAt: new Date(),
						license: 'CC BY-NC-SA',
						transformationSteps: ['json-parse', 'subject-normalization', 'grade-mapping'],
					},
				});
			}
		} catch {
			// Parse failure - return empty
		}
		return records;
	},
};

/**
 * Manual entry source - for data that must be entered by hand.
 */
export const manualEntrySource: DataSourceConfig = {
	id: 'manual-entry',
	name: 'Manual Data Entry',
	url: '',
	type: 'manual',
	license: 'Various',
	rateLimitMs: 0,
	schedule: 'weekly',
	parser: async (): Promise<EnrichedRecord[]> => {
		// Manual entries are added directly, not fetched
		return [];
	},
};

/**
 * Registry of all known data sources.
 */
export const DATA_SOURCES: DataSourceConfig[] = [
	dbePastPapersSource,
	openStaxSource,
	wikipediaSource,
	khanAcademySource,
	manualEntrySource,
];

/**
 * Get a source by ID.
 */
export function getSourceById(id: string): DataSourceConfig | undefined {
	return DATA_SOURCES.find((s) => s.id === id);
}

/**
 * Get all source IDs.
 */
export function getSourceIds(): string[] {
	return DATA_SOURCES.map((s) => s.id);
}
