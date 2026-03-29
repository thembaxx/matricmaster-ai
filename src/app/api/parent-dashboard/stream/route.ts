import type { NextRequest } from 'next/server';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';

export async function GET(request: NextRequest) {
	const auth = await getAuth();
	const headersList = request.headers;
	const session = await auth.api.getSession({ headers: headersList as never });

	if (!session?.user?.id) {
		return new Response('Unauthorized', { status: 401 });
	}

	const userId = session.user.id;
	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		start(controller) {
			controller.enqueue(encoder.encode('event: connected\ndata: {}\n\n'));

			const intervalId = setInterval(async () => {
				try {
					const db = await dbManager.getDb();

					const recentQuizzes = await db.query.quizResults.findMany({
						where: (qr, { eq }) => eq(qr.userId, userId),
						orderBy: (qr, { desc }) => [desc(qr.completedAt)],
						limit: 1,
					});

					if (recentQuizzes.length > 0) {
						const latest = recentQuizzes[0];
						const minutesAgo = Math.floor(
							(Date.now() - new Date(latest.completedAt).getTime()) / (1000 * 60)
						);

						if (minutesAgo < 1) {
							controller.enqueue(
								encoder.encode(
									`event: quiz_completed\ndata: ${JSON.stringify({
										score: latest.score,
										percentage: latest.percentage,
									})}\n\n`
								)
							);
						}
					}
				} catch (error) {
					console.debug('Stream update error:', error);
				}
			}, 30000);

			request.signal.addEventListener('abort', () => {
				clearInterval(intervalId);
				controller.close();
			});
		},
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
		},
	});
}
