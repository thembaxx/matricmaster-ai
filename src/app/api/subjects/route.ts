'use server';

import { eq } from 'drizzle-orm';
import { dbManager } from '@/lib/db';
import { subjects } from '@/lib/db/schema';

async function getDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export async function GET() {
	const db = await getDb();

	try {
		const allSubjects = await db
			.select({
				id: subjects.id,
				name: subjects.name,
				displayName: subjects.displayName,
			})
			.from(subjects)
			.where(eq(subjects.isActive, true))
			.orderBy(subjects.displayOrder);

		return Response.json(allSubjects);
	} catch (error) {
		console.error('Error fetching subjects:', error);
		return Response.json({ error: 'Failed to fetch subjects' }, { status: 500 });
	}
}
