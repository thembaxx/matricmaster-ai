import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import {
	bookSession,
	cancelSession,
	confirmSession,
	createTutorProfile,
	getAvailableTutors,
	getMySessions,
	getSessionDetails,
	getTutorProfile,
	getTutorReviews,
	getUserXP,
	isUserTutor,
	leaveReview,
	reportSession,
	updateTutorAvailability,
} from '@/lib/marketplace-service';

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const action = searchParams.get('action');
		const tutorId = searchParams.get('tutorId');
		const sessionId = searchParams.get('sessionId');

		if (action === 'my-sessions') {
			const asRole = searchParams.get('asRole') as 'student' | 'tutor' | 'both' | null;
			const sessions = await getMySessions(asRole || 'both');
			return NextResponse.json({ success: true, data: sessions });
		}

		if (action === 'session' && sessionId) {
			const session = await getSessionDetails(sessionId);
			if (!session) {
				return NextResponse.json({ error: 'Session not found' }, { status: 404 });
			}
			return NextResponse.json({ success: true, data: session });
		}

		if (action === 'reviews' && tutorId) {
			const reviews = await getTutorReviews(tutorId);
			return NextResponse.json({ success: true, data: reviews });
		}

		if (action === 'is-tutor') {
			const tutor = await isUserTutor();
			return NextResponse.json({ success: true, data: { isTutor: tutor } });
		}

		if (action === 'my-xp') {
			const xp = await getUserXP();
			return NextResponse.json({ success: true, data: { xp } });
		}

		if (action === 'tutor' && tutorId) {
			const profile = await getTutorProfile(tutorId);
			if (!profile) {
				return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
			}
			return NextResponse.json({ success: true, data: profile });
		}

		const subject = searchParams.get('subject') || undefined;
		const maxPriceXP = searchParams.get('maxPriceXP')
			? Number.parseInt(searchParams.get('maxPriceXP')!, 10)
			: undefined;
		const minRating = searchParams.get('minRating')
			? Number.parseFloat(searchParams.get('minRating')!)
			: undefined;
		const searchQuery = searchParams.get('search') || undefined;

		const tutors = await getAvailableTutors({
			subject,
			maxPriceXP,
			minRating,
			searchQuery,
			availableOnly: true,
		});

		return NextResponse.json({ success: true, data: tutors });
	} catch (error) {
		console.debug('Error in marketplace GET:', error);
		return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { action } = body;

		if (action === 'create-profile') {
			const result = await createTutorProfile({
				bio: body.bio,
				teachingStyle: body.teachingStyle,
				subjects: body.subjects || [],
				hourlyRateXP: body.hourlyRateXP,
				availabilitySchedule: body.availabilitySchedule,
			});

			if (!result.success) {
				return NextResponse.json({ error: result.error }, { status: 500 });
			}

			return NextResponse.json({ success: true, data: result.profile }, { status: 201 });
		}

		if (action === 'book') {
			const result = await bookSession({
				tutorId: body.tutorId,
				subject: body.subject,
				scheduledAt: new Date(body.scheduledAt),
				durationMinutes: body.durationMinutes,
			});

			if (!result.success) {
				return NextResponse.json({ error: result.error }, { status: 400 });
			}

			return NextResponse.json({ success: true, data: result.session }, { status: 201 });
		}

		if (action === 'confirm') {
			const result = await confirmSession(body.sessionId, body.confirmed);

			if (!result.success) {
				return NextResponse.json({ error: result.error }, { status: 400 });
			}

			return NextResponse.json({ success: true });
		}

		if (action === 'cancel') {
			const result = await cancelSession(body.sessionId, body.reason);

			if (!result.success) {
				return NextResponse.json({ error: result.error }, { status: 400 });
			}

			return NextResponse.json({ success: true });
		}

		if (action === 'review') {
			const result = await leaveReview({
				sessionId: body.sessionId,
				rating: body.rating,
				comment: body.comment,
			});

			if (!result.success) {
				return NextResponse.json({ error: result.error }, { status: 400 });
			}

			return NextResponse.json({ success: true, data: result.review }, { status: 201 });
		}

		if (action === 'report') {
			const result = await reportSession(body.sessionId, body.reason, body.details);

			if (!result.success) {
				return NextResponse.json({ error: result.error }, { status: 400 });
			}

			return NextResponse.json({ success: true });
		}

		if (action === 'update-availability') {
			const result = await updateTutorAvailability(body.isAvailable);

			if (!result.success) {
				return NextResponse.json({ error: result.error }, { status: 400 });
			}

			return NextResponse.json({ success: true });
		}

		return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
	} catch (error) {
		console.debug('Error in marketplace POST:', error);
		return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
	}
}
