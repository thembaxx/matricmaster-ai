import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { getFeatureFlags, setFeatureFlag } from '@/lib/feature-flags';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/enrichment/toggle
 *
 * Toggles enrichment feature flags. Requires authenticated session.
 * Body: { flag: 'mockData' | 'enrichment' | 'enrichedUI', value: boolean }
 * Returns current state of all flags.
 */
export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
		}

		const body = await request.json();
		const { flag, value } = body as {
			flag: 'mockData' | 'enrichment' | 'enrichedUI';
			value: boolean;
		};

		if (!flag || typeof value !== 'boolean') {
			return NextResponse.json(
				{
					error: 'Invalid body: { flag: "mockData" | "enrichment" | "enrichedUI", value: boolean }',
				},
				{ status: 400 }
			);
		}

		const flagKeyMap: Record<string, string> = {
			mockData: 'ENABLE_MOCK_DATA',
			enrichment: 'ENABLE_ENRICHMENT_PIPELINE',
			enrichedUI: 'ENABLE_ENRICHED_UI',
		};

		const envFlagKey = flagKeyMap[flag];
		if (!envFlagKey) {
			return NextResponse.json({ error: `Unknown flag: ${flag}` }, { status: 400 });
		}

		// Apply runtime override
		setFeatureFlag(envFlagKey, value);

		// Also sync to the Zustand store state via the returned value
		// (client-side will read the updated flags from this response)

		const currentFlags = getFeatureFlags();

		return NextResponse.json({
			success: true,
			updatedFlag: flag,
			newValue: value,
			flags: {
				mockDataEnabled: currentFlags.ENABLE_MOCK_DATA ?? false,
				enrichmentEnabled: currentFlags.ENABLE_ENRICHMENT_PIPELINE ?? false,
				enrichedUIEnabled: currentFlags.ENABLE_ENRICHED_UI ?? true,
			},
			userId: session.user.id,
		});
	} catch (error) {
		return NextResponse.json(
			{
				error: 'Toggle failed',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}

/**
 * GET /api/enrichment/toggle
 *
 * Returns current state of all feature flags. No auth required for reading.
 */
export async function GET() {
	try {
		const currentFlags = getFeatureFlags();

		return NextResponse.json({
			flags: {
				mockDataEnabled: currentFlags.ENABLE_MOCK_DATA ?? false,
				enrichmentEnabled: currentFlags.ENABLE_ENRICHMENT_PIPELINE ?? false,
				enrichedUIEnabled: currentFlags.ENABLE_ENRICHED_UI ?? true,
			},
		});
	} catch (error) {
		return NextResponse.json(
			{
				error: 'Failed to read flags',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
