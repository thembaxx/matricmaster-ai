import { and, desc, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { studyPlans } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
		}

		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return NextResponse.json({ error: 'database unavailable' }, { status: 503 });
		}

		const db: DbType = await dbManager.getDb();
		const activePlan = await db.query.studyPlans.findFirst({
			where: and(eq(studyPlans.userId, session.user.id), eq(studyPlans.isActive, true)),
			orderBy: [desc(studyPlans.createdAt)],
		});

		if (!activePlan) {
			return NextResponse.json({ targetExamDate: null });
		}

		return NextResponse.json({
			id: activePlan.id,
			title: activePlan.title,
			targetExamDate: activePlan.targetExamDate?.toISOString() || null,
		});
	} catch (error) {
		return handleApiError(error);
	}
}
