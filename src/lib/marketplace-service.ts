'use server';

import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import {
	sessionReports,
	tutoringSessions,
	tutorProfiles,
	tutorReviews,
	userProgress,
	users,
} from '@/lib/db/schema';

const getDb = () => dbManager.getDb();

async function ensureAuthenticated() {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');
	return session.user;
}

function parseJsonField<T>(value: unknown, defaultValue: T): T {
	if (value === null || value === undefined) return defaultValue;
	if (typeof value === 'string') {
		try {
			return JSON.parse(value) as T;
		} catch {
			return defaultValue;
		}
	}
	if (Array.isArray(value)) return value as T;
	return defaultValue;
}

export interface TutorProfileResponse {
	id: string;
	userId: string;
	userName: string | null;
	userImage: string | null;
	bio: string | null;
	teachingStyle: string | null;
	subjects: string[];
	hourlyRateXP: number;
	isAvailable: boolean;
	totalSessions: number;
	rating: number;
	totalRatings: number;
	availabilitySchedule: string | null;
}

export interface TutoringSessionResponse {
	id: string;
	tutorId: string;
	studentId: string;
	tutorName: string | null;
	tutorImage: string | null;
	studentName: string | null;
	studentImage: string | null;
	subject: string;
	scheduledAt: Date;
	durationMinutes: number;
	status: string;
	xpPaid: number;
	xpEarned: number;
	roomUrl: string | null;
	studentConfirmed: boolean;
	tutorConfirmed: boolean;
	completedAt: Date | null;
	createdAt: Date | null;
}

export interface TutorReviewResponse {
	id: string;
	sessionId: string;
	studentId: string;
	studentName: string | null;
	studentImage: string | null;
	rating: number;
	comment: string | null;
	createdAt: Date | null;
}

export interface TutorSearchFilters {
	subject?: string;
	maxPriceXP?: number;
	minRating?: number;
	availableOnly?: boolean;
	searchQuery?: string;
}

export async function getAvailableTutors(
	filters?: TutorSearchFilters
): Promise<TutorProfileResponse[]> {
	try {
		const db = getDb();

		const results = await db
			.select({
				id: tutorProfiles.id,
				userId: tutorProfiles.userId,
				userName: users.name,
				userImage: users.image,
				bio: tutorProfiles.bio,
				teachingStyle: tutorProfiles.teachingStyle,
				subjects: tutorProfiles.subjects,
				hourlyRateXP: tutorProfiles.hourlyRateXP,
				isAvailable: tutorProfiles.isAvailable,
				totalSessions: tutorProfiles.totalSessions,
				rating: tutorProfiles.rating,
				totalRatings: tutorProfiles.totalRatings,
				availabilitySchedule: tutorProfiles.availabilitySchedule,
			})
			.from(tutorProfiles)
			.innerJoin(users, eq(tutorProfiles.userId, users.id))
			.where(eq(tutorProfiles.isAvailable, filters?.availableOnly ?? true))
			.orderBy(desc(tutorProfiles.rating));

		let tutors = results.map((t: any) => ({
			...t,
			subjects: parseJsonField<string[]>(t.subjects, []),
			rating: Number(t.rating) || 0,
		}));

		if (filters?.subject) {
			tutors = tutors.filter((t: TutorProfileResponse) =>
				t.subjects.some((s: string) => s.toLowerCase().includes(filters.subject!.toLowerCase()))
			);
		}

		if (filters?.maxPriceXP !== undefined) {
			tutors = tutors.filter((t: TutorProfileResponse) => t.hourlyRateXP <= filters.maxPriceXP!);
		}

		if (filters?.minRating !== undefined) {
			tutors = tutors.filter((t: TutorProfileResponse) => t.rating >= filters.minRating!);
		}

		if (filters?.searchQuery) {
			const query = filters.searchQuery.toLowerCase();
			tutors = tutors.filter(
				(t: TutorProfileResponse) =>
					t.userName?.toLowerCase().includes(query) ||
					t.bio?.toLowerCase().includes(query) ||
					t.subjects.some((s: string) => s.toLowerCase().includes(query))
			);
		}

		return tutors;
	} catch (error) {
		console.debug('[Marketplace] Error getting tutors:', error);
		return [];
	}
}

export async function getTutorProfile(tutorId: string): Promise<TutorProfileResponse | null> {
	try {
		const db = getDb();
		const [result] = await db
			.select({
				id: tutorProfiles.id,
				userId: tutorProfiles.userId,
				userName: users.name,
				userImage: users.image,
				bio: tutorProfiles.bio,
				teachingStyle: tutorProfiles.teachingStyle,
				subjects: tutorProfiles.subjects,
				hourlyRateXP: tutorProfiles.hourlyRateXP,
				isAvailable: tutorProfiles.isAvailable,
				totalSessions: tutorProfiles.totalSessions,
				rating: tutorProfiles.rating,
				totalRatings: tutorProfiles.totalRatings,
				availabilitySchedule: tutorProfiles.availabilitySchedule,
			})
			.from(tutorProfiles)
			.innerJoin(users, eq(tutorProfiles.userId, users.id))
			.where(eq(tutorProfiles.userId, tutorId))
			.limit(1);

		if (!result) return null;

		return {
			...result,
			subjects: parseJsonField<string[]>(result.subjects, []),
			rating: Number(result.rating) || 0,
		};
	} catch (error) {
		console.debug('[Marketplace] Error getting tutor profile:', error);
		return null;
	}
}

export async function createTutorProfile(data: {
	bio?: string;
	teachingStyle?: string;
	subjects: string[];
	hourlyRateXP?: number;
	availabilitySchedule?: string;
}): Promise<{ success: boolean; profile?: TutorProfileResponse; error?: string }> {
	const user = await ensureAuthenticated();

	try {
		const db = getDb();

		const existing = await db
			.select()
			.from(tutorProfiles)
			.where(eq(tutorProfiles.userId, user.id))
			.limit(1);

		if (existing.length > 0) {
			const [updated] = await db
				.update(tutorProfiles)
				.set({
					bio: data.bio,
					teachingStyle: data.teachingStyle,
					subjects: data.subjects,
					hourlyRateXP: data.hourlyRateXP,
					availabilitySchedule: data.availabilitySchedule,
					updatedAt: new Date(),
				})
				.where(eq(tutorProfiles.userId, user.id))
				.returning();

			return {
				success: true,
				profile: {
					...updated,
					userName: user.name,
					userImage: user.image ?? null,
					subjects: parseJsonField(updated.subjects, []),
					rating: Number(updated.rating) || 0,
				},
			};
		}

		const [created] = await db
			.insert(tutorProfiles)
			.values({
				userId: user.id,
				bio: data.bio || '',
				teachingStyle: data.teachingStyle || '',
				subjects: data.subjects,
				hourlyRateXP: data.hourlyRateXP || 100,
				availabilitySchedule: data.availabilitySchedule,
			})
			.returning();

		return {
			success: true,
			profile: {
				...created,
				userName: user.name,
				userImage: user.image ?? null,
				subjects: parseJsonField(created.subjects, []),
				rating: Number(created.rating) || 0,
			},
		};
	} catch (error) {
		console.debug('[Marketplace] Error creating tutor profile:', error);
		return { success: false, error: String(error) };
	}
}

export async function bookSession(data: {
	tutorId: string;
	subject: string;
	scheduledAt: Date;
	durationMinutes?: number;
}): Promise<{ success: boolean; session?: TutoringSessionResponse; error?: string }> {
	const user = await ensureAuthenticated();

	try {
		const db = getDb();

		const [tutor] = await db
			.select()
			.from(tutorProfiles)
			.where(and(eq(tutorProfiles.userId, data.tutorId), eq(tutorProfiles.isAvailable, true)))
			.limit(1);

		if (!tutor) {
			return { success: false, error: 'Tutor not available' };
		}

		const durationMinutes = data.durationMinutes || 60;
		const xpCost = Math.ceil((tutor.hourlyRateXP * durationMinutes) / 60);

		const [studentProgress] = await db
			.select()
			.from(userProgress)
			.where(eq(userProgress.userId, user.id))
			.limit(1);

		const studentXP = studentProgress?.totalCorrect || 0;

		if (studentXP < xpCost) {
			return { success: false, error: `Insufficient XP. Need ${xpCost} XP, have ${studentXP} XP.` };
		}

		await db
			.update(userProgress)
			.set({ totalCorrect: studentXP - xpCost })
			.where(eq(userProgress.userId, user.id));

		const [created] = await db
			.insert(tutoringSessions)
			.values({
				tutorId: data.tutorId,
				studentId: user.id,
				subject: data.subject,
				scheduledAt: data.scheduledAt,
				durationMinutes,
				xpPaid: xpCost,
				xpEarned: 0,
				status: 'confirmed',
			})
			.returning();

		const [tutorUser] = await db
			.select({ name: users.name, image: users.image })
			.from(users)
			.where(eq(users.id, data.tutorId))
			.limit(1);

		return {
			success: true,
			session: {
				id: created.id,
				tutorId: created.tutorId,
				studentId: created.studentId,
				tutorName: tutorUser?.name || null,
				tutorImage: tutorUser?.image || null,
				studentName: user.name,
				studentImage: user.image ?? null,
				subject: created.subject,
				scheduledAt: created.scheduledAt,
				durationMinutes: created.durationMinutes,
				status: created.status,
				xpPaid: created.xpPaid,
				xpEarned: created.xpEarned,
				roomUrl: created.roomUrl,
				studentConfirmed: created.studentConfirmed,
				tutorConfirmed: created.tutorConfirmed,
				completedAt: created.completedAt,
				createdAt: created.createdAt,
			},
		};
	} catch (error) {
		console.debug('[Marketplace] Error booking session:', error);
		return { success: false, error: String(error) };
	}
}

export async function getMySessions(
	asRole: 'student' | 'tutor' | 'both' = 'both'
): Promise<TutoringSessionResponse[]> {
	const user = await ensureAuthenticated();

	try {
		const db = getDb();

		let results: (typeof tutoringSessions.$inferSelect)[] = [];

		if (asRole === 'student' || asRole === 'both') {
			const asStudent = await db
				.select()
				.from(tutoringSessions)
				.where(eq(tutoringSessions.studentId, user.id))
				.orderBy(desc(tutoringSessions.scheduledAt));
			results = [...results, ...asStudent];
		}

		if (asRole === 'tutor' || asRole === 'both') {
			const asTutor = await db
				.select()
				.from(tutoringSessions)
				.where(eq(tutoringSessions.tutorId, user.id))
				.orderBy(desc(tutoringSessions.scheduledAt));
			results = [...results, ...asTutor];
		}

		const uniqueSessions = results.filter(
			(session, index, self) => index === self.findIndex((s) => s.id === session.id)
		);

		const tutorIds = [...new Set(uniqueSessions.map((s) => s.tutorId))];
		const studentIds = [...new Set(uniqueSessions.map((s) => s.studentId))];

		const allUserIds = [...new Set([...tutorIds, ...studentIds])];

		const userInfos = await db
			.select({ id: users.id, name: users.name, image: users.image })
			.from(users)
			.where(inArray(users.id, allUserIds));

		const userMap = new Map<string, { id: string; name: string | null; image: string | null }>(
			userInfos.map((u: { id: string; name: string | null; image: string | null }) => [u.id, u])
		);

		return uniqueSessions.map((session) => ({
			id: session.id,
			tutorId: session.tutorId,
			studentId: session.studentId,
			tutorName: userMap.get(session.tutorId)?.name || null,
			tutorImage: userMap.get(session.tutorId)?.image || null,
			studentName: userMap.get(session.studentId)?.name || null,
			studentImage: userMap.get(session.studentId)?.image || null,
			subject: session.subject,
			scheduledAt: session.scheduledAt,
			durationMinutes: session.durationMinutes,
			status: session.status,
			xpPaid: session.xpPaid,
			xpEarned: session.xpEarned,
			roomUrl: session.roomUrl,
			studentConfirmed: session.studentConfirmed,
			tutorConfirmed: session.tutorConfirmed,
			completedAt: session.completedAt,
			createdAt: session.createdAt,
		}));
	} catch (error) {
		console.debug('[Marketplace] Error getting sessions:', error);
		return [];
	}
}

export async function getSessionDetails(
	sessionId: string
): Promise<TutoringSessionResponse | null> {
	const user = await ensureAuthenticated();

	try {
		const db = getDb();

		const [session] = await db
			.select()
			.from(tutoringSessions)
			.where(
				and(
					eq(tutoringSessions.id, sessionId),
					sql`(${tutoringSessions.studentId} = ${user.id} OR ${tutoringSessions.tutorId} = ${user.id})`
				)
			)
			.limit(1);

		if (!session) return null;

		const [tutorUser] = await db
			.select({ name: users.name, image: users.image })
			.from(users)
			.where(eq(users.id, session.tutorId))
			.limit(1);

		const [studentUser] = await db
			.select({ name: users.name, image: users.image })
			.from(users)
			.where(eq(users.id, session.studentId))
			.limit(1);

		return {
			id: session.id,
			tutorId: session.tutorId,
			studentId: session.studentId,
			tutorName: tutorUser?.name || null,
			tutorImage: tutorUser?.image || null,
			studentName: studentUser?.name || null,
			studentImage: studentUser?.image || null,
			subject: session.subject,
			scheduledAt: session.scheduledAt,
			durationMinutes: session.durationMinutes,
			status: session.status,
			xpPaid: session.xpPaid,
			xpEarned: session.xpEarned,
			roomUrl: session.roomUrl,
			studentConfirmed: session.studentConfirmed,
			tutorConfirmed: session.tutorConfirmed,
			completedAt: session.completedAt,
			createdAt: session.createdAt,
		};
	} catch (error) {
		console.debug('[Marketplace] Error getting session:', error);
		return null;
	}
}

export async function confirmSession(
	sessionId: string,
	confirmed: boolean
): Promise<{ success: boolean; error?: string }> {
	const user = await ensureAuthenticated();

	try {
		const db = getDb();

		const [session] = await db
			.select()
			.from(tutoringSessions)
			.where(
				and(
					eq(tutoringSessions.id, sessionId),
					sql`(${tutoringSessions.studentId} = ${user.id} OR ${tutoringSessions.tutorId} = ${user.id})`
				)
			)
			.limit(1);

		if (!session) {
			return { success: false, error: 'Session not found' };
		}

		const isStudent = session.studentId === user.id;
		const isTutor = session.tutorId === user.id;

		if (isStudent) {
			await db
				.update(tutoringSessions)
				.set({ studentConfirmed: confirmed, updatedAt: new Date() })
				.where(eq(tutoringSessions.id, sessionId));
		}

		if (isTutor) {
			await db
				.update(tutoringSessions)
				.set({ tutorConfirmed: confirmed, updatedAt: new Date() })
				.where(eq(tutoringSessions.id, sessionId));
		}

		const [updated] = await db
			.select()
			.from(tutoringSessions)
			.where(eq(tutoringSessions.id, sessionId))
			.limit(1);

		if (updated?.studentConfirmed && updated?.tutorConfirmed) {
			const [tutorProfile] = await db
				.select()
				.from(tutorProfiles)
				.where(eq(tutorProfiles.userId, session.tutorId))
				.limit(1);

			const xpEarned = tutorProfile?.hourlyRateXP || 100;

			await db
				.update(tutoringSessions)
				.set({ status: 'completed', completedAt: new Date(), xpEarned, updatedAt: new Date() })
				.where(eq(tutoringSessions.id, sessionId));

			const [tutorProgress] = await db
				.select()
				.from(userProgress)
				.where(eq(userProgress.userId, session.tutorId))
				.limit(1);

			if (tutorProgress) {
				await db
					.update(userProgress)
					.set({ totalCorrect: (tutorProgress.totalCorrect || 0) + xpEarned })
					.where(eq(userProgress.id, tutorProgress.id));
			}

			if (tutorProfile) {
				await db
					.update(tutorProfiles)
					.set({ totalSessions: (tutorProfile.totalSessions || 0) + 1 })
					.where(eq(tutorProfiles.id, tutorProfile.id));
			}
		}

		return { success: true };
	} catch (error) {
		console.debug('[Marketplace] Error confirming session:', error);
		return { success: false, error: String(error) };
	}
}

export async function cancelSession(
	sessionId: string,
	reason?: string
): Promise<{ success: boolean; error?: string }> {
	const user = await ensureAuthenticated();

	try {
		const db = getDb();

		const [session] = await db
			.select()
			.from(tutoringSessions)
			.where(
				and(
					eq(tutoringSessions.id, sessionId),
					sql`(${tutoringSessions.studentId} = ${user.id} OR ${tutoringSessions.tutorId} = ${user.id})`
				)
			)
			.limit(1);

		if (!session) {
			return { success: false, error: 'Session not found' };
		}

		if (session.status === 'completed') {
			return { success: false, error: 'Cannot cancel completed session' };
		}

		await db
			.update(tutoringSessions)
			.set({
				status: 'cancelled',
				cancelledAt: new Date(),
				cancellationReason: reason,
				updatedAt: new Date(),
			})
			.where(eq(tutoringSessions.id, sessionId));

		const [studentProgress] = await db
			.select()
			.from(userProgress)
			.where(eq(userProgress.userId, session.studentId))
			.limit(1);

		if (studentProgress && session.xpPaid > 0) {
			await db
				.update(userProgress)
				.set({ totalCorrect: (studentProgress.totalCorrect || 0) + session.xpPaid })
				.where(eq(userProgress.id, studentProgress.id));
		}

		return { success: true };
	} catch (error) {
		console.debug('[Marketplace] Error cancelling session:', error);
		return { success: false, error: String(error) };
	}
}

export async function leaveReview(data: {
	sessionId: string;
	rating: number;
	comment?: string;
}): Promise<{ success: boolean; review?: TutorReviewResponse; error?: string }> {
	const user = await ensureAuthenticated();

	try {
		const db = getDb();

		const [session] = await db
			.select()
			.from(tutoringSessions)
			.where(and(eq(tutoringSessions.id, data.sessionId), eq(tutoringSessions.studentId, user.id)))
			.limit(1);

		if (!session) {
			return { success: false, error: 'Session not found or not authorized' };
		}

		if (session.status !== 'completed') {
			return { success: false, error: 'Can only review completed sessions' };
		}

		const existing = await db
			.select()
			.from(tutorReviews)
			.where(and(eq(tutorReviews.sessionId, data.sessionId), eq(tutorReviews.studentId, user.id)))
			.limit(1);

		if (existing.length > 0) {
			return { success: false, error: 'Already reviewed this session' };
		}

		const [created] = await db
			.insert(tutorReviews)
			.values({
				sessionId: data.sessionId,
				tutorId: session.tutorId,
				studentId: user.id,
				rating: data.rating,
				comment: data.comment,
			})
			.returning();

		const [tutorProfile] = await db
			.select()
			.from(tutorProfiles)
			.where(eq(tutorProfiles.userId, session.tutorId))
			.limit(1);

		if (tutorProfile) {
			const totalRating =
				(Number(tutorProfile.rating) * tutorProfile.totalRatings + data.rating) /
				(tutorProfile.totalRatings + 1);

			await db
				.update(tutorProfiles)
				.set({
					rating: totalRating.toFixed(2),
					totalRatings: tutorProfile.totalRatings + 1,
				})
				.where(eq(tutorProfiles.id, tutorProfile.id));
		}

		return {
			success: true,
			review: {
				...created,
				studentName: user.name,
				studentImage: user.image ?? null,
			},
		};
	} catch (error) {
		console.debug('[Marketplace] Error leaving review:', error);
		return { success: false, error: String(error) };
	}
}

export async function getTutorReviews(tutorId: string): Promise<TutorReviewResponse[]> {
	try {
		const db = getDb();

		const reviews = await db
			.select({
				id: tutorReviews.id,
				sessionId: tutorReviews.sessionId,
				studentId: tutorReviews.studentId,
				studentName: users.name,
				studentImage: users.image,
				rating: tutorReviews.rating,
				comment: tutorReviews.comment,
				createdAt: tutorReviews.createdAt,
			})
			.from(tutorReviews)
			.innerJoin(users, eq(tutorReviews.studentId, users.id))
			.where(eq(tutorReviews.tutorId, tutorId))
			.orderBy(desc(tutorReviews.createdAt));

		return reviews;
	} catch (error) {
		console.debug('[Marketplace] Error getting reviews:', error);
		return [];
	}
}

export async function reportSession(
	sessionId: string,
	reason: string,
	details?: string
): Promise<{ success: boolean; error?: string }> {
	const user = await ensureAuthenticated();

	try {
		const db = getDb();

		const [session] = await db
			.select()
			.from(tutoringSessions)
			.where(
				and(
					eq(tutoringSessions.id, sessionId),
					sql`(${tutoringSessions.studentId} = ${user.id} OR ${tutoringSessions.tutorId} = ${user.id})`
				)
			)
			.limit(1);

		if (!session) {
			return { success: false, error: 'Session not found' };
		}

		await db.insert(sessionReports).values({
			sessionId,
			reporterId: user.id,
			reason,
			details,
		});

		return { success: true };
	} catch (error) {
		console.debug('[Marketplace] Error reporting session:', error);
		return { success: false, error: String(error) };
	}
}

export async function updateTutorAvailability(
	isAvailable: boolean
): Promise<{ success: boolean; error?: string }> {
	const user = await ensureAuthenticated();

	try {
		const db = getDb();

		await db
			.update(tutorProfiles)
			.set({ isAvailable, updatedAt: new Date() })
			.where(eq(tutorProfiles.userId, user.id));

		return { success: true };
	} catch (error) {
		console.debug('[Marketplace] Error updating availability:', error);
		return { success: false, error: String(error) };
	}
}

export async function isUserTutor(): Promise<boolean> {
	const user = await ensureAuthenticated();

	try {
		const db = getDb();

		const [profile] = await db
			.select()
			.from(tutorProfiles)
			.where(eq(tutorProfiles.userId, user.id))
			.limit(1);

		return !!profile;
	} catch {
		return false;
	}
}

export async function getUserXP(): Promise<number> {
	const user = await ensureAuthenticated();

	try {
		const db = getDb();

		const [progress] = await db
			.select()
			.from(userProgress)
			.where(eq(userProgress.userId, user.id))
			.limit(1);

		return progress?.totalCorrect || 0;
	} catch {
		return 0;
	}
}
