import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { exportUserData } from '@/services/accountDeletion';

/**
 * GET /api/account/export-data
 * POPIA-compliant data export endpoint
 * Returns all personal data held about the authenticated user
 */
export async function GET(_request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const exportData = await exportUserData(session.user.id);

		return NextResponse.json({
			success: true,
			data: exportData,
			message: 'Data export completed. Download and save this file for your records.',
		});
	} catch (error) {
		console.error('Data export error:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Failed to export data' },
			{ status: 500 }
		);
	}
}
