import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth, type SessionUser } from '@/lib/auth';
import { getEnrichmentPipeline, type PipelineResult } from '@/lib/enrichment/pipeline';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/enrichment/run
 *
 * Triggers the enrichment pipeline.
 * Admin-only access required.
 *
 * Body:
 *   { sourceId?: string, runAll?: boolean }
 *
 * Returns:
 *   Single PipelineResult if sourceId is provided, or array of results for runAll.
 */
export async function POST(request: NextRequest) {
	try {
		// Admin-only check
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session || (session.user as SessionUser).role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 401 });
		}

		const body = await request.json().catch(() => ({}));
		const { sourceId, runAll }: { sourceId?: string; runAll?: boolean } = body;

		const pipeline = getEnrichmentPipeline();

		if (sourceId && !runAll) {
			// Run for specific source
			const result: PipelineResult = await pipeline.runSource(sourceId);
			return NextResponse.json(result, { status: result.success ? 200 : 500 });
		}

		// Run all sources
		const results: PipelineResult[] = await pipeline.runAll();
		return NextResponse.json(
			{
				success: results.every((r) => r.success),
				results,
				summary: {
					totalSources: results.length,
					succeeded: results.filter((r) => r.success).length,
					failed: results.filter((r) => !r.success).length,
					totalRecordsPersisted: results.reduce((sum, r) => sum + r.recordsPersisted, 0),
					totalRecordsQuarantined: results.reduce((sum, r) => sum + r.recordsQuarantined, 0),
				},
			},
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
