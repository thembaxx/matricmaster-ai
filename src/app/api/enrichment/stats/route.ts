import { NextResponse } from 'next/server';
import { getEnrichmentPipeline } from '@/lib/enrichment/pipeline';
import { getSourceById, getSourceIds } from '@/lib/enrichment/sources';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/enrichment/stats
 *
 * Returns pipeline statistics and source registry info.
 */
export async function GET() {
	try {
		const pipeline = getEnrichmentPipeline();
		const stats = pipeline.getStats();
		const quarantine = pipeline.getQuarantine();

		const sourceRegistry = getSourceIds()
			.map((id) => {
				const source = getSourceById(id);
				return source
					? {
							id: source.id,
							name: source.name,
							type: source.type,
							license: source.license,
							schedule: source.schedule,
						}
					: null;
			})
			.filter(Boolean);

		return NextResponse.json({
			stats,
			quarantineCount: quarantine.length,
			recentQuarantine: quarantine.slice(-10).map((entry) => ({
				sourceId: entry.sourceId,
				reason: entry.reason,
				timestamp: entry.timestamp.toISOString(),
			})),
			sources: sourceRegistry,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
