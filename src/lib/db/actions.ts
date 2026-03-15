'use server';

import { and, asc, desc, eq, gte, inArray, isNotNull, isNull, lt, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { z } from 'zod';
import { getAuth, type SessionUser } from '@/lib/auth';
import type { User } from './better-auth-schema';
import { users } from './better-auth-schema';
import { type DbType, dbManager } from './index';
import type {
	BuddyRequest,
	ContentFlag,
	NewOption,
	NewPastPaper,
	NewQuestion,
	NewSubject,
	Option,
	PastPaper,
	Question,
	SearchHistory,
	Subject,
} from './schema';
import {
	buddyRequests,
	calendarEvents,
	contentFlags,
	notifications,
	options,
	pastPapers,
	questions,
	searchHistory,
	studyPlans,
	studySessions,
	subjects,
	userProgress,
} from './schema';

const createSubjectSchema = z.object({
	name: z.string().min(1).max(50),
	description: z.string().max(500).optional(),
	curriculumCode: z.string().min(1).max(20),
	isActive: z.boolean().optional(),
});

const updateSubjectSchema = z.object({
	name: z.string().min(1).max(50).optional(),
	description: z.string().max(500).optional(),
	curriculumCode: z.string().min(1).max(20).optional(),
	isActive: z.boolean().optional(),
});

const createQuestionSchema = z.object({
	subjectId: z.number().int().positive(),
	questionText: z.string().min(1).max(2000),
	imageUrl: z.string().url().max(500).optional().nullable(),
	gradeLevel: z.number().int().min(1).max(12),
	topic: z.string().min(1).max(100),
	difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
	marks: z.number().int().min(1).max(100).optional(),
	hint: z.string().max(500).optional().nullable(),
});

const createOptionSchema = z.object({
	optionText: z.string().min(1).max(1000),
	isCorrect: z.boolean(),
	optionLetter: z.string().length(1),
	explanation: z.string().max(1000).optional().nullable(),
});

const querySchema = z.string().min(1).max(500);

/**
 * Ensures the current user has admin privileges
 */
export async function ensureAdmin() {
	const user = await ensureAuthenticated();
	if ((user as SessionUser).role !== 'admin') {
		throw new Error('Unauthorized: Admin access required');
	}
	return user;
}

/**
 * Ensures the current user is authenticated and returns the user object
 */
export async function ensureAuthenticated() {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user) {
		throw new Error('Unauthorized: Authentication required');
	}
	return session.user;
}

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return dbManager.getDb();
}

/**
 * Fetches all notifications for the current user
 */
export async function getNotificationsAction() {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		return await db
			.select()
			.from(notifications)
			.where(eq(notifications.userId, user.id))
			.orderBy(desc(notifications.createdAt))
			.limit(20);
	} catch (error) {
		console.error('Error fetching notifications:', error);
		return [];
	}
}

/**
 * Marks a notification as read
 */
export async function markNotificationAsReadAction(notificationId: string) {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		await db
			.update(notifications)
			.set({ isRead: true, readAt: new Date() })
			.where(and(eq(notifications.id, notificationId), eq(notifications.userId, user.id)));

		return { success: true };
	} catch (error) {
		console.error('Error marking notification as read:', error);
		return { success: false };
	}
}

/**
 * Enrolls a user in a subject by creating an entry in userProgress
 */
export async function enrollInSubjectAction(subjectId: number) {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		// Check if already enrolled
		const existing = await db.query.userProgress.findFirst({
			where: and(eq(userProgress.userId, user.id), eq(userProgress.subjectId, subjectId)),
		});

		if (existing) {
			return { success: true, message: 'Already enrolled' };
		}

		await db.insert(userProgress).values({
			userId: user.id,
			subjectId: subjectId,
			totalQuestionsAttempted: 0,
			totalCorrect: 0,
			totalMarksEarned: 0,
		});

		return { success: true };
	} catch (error) {
		console.error('Error enrolling in subject:', error);
		return { success: false, error: 'Failed to enroll' };
	}
}

/**
 * Adds a new study plan / priority task
 */
export async function createStudyPlanAction(data: { title: string; focusAreas?: string }) {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		const [newPlan] = await db
			.insert(studyPlans)
			.values({
				userId: user.id,
				title: data.title,
				focusAreas: data.focusAreas,
				isActive: true,
			})
			.returning();

		return { success: true, plan: newPlan };
	} catch (error) {
		console.error('Error creating study plan:', error);
		return { success: false, error: 'Failed to create plan' };
	}
}

export async function getStudyPlansAction() {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();
		return await db.select().from(studyPlans).where(eq(studyPlans.userId, user.id));
	} catch (error) {
		console.error('Error fetching study plans:', error);
		return [];
	}
}

/**
 * Adds a calendar event (study block)
 */
export async function createCalendarEventAction(data: {
	title: string;
	startTime: Date;
	endTime: Date;
	subjectId?: number;
	eventType: string;
}) {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		const [newEvent] = await db
			.insert(calendarEvents)
			.values({
				userId: user.id,
				title: data.title,
				startTime: data.startTime,
				endTime: data.endTime,
				subjectId: data.subjectId ?? null,
				eventType: data.eventType,
			})
			.returning();

		return { success: true, event: newEvent };
	} catch (error) {
		console.error('Error creating calendar event:', error);
		return { success: false, error: 'Failed to create event' };
	}
}

export async function getCalendarEventsAction() {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();
		return await db.select().from(calendarEvents).where(eq(calendarEvents.userId, user.id));
	} catch (error) {
		console.error('Error fetching events:', error);
		return [];
	}
}

export async function getCalendarEventsWithSubjectsAction() {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();
		const events = await db
			.select({
				id: calendarEvents.id,
				userId: calendarEvents.userId,
				title: calendarEvents.title,
				description: calendarEvents.description,
				eventType: calendarEvents.eventType,
				subjectId: calendarEvents.subjectId,
				startTime: calendarEvents.startTime,
				endTime: calendarEvents.endTime,
				isAllDay: calendarEvents.isAllDay,
				location: calendarEvents.location,
				reminderMinutes: calendarEvents.reminderMinutes,
				recurrenceRule: calendarEvents.recurrenceRule,
				examId: calendarEvents.examId,
				lessonId: calendarEvents.lessonId,
				studyPlanId: calendarEvents.studyPlanId,
				isCompleted: calendarEvents.isCompleted,
				createdAt: calendarEvents.createdAt,
				updatedAt: calendarEvents.updatedAt,
				subjectName: subjects.name,
			})
			.from(calendarEvents)
			.leftJoin(subjects, eq(calendarEvents.subjectId, subjects.id))
			.where(eq(calendarEvents.userId, user.id));
		return events;
	} catch (error) {
		console.error('Error fetching events with subjects:', error);
		return [];
	}
}

export interface TodayTimelineEvent {
	id: string;
	time: string;
	subject: string;
	title: string;
	duration: string;
	status: 'completed' | 'current' | 'upcoming';
	emoji: string;
	eventType: string | null;
	subjectId: number | null;
	lessonId: number | null;
	examId: string | null;
	studyPlanId: string | null;
	navigationHref: string;
}

export async function getTodayTimelineEventsAction(): Promise<TodayTimelineEvent[]> {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		const today = new Date();
		const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

		const events = await db
			.select({
				id: calendarEvents.id,
				title: calendarEvents.title,
				description: calendarEvents.description,
				eventType: calendarEvents.eventType,
				subjectId: calendarEvents.subjectId,
				startTime: calendarEvents.startTime,
				endTime: calendarEvents.endTime,
				isAllDay: calendarEvents.isAllDay,
				lessonId: calendarEvents.lessonId,
				examId: calendarEvents.examId,
				studyPlanId: calendarEvents.studyPlanId,
				isCompleted: calendarEvents.isCompleted,
				subjectName: subjects.name,
			})
			.from(calendarEvents)
			.leftJoin(subjects, eq(calendarEvents.subjectId, subjects.id))
			.where(
				and(
					eq(calendarEvents.userId, user.id),
					gte(calendarEvents.startTime, startOfDay),
					lt(calendarEvents.startTime, endOfDay)
				)
			)
			.orderBy(asc(calendarEvents.startTime));

		const { SUBJECTS } = await import('@/constants/subjects');

		const now = new Date();
		const currentHour = now.getHours();

		return events.map((event) => {
			const startTime = event.startTime ? new Date(event.startTime) : new Date();
			const endTime = event.endTime
				? new Date(event.endTime)
				: new Date(startTime.getTime() + 45 * 60000);
			const eventHour = startTime.getHours();
			const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

			let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
			if (event.isCompleted) {
				status = 'completed';
			} else if (eventHour < currentHour) {
				status = 'completed';
			} else if (
				eventHour === currentHour ||
				(eventHour === currentHour + 1 && now.getMinutes() > 30)
			) {
				status = 'current';
			}

			const subjectKey = Object.keys(SUBJECTS).find(
				(key) => SUBJECTS[key as keyof typeof SUBJECTS].name === event.subjectName
			);
			const emoji = subjectKey ? SUBJECTS[subjectKey as keyof typeof SUBJECTS].emoji : '📚';

			const subjectId = event.subjectId ? String(event.subjectId) : '';

			let navigationHref = '/planner';
			if (event.eventType === 'study') {
				navigationHref = event.subjectId ? `/focus?subject=${subjectId}` : '/focus';
			} else if (event.eventType === 'practice') {
				navigationHref = `/quiz${event.subjectId ? `?subject=${subjectId}` : ''}`;
			} else if (event.eventType === 'flashcard') {
				navigationHref = `/flashcards${event.subjectId ? `?subject=${subjectId}` : ''}`;
			} else if (event.eventType === 'past-paper') {
				navigationHref = `/past-papers${event.subjectId ? `?subject=${subjectId}` : ''}`;
			} else if (event.eventType === 'ai-tutor') {
				navigationHref = `/ai-tutor${event.subjectId ? `?subject=${subjectId}` : ''}`;
			} else if (event.lessonId) {
				navigationHref = `/lesson/${event.lessonId}`;
			}

			return {
				id: String(event.id),
				time: startTime.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }),
				subject: event.subjectName || event.eventType || 'General',
				title: event.title,
				duration: `${durationMinutes} min`,
				status,
				emoji,
				eventType: event.eventType,
				subjectId: event.subjectId,
				lessonId: event.lessonId,
				examId: event.examId,
				studyPlanId: event.studyPlanId,
				navigationHref,
			};
		});
	} catch (error) {
		console.error('Error fetching today timeline events:', error);
		return [];
	}
}

export async function deleteCalendarEventAction(eventId: string) {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();
		await db
			.delete(calendarEvents)
			.where(and(eq(calendarEvents.id, eventId), eq(calendarEvents.userId, user.id)));
		return { success: true };
	} catch (error) {
		console.error('Error deleting calendar event:', error);
		return { success: false, error: 'Failed to delete event' };
	}
}

export async function updateCalendarEventAction(
	eventId: string,
	data: {
		title?: string;
		startTime?: Date;
		endTime?: Date;
		eventType?: string;
		subjectId?: number;
	}
) {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();
		const updateData: Record<string, unknown> = {};
		if (data.title !== undefined) updateData.title = data.title;
		if (data.startTime !== undefined) updateData.startTime = data.startTime;
		if (data.endTime !== undefined) updateData.endTime = data.endTime;
		if (data.eventType !== undefined) updateData.eventType = data.eventType;
		if (data.subjectId !== undefined) updateData.subjectId = data.subjectId ?? null;

		const [updated] = await db
			.update(calendarEvents)
			.set(updateData)
			.where(and(eq(calendarEvents.id, eventId), eq(calendarEvents.userId, user.id)))
			.returning();
		return { success: true, event: updated };
	} catch (error) {
		console.error('Error updating calendar event:', error);
		return { success: false, error: 'Failed to update event' };
	}
}

export async function getRecentActivityAction() {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		return await db
			.select({
				id: studySessions.id,
				sessionType: studySessions.sessionType,
				marksEarned: studySessions.marksEarned,
				completedAt: studySessions.completedAt,
				subjectName: subjects.name,
			})
			.from(studySessions)
			.leftJoin(subjects, eq(studySessions.subjectId, subjects.id))
			.where(and(eq(studySessions.userId, user.id), isNotNull(studySessions.completedAt)))
			.orderBy(desc(studySessions.completedAt))
			.limit(5);
	} catch (error) {
		console.error('Error fetching recent activity:', error);
		return [];
	}
}

export interface RecentSessionWithContext {
	id: string;
	sessionType: string;
	subjectId: number | null;
	subjectName: string | null;
	subjectEmoji: string | null;
	topic: string | null;
	durationMinutes: number | null;
	questionsAttempted: number;
	correctAnswers: number;
	marksEarned: number;
	completedAt: Date | null;
	conversationId?: string;
}

export async function getRecentSessionsWithContextAction(): Promise<RecentSessionWithContext[]> {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		const sessions = await db
			.select({
				id: studySessions.id,
				sessionType: studySessions.sessionType,
				subjectId: studySessions.subjectId,
				subjectName: subjects.name,
				topic: studySessions.topic,
				durationMinutes: studySessions.durationMinutes,
				questionsAttempted: studySessions.questionsAttempted,
				correctAnswers: studySessions.correctAnswers,
				marksEarned: studySessions.marksEarned,
				completedAt: studySessions.completedAt,
			})
			.from(studySessions)
			.leftJoin(subjects, eq(studySessions.subjectId, subjects.id))
			.where(and(eq(studySessions.userId, user.id), isNotNull(studySessions.completedAt)))
			.orderBy(desc(studySessions.completedAt))
			.limit(10);

		const { SUBJECTS } = await import('@/constants/subjects');

		return sessions.map((s) => {
			const subjectKey = Object.keys(SUBJECTS).find(
				(key) => SUBJECTS[key as keyof typeof SUBJECTS].name === s.subjectName
			);
			return {
				...s,
				subjectEmoji: subjectKey ? SUBJECTS[subjectKey as keyof typeof SUBJECTS].emoji : null,
			};
		});
	} catch (error) {
		console.error('Error fetching recent sessions with context:', error);
		return [];
	}
}

export async function getEnrolledSubjectsAction() {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		const enrolled = await db
			.select({
				id: subjects.id,
				name: subjects.name,
				description: subjects.description,
			})
			.from(userProgress)
			.innerJoin(subjects, eq(userProgress.subjectId, subjects.id))
			.where(eq(userProgress.userId, user.id));

		return enrolled;
	} catch (error) {
		console.error('Error fetching enrolled subjects:', error);
		return [];
	}
}

const mockSubjects: Subject[] = [
	{
		id: 1,
		name: 'Mathematics',
		description: 'Core mathematics curriculum',
		curriculumCode: 'MAT',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: 2,
		name: 'Physical Sciences',
		description: 'Physics and Chemistry',
		curriculumCode: 'PHY',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: 3,
		name: 'Life Sciences',
		description: 'Biology and related sciences',
		curriculumCode: 'BIO',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: 4,
		name: 'English',
		description: 'First Additional Language',
		curriculumCode: 'ENG',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: 5,
		name: 'Geography',
		description: 'Earth science and social studies',
		curriculumCode: 'GEO',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

const mockQuestions: Question[] = [
	{
		id: '1',
		subjectId: 1,
		questionText: 'Solve for x: 2x + 5 = 15',
		imageUrl: null,
		gradeLevel: 12,
		topic: 'Algebra',
		difficulty: 'easy',
		marks: 2,
		hint: 'Subtract 5 from both sides',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '2',
		subjectId: 1,
		questionText: 'Find the derivative of f(x) = x² + 3x + 2',
		imageUrl: null,
		gradeLevel: 12,
		topic: 'Calculus',
		difficulty: 'medium',
		marks: 3,
		hint: 'Use the power rule',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

const mockOptions: Option[] = [
	{
		id: '1a',
		questionId: '1',
		optionText: 'x = 5',
		isCorrect: true,
		optionLetter: 'A',
		explanation: 'Correct!',
		isActive: true,
		createdAt: new Date(),
	},
	{
		id: '1b',
		questionId: '1',
		optionText: 'x = 10',
		isCorrect: false,
		optionLetter: 'B',
		explanation: 'Incorrect',
		isActive: true,
		createdAt: new Date(),
	},
	{
		id: '2a',
		questionId: '2',
		optionText: "f'(x) = 2x + 3",
		isCorrect: true,
		optionLetter: 'A',
		explanation: 'Correct!',
		isActive: true,
		createdAt: new Date(),
	},
	{
		id: '2b',
		questionId: '2',
		optionText: "f'(x) = x + 3",
		isCorrect: false,
		optionLetter: 'B',
		explanation: 'Incorrect',
		isActive: true,
		createdAt: new Date(),
	},
];

export async function createSubjectAction(data: NewSubject): Promise<Subject> {
	await ensureAdmin();
	const validated = createSubjectSchema.parse(data);
	const db = await getDb();
	const [subject] = await db
		.insert(subjects)
		.values(validated as NewSubject)
		.returning();
	return subject;
}

export async function getSubjectsAction(): Promise<Subject[]> {
	try {
		const db = await getDb();
		return db
			.select()
			.from(subjects)
			.where(eq(subjects.isActive, true))
			.orderBy(asc(subjects.name));
	} catch {
		return mockSubjects;
	}
}

export async function getSubjectByIdAction(id: number): Promise<Subject | null> {
	try {
		const db = await getDb();
		const [subject] = await db
			.select()
			.from(subjects)
			.where(and(eq(subjects.id, id), eq(subjects.isActive, true)))
			.limit(1);
		return subject ?? null;
	} catch {
		return mockSubjects.find((s) => s.id === id) ?? null;
	}
}

export async function updateSubjectAction(
	id: number,
	data: Partial<NewSubject>
): Promise<Subject | null> {
	await ensureAdmin();
	// Validate input data
	const validatedData = updateSubjectSchema.parse(data);

	// If no valid fields to update, return null
	if (Object.keys(validatedData).length === 0) {
		console.warn('⚠️ updateSubjectAction: No valid fields to update');
		return null;
	}

	const db = await getDb();
	const [subject] = await db
		.update(subjects)
		.set({ ...validatedData, updatedAt: new Date() })
		.where(eq(subjects.id, id))
		.returning();
	return subject ?? null;
}

export async function softDeleteSubjectAction(id: number): Promise<boolean> {
	await ensureAdmin();
	const db = await getDb();
	const result = await db
		.update(subjects)
		.set({ isActive: false, updatedAt: new Date() })
		.where(eq(subjects.id, id))
		.returning();
	return result.length > 0;
}

export async function hardDeleteSubjectAction(id: number): Promise<boolean> {
	await ensureAdmin();
	const db = await getDb();
	const result = await db.delete(subjects).where(eq(subjects.id, id)).returning();
	return result.length > 0;
}

export interface QuestionFilters {
	subjectId?: number;
	difficulty?: 'easy' | 'medium' | 'hard';
	gradeLevel?: number;
	topic?: string;
	isActive?: boolean;
}

export async function createQuestionAction(
	questionData: NewQuestion,
	optionsData: Omit<NewOption, 'questionId'>[]
): Promise<Question & { options: Option[] }> {
	await ensureAdmin();
	const validatedQuestion = createQuestionSchema.parse(questionData);
	const validatedOptions = z.array(createOptionSchema).min(2).parse(optionsData);
	const db = await getDb();

	return db.transaction(async (tx) => {
		const [question] = await tx
			.insert(questions)
			.values(validatedQuestion as NewQuestion)
			.returning();
		const insertedOptions = await Promise.all(
			validatedOptions.map((opt) =>
				tx
					.insert(options)
					.values({ ...opt, questionId: question.id } as NewOption)
					.returning()
			)
		);
		return { ...question, options: insertedOptions.flat() };
	});
}

export async function getQuestionsAction(filters: QuestionFilters = {}): Promise<Question[]> {
	try {
		const db = await getDb();
		const conditions = [];

		if (filters.subjectId !== undefined)
			conditions.push(eq(questions.subjectId, filters.subjectId));
		if (filters.difficulty !== undefined)
			conditions.push(eq(questions.difficulty, filters.difficulty));
		if (filters.gradeLevel !== undefined)
			conditions.push(eq(questions.gradeLevel, filters.gradeLevel));
		if (filters.topic !== undefined) conditions.push(eq(questions.topic, filters.topic));
		conditions.push(eq(questions.isActive, filters.isActive ?? true));

		return db
			.select()
			.from(questions)
			.where(and(...conditions))
			.orderBy(desc(questions.createdAt));
	} catch {
		return [];
	}
}

export async function getQuestionWithOptionsAction(
	id: string
): Promise<(Question & { options: Option[] }) | null> {
	try {
		const db = await getDb();
		const [question] = await db
			.select()
			.from(questions)
			.where(and(eq(questions.id, id), eq(questions.isActive, true)))
			.limit(1);

		if (!question) return null;

		const opts = await db
			.select()
			.from(options)
			.where(and(eq(options.questionId, id), eq(options.isActive, true)))
			.orderBy(asc(options.optionLetter));

		return { ...question, options: opts };
	} catch {
		const mockQuestion = mockQuestions.find((q) => q.id === id);
		if (!mockQuestion) return null;
		return { ...mockQuestion, options: mockOptions.filter((o) => o.questionId === id) };
	}
}

export async function getRandomQuestionsAction(
	subjectId: number,
	count: number,
	difficulty?: 'easy' | 'medium' | 'hard'
): Promise<Question[]> {
	try {
		const db = await getDb();
		const conditions = [eq(questions.subjectId, subjectId), eq(questions.isActive, true)];
		if (difficulty) conditions.push(eq(questions.difficulty, difficulty));

		return db
			.select()
			.from(questions)
			.where(and(...conditions))
			.orderBy(sql`random()`)
			.limit(count);
	} catch {
		let filtered = mockQuestions.filter((q) => q.subjectId === subjectId);
		if (difficulty) filtered = filtered.filter((q) => q.difficulty === difficulty);
		return filtered.slice(0, count);
	}
}

export async function getRandomQuestionsFromMultipleSubjectsAction(
	subjectIds: number[],
	count: number,
	difficulty?: 'easy' | 'medium' | 'hard'
): Promise<Question[]> {
	try {
		const db = await getDb();
		const conditions = [eq(questions.isActive, true)];
		if (subjectIds.length > 0) {
			conditions.push(inArray(questions.subjectId, subjectIds));
		}
		if (difficulty) conditions.push(eq(questions.difficulty, difficulty));

		return db
			.select()
			.from(questions)
			.where(and(...conditions))
			.orderBy(sql`random()`)
			.limit(count);
	} catch {
		let filtered = mockQuestions.filter((q) => subjectIds.includes(q.subjectId));
		if (difficulty) filtered = filtered.filter((q) => q.difficulty === difficulty);
		return filtered.slice(0, count);
	}
}

export async function updateQuestionAction(
	id: string,
	data: Partial<NewQuestion>
): Promise<Question | null> {
	await ensureAdmin();
	const db = await getDb();
	const [question] = await db
		.update(questions)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(questions.id, id))
		.returning();
	return question ?? null;
}

export async function softDeleteQuestionAction(id: string): Promise<boolean> {
	await ensureAdmin();
	const db = await getDb();
	await db.transaction(async (tx) => {
		await tx
			.update(questions)
			.set({ isActive: false, updatedAt: new Date() })
			.where(eq(questions.id, id));
		await tx.update(options).set({ isActive: false }).where(eq(options.questionId, id));
	});
	return true;
}

export async function hardDeleteQuestionAction(id: string): Promise<boolean> {
	await ensureAdmin();
	const db = await getDb();
	const result = await db.delete(questions).where(eq(questions.id, id)).returning();
	return result.length > 0;
}

export async function getOptionsByQuestionIdAction(questionId: string): Promise<Option[]> {
	try {
		const db = await getDb();
		return db
			.select()
			.from(options)
			.where(and(eq(options.questionId, questionId), eq(options.isActive, true)))
			.orderBy(asc(options.optionLetter));
	} catch {
		return mockOptions.filter((o) => o.questionId === questionId);
	}
}

export async function addSearchHistoryAction(query: string): Promise<SearchHistory> {
	const user = await ensureAuthenticated();
	const validUserId = user.id;
	const validQuery = querySchema.parse(query);
	const db = await getDb();

	const existing = await db
		.select()
		.from(searchHistory)
		.where(and(eq(searchHistory.userId, validUserId), eq(searchHistory.query, validQuery)))
		.limit(1);

	if (existing.length > 0) {
		await db
			.delete(searchHistory)
			.where(and(eq(searchHistory.userId, validUserId), eq(searchHistory.query, validQuery)));
	}

	const [newSearch] = await db
		.insert(searchHistory)
		.values({ userId: validUserId, query: validQuery })
		.returning();

	const allSearches = await db
		.select()
		.from(searchHistory)
		.where(eq(searchHistory.userId, validUserId))
		.orderBy(desc(searchHistory.createdAt));

	if (allSearches.length > 5) {
		await Promise.all(
			allSearches
				.slice(5)
				.map((search) => db.delete(searchHistory).where(eq(searchHistory.id, search.id)))
		);
	}

	return newSearch;
}

export async function getSearchHistoryAction(): Promise<SearchHistory[]> {
	const user = await ensureAuthenticated();
	try {
		const db = await getDb();
		return db
			.select()
			.from(searchHistory)
			.where(eq(searchHistory.userId, user.id))
			.orderBy(desc(searchHistory.createdAt))
			.limit(5);
	} catch {
		return [];
	}
}

export async function deleteSearchHistoryItemAction(id: string): Promise<boolean> {
	const user = await ensureAuthenticated();
	const db = await getDb();
	const result = await db
		.delete(searchHistory)
		.where(and(eq(searchHistory.id, id), eq(searchHistory.userId, user.id)))
		.returning();
	return result.length > 0;
}

export async function clearSearchHistoryAction(): Promise<boolean> {
	const user = await ensureAuthenticated();
	const db = await getDb();
	const result = await db
		.delete(searchHistory)
		.where(eq(searchHistory.userId, user.id))
		.returning();
	return result.length > 0;
}

export async function seedDatabaseAction(): Promise<{ success: boolean; message: string }> {
	await ensureAdmin();
	try {
		const { seedDatabase } = await import('./seed/index');
		await seedDatabase();
		return { success: true, message: 'Database seeded successfully!' };
	} catch (error) {
		console.error('Seed action error:', error);
		return { success: false, message: error instanceof Error ? error.message : 'Seeding failed' };
	}
}

// ============================================================================
// USER MANAGEMENT ACTIONS
// ============================================================================

const updateUserSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	email: z.string().email().max(100).optional(),
	role: z.enum(['admin', 'moderator', 'user']).optional(),
});

export interface UserFilters {
	search?: string;
	filter?: 'all' | 'active' | 'blocked' | 'deleted';
}

export async function getUsersAction(filters: UserFilters = {}): Promise<User[]> {
	await ensureAdmin();
	try {
		const db = await getDb();

		// Build conditions based on filter type
		const conditions = [];

		if (filters.filter === 'active') {
			conditions.push(isNull(users.deletedAt));
			conditions.push(eq(users.isBlocked, false));
		} else if (filters.filter === 'blocked') {
			conditions.push(eq(users.isBlocked, true));
		} else if (filters.filter === 'deleted') {
			conditions.push(isNotNull(users.deletedAt));
		}

		let usersList: User[];
		if (conditions.length > 0) {
			usersList = await db
				.select()
				.from(users)
				.where(and(...conditions))
				.orderBy(desc(users.createdAt));
		} else {
			usersList = await db.select().from(users).orderBy(desc(users.createdAt));
		}

		// Client-side search for name/email
		if (filters.search?.trim()) {
			const searchLower = filters.search.toLowerCase();
			return usersList.filter(
				(u) =>
					u.name.toLowerCase().includes(searchLower) || u.email.toLowerCase().includes(searchLower)
			);
		}

		return usersList;
	} catch {
		return [];
	}
}

export async function updateUserAction(
	id: string,
	data: {
		name?: string;
		email?: string;
		role?: 'admin' | 'moderator' | 'user';
		school?: string;
		avatarId?: string;
	}
): Promise<User | null> {
	await ensureAdmin();
	const validatedData = updateUserSchema.parse(data);

	if (Object.keys(validatedData).length === 0) {
		console.warn('⚠️ updateUserAction: No valid fields to update');
		return null;
	}

	const db = await getDb();
	const [user] = await db
		.update(users)
		.set({ ...validatedData, updatedAt: new Date() })
		.where(eq(users.id, id))
		.returning();
	return user ?? null;
}

/**
 * Updates current user's profile
 */
export async function updateUserProfileAction(data: {
	name?: string;
	school?: string;
	avatarId?: string;
}) {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		const [updated] = await db
			.update(users)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(eq(users.id, user.id))
			.returning();

		return { success: true, user: updated };
	} catch (error) {
		console.error('Error updating profile:', error);
		return { success: false, error: 'Failed to update profile' };
	}
}

export async function toggleUserBlockAction(
	id: string
): Promise<{ success: boolean; isBlocked: boolean; user?: User }> {
	await ensureAdmin();
	const db = await getDb();

	// Get current user state
	const [currentUser] = await db.select().from(users).where(eq(users.id, id)).limit(1);

	if (!currentUser) {
		return { success: false, isBlocked: false };
	}

	const newBlockedState = !currentUser.isBlocked;

	const [updatedUser] = await db
		.update(users)
		.set({ isBlocked: newBlockedState, updatedAt: new Date() })
		.where(eq(users.id, id))
		.returning();

	return {
		success: !!updatedUser,
		isBlocked: newBlockedState,
		user: updatedUser,
	};
}

export async function deleteUserAction(id: string): Promise<{ success: boolean; user?: User }> {
	await ensureAdmin();
	const db = await getDb();
	const [user] = await db
		.update(users)
		.set({ deletedAt: new Date(), updatedAt: new Date() })
		.where(eq(users.id, id))
		.returning();
	return { success: !!user, user: user ?? undefined };
}

export async function restoreUserAction(id: string): Promise<{ success: boolean; user?: User }> {
	await ensureAdmin();
	const db = await getDb();
	const [user] = await db
		.update(users)
		.set({ deletedAt: null, updatedAt: new Date() })
		.where(eq(users.id, id))
		.returning();
	return { success: !!user, user: user ?? undefined };
}

// ============================================================================
// PAST PAPERS MANAGEMENT ACTIONS
// ============================================================================

const createPastPaperSchema = z.object({
	paperId: z.string().min(1).max(100),
	originalPdfUrl: z.string().url().max(500),
	subject: z.string().min(1).max(100),
	paper: z.string().min(1).max(20),
	year: z.number().int().min(2000).max(2030),
	month: z.string().min(1).max(20),
	totalMarks: z.number().int().min(1).max(1000).optional(),
	instructions: z.string().max(2000).optional(),
	summary: z.string().max(1000).optional(),
});

const updatePastPaperSchema = z.object({
	originalPdfUrl: z.string().url().max(500).optional(),
	storedPdfUrl: z.string().url().max(500).optional(),
	markdownFileUrl: z.string().url().max(500).optional(),
	subject: z.string().min(1).max(100).optional(),
	paper: z.string().min(1).max(20).optional(),
	year: z.number().int().min(2000).max(2030).optional(),
	month: z.string().min(1).max(20).optional(),
	isExtracted: z.boolean().optional(),
	extractedQuestions: z.string().max(10000).optional(),
	instructions: z.string().max(2000).optional(),
	summary: z.string().max(1000).optional(),
	totalMarks: z.number().int().min(1).max(1000).optional(),
});

export interface PastPaperFilters {
	subject?: string;
	year?: number;
	isExtracted?: boolean;
}

export async function createPastPaperAction(
	data: z.infer<typeof createPastPaperSchema>
): Promise<PastPaper> {
	await ensureAdmin();
	const validated = createPastPaperSchema.parse(data);
	const db = await getDb();
	const [pastPaper] = await db
		.insert(pastPapers)
		.values(validated as NewPastPaper)
		.returning();
	return pastPaper;
}

export async function getPastPapersAction(filters: PastPaperFilters = {}): Promise<PastPaper[]> {
	try {
		const db = await getDb();
		const conditions = [
			// Only show papers that have a stored PDF
			isNotNull(pastPapers.storedPdfUrl),
		];

		if (filters.subject !== undefined) {
			conditions.push(eq(pastPapers.subject, filters.subject));
		}
		if (filters.year !== undefined) {
			conditions.push(eq(pastPapers.year, filters.year));
		}
		if (filters.isExtracted !== undefined) {
			conditions.push(eq(pastPapers.isExtracted, filters.isExtracted));
		}

		return db
			.select()
			.from(pastPapers)
			.where(and(...conditions))
			.orderBy(desc(pastPapers.year), asc(pastPapers.month), asc(pastPapers.paper));
	} catch (error) {
		console.error('[DB] Error in getPastPapersAction:', error);
		return [];
	}
}

export async function getPastPaperByIdAction(id: string): Promise<PastPaper | null> {
	try {
		const db = await getDb();
		const [pastPaper] = await db.select().from(pastPapers).where(eq(pastPapers.id, id)).limit(1);
		return pastPaper ?? null;
	} catch {
		return null;
	}
}

export async function getPastPaperByPaperIdAction(paperId: string): Promise<PastPaper | null> {
	try {
		const db = await getDb();
		const [pastPaper] = await db
			.select()
			.from(pastPapers)
			.where(eq(pastPapers.paperId, paperId))
			.limit(1);
		return pastPaper ?? null;
	} catch {
		return null;
	}
}

export async function updatePastPaperAction(
	id: string,
	data: z.infer<typeof updatePastPaperSchema>
): Promise<PastPaper | null> {
	await ensureAdmin();
	const validatedData = updatePastPaperSchema.parse(data);

	if (Object.keys(validatedData).length === 0) {
		console.warn('⚠️ updatePastPaperAction: No valid fields to update');
		return null;
	}

	const db = await getDb();
	const [pastPaper] = await db
		.update(pastPapers)
		.set({ ...validatedData, updatedAt: new Date() })
		.where(eq(pastPapers.id, id))
		.returning();
	return pastPaper ?? null;
}

export async function deletePastPaperAction(id: string): Promise<boolean> {
	await ensureAdmin();
	const db = await getDb();
	const result = await db.delete(pastPapers).where(eq(pastPapers.id, id)).returning();
	return result.length > 0;
}

/**
 * Bulk save questions and options from an extracted paper
 */
export async function saveProcessedExtractedPaperAction(
	paperData: NewPastPaper,
	questionsList: {
		questionText: string;
		marks: number;
		topic: string;
		difficulty: 'easy' | 'medium' | 'hard';
		gradeLevel: number;
		subjectId: number;
		options: {
			letter: string;
			text: string;
			isCorrect: boolean;
			explanation?: string;
		}[];
	}[]
) {
	await ensureAdmin();
	const db = await getDb();

	try {
		// Validate input data
		if (!paperData.paperId || !paperData.subject) {
			throw new Error('Invalid paper data: missing paperId or subject');
		}

		if (!Array.isArray(questionsList)) {
			throw new Error('Invalid questions data: must be an array');
		}

		return await db.transaction(async (tx) => {
			// 1. Save/Update Past Paper with validation
			const [paper] = await tx
				.insert(pastPapers)
				.values({
					...paperData,
					updatedAt: new Date(),
				})
				.onConflictDoUpdate({
					target: pastPapers.paperId,
					set: {
						...paperData,
						updatedAt: new Date(),
					},
				})
				.returning();

			if (!paper) {
				throw new Error('Failed to save paper record');
			}

			// 2. Save Questions and Options
			if (questionsList.length > 0) {
				console.log(`[DB] Saving ${questionsList.length} questions for paper ${paper.paperId}`);

				for (const [index, q] of questionsList.entries()) {
					try {
						// Validate question data
						if (!q.questionText || !q.subjectId) {
							console.warn(`[DB] Skipping invalid question ${index}: missing text or subject`);
							continue;
						}

						// Check if question already exists (case-insensitive)
						const [existingQuestion] = await tx
							.select()
							.from(questions)
							.where(
								and(
									eq(questions.subjectId, q.subjectId),
									sql`LOWER(${questions.questionText}) = LOWER(${q.questionText})`
								)
							)
							.limit(1);

						if (existingQuestion) {
							// Update existing question
							const [updatedQuestion] = await tx
								.update(questions)
								.set({
									gradeLevel: q.gradeLevel || existingQuestion.gradeLevel,
									topic: q.topic || existingQuestion.topic,
									difficulty: q.difficulty || existingQuestion.difficulty,
									marks: q.marks || existingQuestion.marks,
									updatedAt: new Date(),
								})
								.where(eq(questions.id, existingQuestion.id))
								.returning();

							// Refresh options: Delete and re-insert to ensure accuracy
							await tx.delete(options).where(eq(options.questionId, updatedQuestion.id));

							if (q.options && q.options.length > 0) {
								const optionValues = q.options.map((opt) => ({
									questionId: updatedQuestion.id,
									optionText: opt.text || '',
									optionLetter: opt.letter || '',
									isCorrect: opt.isCorrect || false,
									explanation: opt.explanation || null,
								}));

								await tx.insert(options).values(optionValues);
							}

							console.log(`[DB] Updated existing question: ${updatedQuestion.id}`);
						} else {
							// Insert new question
							const [newQuestion] = await tx
								.insert(questions)
								.values({
									subjectId: q.subjectId,
									questionText: q.questionText,
									gradeLevel: q.gradeLevel || 12,
									topic: q.topic || 'General',
									difficulty: q.difficulty || 'medium',
									marks: q.marks || 1,
								})
								.returning();

							if (q.options && q.options.length > 0) {
								const optionValues = q.options.map((opt) => ({
									questionId: newQuestion.id,
									optionText: opt.text || '',
									optionLetter: opt.letter || '',
									isCorrect: opt.isCorrect || false,
									explanation: opt.explanation || null,
								}));

								await tx.insert(options).values(optionValues);
							}

							console.log(`[DB] Created new question: ${newQuestion.id}`);
						}
					} catch (questionError) {
						console.error(`[DB] Error processing question ${index}:`, questionError);
					}
				}
			}

			console.log(
				`[DB] Successfully saved paper ${paper.paperId} with ${questionsList.length} questions`
			);
			return paper;
		});
	} catch (error) {
		console.error('[DB] Error in saveProcessedExtractedPaperAction:', error);
		throw error;
	}
}

/**
 * Save extracted questions to a past paper
 */
export async function saveExtractedQuestionsAction(
	paperId: string,
	extractedQuestions: string,
	markdownFileUrl?: string
): Promise<PastPaper | null> {
	await ensureAdmin();
	const db = await getDb();

	// Try to find by paperId first, then by id
	let [paper] = await db.select().from(pastPapers).where(eq(pastPapers.paperId, paperId)).limit(1);

	if (!paper) {
		[paper] = await db.select().from(pastPapers).where(eq(pastPapers.id, paperId)).limit(1);
	}

	if (!paper) {
		console.warn('⚠️ saveExtractedQuestionsAction: Past paper not found:', paperId);
		return null;
	}

	const updateData: {
		extractedQuestions: string;
		isExtracted: boolean;
		updatedAt: Date;
		markdownFileUrl?: string;
	} = {
		extractedQuestions,
		isExtracted: true,
		updatedAt: new Date(),
	};

	if (markdownFileUrl) {
		updateData.markdownFileUrl = markdownFileUrl;
	}

	const [updatedPaper] = await db
		.update(pastPapers)
		.set(updateData)
		.where(eq(pastPapers.id, paper.id))
		.returning();

	return updatedPaper ?? null;
}

/**
 * Get extracted questions for a past paper
 */
export async function getExtractedQuestionsAction(paperId: string): Promise<string | null> {
	await ensureAdmin();
	const db = await getDb();

	let [paper] = await db.select().from(pastPapers).where(eq(pastPapers.paperId, paperId)).limit(1);

	if (!paper) {
		[paper] = await db.select().from(pastPapers).where(eq(pastPapers.id, paperId)).limit(1);
	}

	if (!paper) {
		return null;
	}

	return paper.extractedQuestions || null;
}

// ============================================================================
// CONTENT FLAGS / MODERATION ACTIONS
// ============================================================================

/**
 * Create a new content flag
 */
export async function createContentFlagAction(
	_reporterId: string,
	contentType: string,
	contentId: string,
	flagReason: string,
	contentPreview?: string,
	flagDetails?: string
): Promise<ContentFlag> {
	const user = await ensureAuthenticated();
	const db = await getDb();
	const [flag] = await db
		.insert(contentFlags)
		.values({
			reporterId: user.id,
			contentType,
			contentId,
			flagReason,
			contentPreview,
			flagDetails,
			status: 'pending',
		})
		.returning();
	return flag;
}

/**
 * Get all content flags (for admin)
 */
export async function getContentFlagsAction(
	status?: 'pending' | 'reviewed' | 'actioned' | 'dismissed'
): Promise<ContentFlag[]> {
	await ensureAdmin();
	const db = await getDb();
	if (status) {
		return db
			.select()
			.from(contentFlags)
			.where(eq(contentFlags.status, status))
			.orderBy(desc(contentFlags.createdAt));
	}
	return db.select().from(contentFlags).orderBy(desc(contentFlags.createdAt));
}

/**
 * Dismiss a flagged content
 */
export async function dismissFlagAction(
	flagId: string,
	_reviewerId: string
): Promise<{ success: boolean }> {
	const user = await ensureAdmin();
	const db = await getDb();
	const result = await db
		.update(contentFlags)
		.set({
			status: 'dismissed',
			reviewedBy: user.id,
			reviewedAt: new Date(),
		})
		.where(eq(contentFlags.id, flagId))
		.returning();
	return { success: result.length > 0 };
}

/**
 * Take action on flagged content (remove/approve)
 */
export async function actionFlagAction(
	flagId: string,
	_reviewerId: string
): Promise<{ success: boolean }> {
	const user = await ensureAdmin();
	const db = await getDb();
	const result = await db
		.update(contentFlags)
		.set({
			status: 'actioned',
			reviewedBy: user.id,
			reviewedAt: new Date(),
		})
		.where(eq(contentFlags.id, flagId))
		.returning();
	return { success: result.length > 0 };
}

// ============================================================================
// STUDY BUDDIES ACTIONS
// ============================================================================

/**
 * Send a buddy request
 */
export async function sendBuddyRequestAction(
	_fromUserId: string,
	toUserId: string,
	message?: string
): Promise<{ success: boolean; error?: string; requestId?: string }> {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();
		const [request] = await db
			.insert(buddyRequests)
			.values({
				fromUserId: user.id,
				toUserId,
				message,
				status: 'pending',
			})
			.returning();

		console.log(`[Buddy Request] ${user.id} -> ${toUserId}: ${message || 'No message'}`);
		return { success: true, requestId: request.id };
	} catch (error) {
		console.error('[Buddy Request] Error:', error);
		return { success: false, error: 'Failed to send buddy request' };
	}
}

/**
 * Get buddy requests for a user
 */
export async function getBuddyRequestsAction(_userId: string): Promise<BuddyRequest[]> {
	const user = await ensureAuthenticated();
	const db = await getDb();
	return db
		.select()
		.from(buddyRequests)
		.where(eq(buddyRequests.toUserId, user.id))
		.orderBy(desc(buddyRequests.createdAt));
}

/**
 * Accept a buddy request
 */
export async function acceptBuddyRequestAction(
	requestId: string,
	_userId: string
): Promise<{ success: boolean }> {
	const user = await ensureAuthenticated();
	const db = await getDb();
	const result = await db
		.update(buddyRequests)
		.set({
			status: 'accepted',
			respondedAt: new Date(),
		})
		.where(and(eq(buddyRequests.id, requestId), eq(buddyRequests.toUserId, user.id)))
		.returning();
	return { success: result.length > 0 };
}

/**
 * Reject a buddy request
 */
export async function rejectBuddyRequestAction(
	requestId: string,
	_userId: string
): Promise<{ success: boolean }> {
	const user = await ensureAuthenticated();
	const db = await getDb();
	const result = await db
		.update(buddyRequests)
		.set({
			status: 'rejected',
			respondedAt: new Date(),
		})
		.where(and(eq(buddyRequests.id, requestId), eq(buddyRequests.toUserId, user.id)))
		.returning();
	return { success: result.length > 0 };
}

// ============================================================================
// ADMIN STATS ACTIONS
// ============================================================================

export interface AdminStats {
	totalUsers: number;
	activeUsers: number;
	questionsAttempted: number;
	averageScore: number;
	questionsCount: number;
	subjectsCount: number;
}

export async function getAdminStatsAction(): Promise<AdminStats> {
	await ensureAdmin();
	try {
		const db = await getDb();

		const [totalUsersResult] = await db.select({ count: sql`count(*)` }).from(users);
		const [subjectsResult] = await db.select({ count: sql`count(*)` }).from(subjects);
		const [questionsResult] = await db.select({ count: sql`count(*)` }).from(questions);

		// Active users in last 7 days (based on user_progress lastActivityAt)
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		const [activeUsersResult] = await db
			.select({ count: sql`count(DISTINCT ${userProgress.userId})` })
			.from(userProgress)
			.where(sql`${userProgress.lastActivityAt} > ${sevenDaysAgo}`);

		// Get total questions attempted and correct answers from studySessions
		const [sessionStats] = await db
			.select({
				totalAttempted: sql<number>`coalesce(sum(${studySessions.questionsAttempted}), 0)`,
				totalCorrect: sql<number>`coalesce(sum(${studySessions.correctAnswers}), 0)`,
			})
			.from(studySessions);

		const questionsAttempted = Number(sessionStats?.totalAttempted || 0);
		const totalCorrect = Number(sessionStats?.totalCorrect || 0);
		const averageScore =
			questionsAttempted > 0 ? Math.round((totalCorrect / questionsAttempted) * 100) : 0;

		return {
			totalUsers: Number(totalUsersResult?.count || 0),
			activeUsers: Number(activeUsersResult?.count || 0),
			questionsAttempted: questionsAttempted,
			averageScore: averageScore,
			questionsCount: Number(questionsResult?.count || 0),
			subjectsCount: Number(subjectsResult?.count || 0),
		};
	} catch (error) {
		console.error('Error getting admin stats:', error);
		return {
			totalUsers: 0,
			activeUsers: 0,
			questionsAttempted: 0,
			averageScore: 0,
			questionsCount: 0,
			subjectsCount: 0,
		};
	}
}

export interface SubjectPerformance {
	subjectId: number;
	subjectName: string;
	questionsAttempted: number;
	averageScore: number;
}

export async function getSubjectPerformanceAction(): Promise<SubjectPerformance[]> {
	await ensureAdmin();
	try {
		const db = await getDb();

		// Get subject performance from userProgress aggregated data
		const results = await db
			.select({
				subjectId: userProgress.subjectId,
				subjectName: subjects.name,
				totalAttempted: sql<number>`coalesce(sum(${userProgress.totalQuestionsAttempted}), 0)`,
				totalCorrect: sql<number>`coalesce(sum(${userProgress.totalCorrect}), 0)`,
			})
			.from(userProgress)
			.innerJoin(subjects, eq(userProgress.subjectId, subjects.id))
			.groupBy(userProgress.subjectId, subjects.name)
			.orderBy(desc(sql`sum(${userProgress.totalQuestionsAttempted})`))
			.limit(10);

		return results.map((r) => {
			const attempted = Number(r.totalAttempted || 0);
			const correct = Number(r.totalCorrect || 0);
			return {
				subjectId: r.subjectId || 0,
				subjectName: r.subjectName || 'Unknown',
				questionsAttempted: attempted,
				averageScore: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
			};
		});
	} catch (error) {
		console.error('Error getting subject performance:', error);
		return [];
	}
}
