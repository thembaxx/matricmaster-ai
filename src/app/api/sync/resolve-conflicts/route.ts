import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import type { ConflictResolutionStrategy } from '@/lib/offline/types';

const log = logger.createLogger('SyncResolveConflicts');

interface ResolutionInput {
	conflictId: string;
	strategy: ConflictResolutionStrategy;
}

interface ResolveConflictsRequestBody {
	resolutions: ResolutionInput[];
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.user.id;
		const body: ResolveConflictsRequestBody = await request.json();

		if (!body.resolutions || !Array.isArray(body.resolutions)) {
			return NextResponse.json(
				{ error: 'Invalid request body. Expected resolutions array.' },
				{ status: 400 }
			);
		}

		const validStrategies: ConflictResolutionStrategy[] = ['local', 'remote', 'newest', 'merged'];
		const invalidResolutions = body.resolutions.filter(
			(r: ResolutionInput) => !validStrategies.includes(r.strategy)
		);

		if (invalidResolutions.length > 0) {
			return NextResponse.json(
				{
					error: 'Invalid resolution strategy',
					invalidResolutions: invalidResolutions.map((r: ResolutionInput) => r.conflictId),
				},
				{ status: 400 }
			);
		}

		log.info('Processing conflict resolutions', {
			userId,
			count: body.resolutions.length,
			resolutions: body.resolutions.map((r: ResolutionInput) => ({
				conflictId: r.conflictId,
				strategy: r.strategy,
			})),
		});

		const results = await processResolutions(userId, body);

		return NextResponse.json({
			success: results.success,
			resolved: results.resolved,
			failed: results.failed,
			errors: results.errors,
		});
	} catch (error) {
		log.error('Failed to resolve conflicts', { error });
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

async function processResolutions(
	userId: string,
	request: ResolveConflictsRequestBody
): Promise<{
	success: boolean;
	resolved: number;
	failed: number;
	errors: string[];
}> {
	const result = {
		success: true,
		resolved: 0,
		failed: 0,
		errors: [] as string[],
	};

	for (const resolution of request.resolutions) {
		try {
			await applyResolution(userId, resolution);
			result.resolved++;
			log.info('Conflict resolved successfully', {
				userId,
				conflictId: resolution.conflictId,
				strategy: resolution.strategy,
			});
		} catch (error) {
			result.failed++;
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			result.errors.push(`Failed to resolve ${resolution.conflictId}: ${errorMessage}`);
			log.error('Failed to resolve conflict', {
				userId,
				conflictId: resolution.conflictId,
				error: errorMessage,
			});
		}
	}

	result.success = result.failed === 0;
	return result;
}

async function applyResolution(userId: string, resolution: ResolutionInput): Promise<void> {
	const { conflictId, strategy } = resolution;

	log.debug('Applying resolution', { userId, conflictId, strategy });

	// In a production implementation, this would:
	// 1. Fetch the conflict data from a server-side store
	// 2. Apply the resolution strategy
	// 3. Update the database with the resolved data
	// 4. Clear the conflict record

	// For now, we log the resolution action
	// The actual data application happens client-side via the sync service

	return Promise.resolve();
}

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		return NextResponse.json({
			supportedStrategies: ['local', 'remote', 'newest', 'merged'],
			description: {
				local: 'Keep local (offline) changes',
				remote: 'Keep remote (server) changes',
				newest: 'Keep the most recent changes based on timestamp',
				merged: 'Intelligently merge local and remote data',
			},
		});
	} catch (error) {
		log.error('Failed to get conflict resolution info', { error });
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
