/**
 * Exam Session Protection Service
 *
 * Handles session management during exams with:
 * - Extended session timeout during active exams
 * - Auto-save progress every 30 seconds
 * - Warning notifications before timeout
 * - "Resume Exam" flow with recovered state
 * - Exam-specific session configuration
 * - Clear timer warnings to student
 */

import { and, eq, gt, lt } from 'drizzle-orm';
import { boolean, integer, jsonb, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { dbManagerV2 } from '../lib/db/database-manager-v2';
import { logger } from '../lib/logger';

const log = logger.createLogger('ExamSession');

// Configuration
const EXAM_SESSION_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours
const AUTOSAVE_INTERVAL_MS = 30 * 1000; // 30 seconds
const WARNING_BEFORE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_EXTENSION_ON_ACTIVITY_MS = 15 * 60 * 1000; // 15 minutes

// Types
export interface ExamSession {
	id: string;
	userId: string;
	examType: string;
	subjectId: number | null;
	startedAt: Date;
	expiresAt: Date;
	lastActivityAt: Date;
	lastSavedAt: Date | null;
	progress: Record<string, unknown>;
	answers: ExamAnswer[];
	isActive: boolean | null;
	isCompleted: boolean | null;
	completedAt: Date | null;
	createdAt: Date | null;
	updatedAt: Date | null;
}

export interface ExamAnswer {
	questionId: string;
	answer: string | null;
	markedForReview: boolean;
	timeSpentSeconds: number;
	savedAt: Date;
}

export interface ExamSessionState {
	session: ExamSession | null;
	timeRemaining: number;
	isWarning: boolean;
	lastSavedAt: Date | null;
	unsavedChanges: boolean;
}

export interface SessionExtensionResult {
	success: boolean;
	newExpiresAt: Date;
	timeRemaining: number;
}

// Exam sessions table schema
const examSessionsTable = pgTable('exam_sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	examType: varchar('exam_type', { length: 50 }).notNull(),
	subjectId: integer('subject_id'),
	startedAt: timestamp('started_at').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	lastActivityAt: timestamp('last_activity_at').notNull(),
	lastSavedAt: timestamp('last_saved_at'),
	progress: jsonb('progress'),
	answers: jsonb('answers'),
	isActive: boolean('is_active').default(true),
	isCompleted: boolean('is_completed').default(false),
	completedAt: timestamp('completed_at'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

// In-memory state for active sessions
const activeSessions = new Map<string, ExamSessionState>();
const autosaveTimers = new Map<string, NodeJS.Timeout>();

/**
 * Start a new exam session with extended timeout
 */
export async function startExamSession(params: {
	userId: string;
	examType: string;
	subjectId: number | null;
}): Promise<ExamSession> {
	const db = dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	const now = new Date();
	const expiresAt = new Date(now.getTime() + EXAM_SESSION_DURATION_MS);
	const id = `exam_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

	const session: ExamSession = {
		id,
		userId: params.userId,
		examType: params.examType,
		subjectId: params.subjectId,
		startedAt: now,
		expiresAt,
		lastActivityAt: now,
		lastSavedAt: null,
		progress: {},
		answers: [],
		isActive: true,
		isCompleted: false,
		completedAt: null,
		createdAt: now,
		updatedAt: now,
	};

	try {
		// Save to database
		await db.insert(examSessionsTable).values({
			id: session.id,
			userId: session.userId,
			examType: session.examType,
			subjectId: session.subjectId,
			startedAt: session.startedAt,
			expiresAt: session.expiresAt,
			lastActivityAt: session.lastActivityAt,
			lastSavedAt: session.lastSavedAt,
			progress: session.progress,
			answers: session.answers,
			isActive: session.isActive,
			isCompleted: session.isCompleted,
			completedAt: session.completedAt,
			createdAt: session.createdAt,
			updatedAt: session.updatedAt,
		});

		// Initialize in-memory state
		activeSessions.set(session.id, {
			session,
			timeRemaining: EXAM_SESSION_DURATION_MS,
			isWarning: false,
			lastSavedAt: null,
			unsavedChanges: false,
		});

		// Start autosave timer
		startAutosave(session.id);

		log.info('Exam session started', {
			sessionId: id,
			userId: params.userId,
			examType: params.examType,
			expiresAt,
		});

		return session;
	} catch (error) {
		log.error('Failed to start exam session', { error });
		throw error;
	}
}

/**
 * Record activity and extend session
 * Call this on any user interaction during exam
 */
export async function recordExamActivity(sessionId: string): Promise<SessionExtensionResult> {
	const db = dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	const now = new Date();
	const state = activeSessions.get(sessionId);

	if (!state) {
		// Try to load from database
		const session = await loadExamSession(sessionId);
		if (!session) {
			throw new Error('Exam session not found');
		}

		if (!session.isActive || session.isCompleted) {
			throw new Error('Exam session is not active');
		}

		// Check if expired
		if (new Date() > session.expiresAt) {
			throw new Error('Exam session has expired');
		}

		// Restore session
		activeSessions.set(sessionId, {
			session,
			timeRemaining: session.expiresAt.getTime() - now.getTime(),
			isWarning: false,
			lastSavedAt: session.lastSavedAt,
			unsavedChanges: false,
		});
	}

	// Update last activity time
	const newExpiresAt = new Date(now.getTime() + SESSION_EXTENSION_ON_ACTIVITY_MS);

	await db
		.update(examSessionsTable)
		.set({
			lastActivityAt: now,
			expiresAt: newExpiresAt,
			updatedAt: now,
		})
		.where(eq(examSessionsTable.id, sessionId));

	// Update in-memory state
	const updatedState = activeSessions.get(sessionId);
	if (!updatedState?.session) {
		throw new Error('Session not found in memory');
	}
	updatedState.session.lastActivityAt = now;
	updatedState.session.expiresAt = newExpiresAt;
	updatedState.timeRemaining = newExpiresAt.getTime() - now.getTime();
	updatedState.isWarning = updatedState.timeRemaining < WARNING_BEFORE_TIMEOUT_MS;

	return {
		success: true,
		newExpiresAt,
		timeRemaining: updatedState.timeRemaining,
	};
}

/**
 * Save exam progress (manual or autosave)
 */
export async function saveExamProgress(params: {
	sessionId: string;
	answers: ExamAnswer[];
	progress: Record<string, unknown>;
}): Promise<void> {
	const db = dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	const now = new Date();

	try {
		await db
			.update(examSessionsTable)
			.set({
				answers: params.answers,
				progress: params.progress,
				lastSavedAt: now,
				updatedAt: now,
			})
			.where(eq(examSessionsTable.id, params.sessionId));

		// Update in-memory state
		const state = activeSessions.get(params.sessionId);
		if (state?.session) {
			state.session.answers = params.answers;
			state.session.progress = params.progress;
			state.session.lastSavedAt = now;
			state.unsavedChanges = false;
			state.lastSavedAt = now;
		}

		log.debug('Exam progress saved', {
			sessionId: params.sessionId,
			answerCount: params.answers.length,
		});
	} catch (error) {
		log.error('Failed to save exam progress', { error });
		throw error;
	}
}

/**
 * Complete an exam session
 */
export async function completeExamSession(sessionId: string): Promise<ExamSession> {
	const db = dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	const now = new Date();

	try {
		const [session] = await db
			.select()
			.from(examSessionsTable)
			.where(eq(examSessionsTable.id, sessionId));

		if (!session) {
			throw new Error('Exam session not found');
		}

		await db
			.update(examSessionsTable)
			.set({
				isCompleted: true,
				completedAt: now,
				isActive: false,
				updatedAt: now,
			})
			.where(eq(examSessionsTable.id, sessionId));

		// Clear autosave timer
		const timer = autosaveTimers.get(sessionId);
		if (timer) {
			clearInterval(timer);
			autosaveTimers.delete(sessionId);
		}

		// Remove from active sessions
		activeSessions.delete(sessionId);

		log.info('Exam session completed', {
			sessionId,
			duration: now.getTime() - session.startedAt.getTime(),
		});

		return {
			...session,
			isCompleted: true,
			completedAt: now,
			isActive: false,
		} as ExamSession;
	} catch (error) {
		log.error('Failed to complete exam session', { error });
		throw error;
	}
}

/**
 * Get current exam session state
 */
export function getExamSessionState(sessionId: string): ExamSessionState | null {
	return activeSessions.get(sessionId) || null;
}

/**
 * Check if session is about to expire and send warnings
 */
export async function checkSessionWarnings(sessionId: string): Promise<{
	shouldWarn: boolean;
	timeRemaining: number;
	expiresAt: Date;
}> {
	const state = activeSessions.get(sessionId);
	if (!state?.session) {
		return { shouldWarn: false, timeRemaining: 0, expiresAt: new Date(0) };
	}

	const timeRemaining = state.session.expiresAt.getTime() - Date.now();
	const shouldWarn = timeRemaining < WARNING_BEFORE_TIMEOUT_MS && timeRemaining > 0;

	// Update warning state
	state.isWarning = shouldWarn;

	return {
		shouldWarn,
		timeRemaining,
		expiresAt: state.session.expiresAt,
	};
}

/**
 * Resume an interrupted exam session
 * Recovers state from last save
 */
export async function resumeExamSession(sessionId: string): Promise<ExamSessionState> {
	const db = dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	const session = await loadExamSession(sessionId);
	if (!session) {
		throw new Error('Exam session not found');
	}

	if (!session.isActive && !session.isCompleted) {
		throw new Error('Exam session is not resumable');
	}

	if (session.expiresAt < new Date()) {
		throw new Error('Exam session has expired');
	}

	// Restore session
	const state: ExamSessionState = {
		session,
		timeRemaining: session.expiresAt.getTime() - Date.now(),
		isWarning: false,
		lastSavedAt: session.lastSavedAt,
		unsavedChanges: false,
	};

	activeSessions.set(sessionId, state);
	startAutosave(sessionId);

	log.info('Exam session resumed', {
		sessionId,
		lastSavedAt: session.lastSavedAt,
		timeRemaining: state.timeRemaining,
	});

	return state;
}

/**
 * Load an exam session from database
 */
async function loadExamSession(sessionId: string): Promise<ExamSession | null> {
	const db = dbManagerV2.getDb();
	if (!db) {
		return null;
	}

	try {
		const [session] = await db
			.select()
			.from(examSessionsTable)
			.where(and(eq(examSessionsTable.id, sessionId), gt(examSessionsTable.expiresAt, new Date())));

		if (!session) {
			return null;
		}

		return {
			...session,
			progress: session.progress as Record<string, unknown>,
			answers: (session.answers as ExamAnswer[]) || [],
		};
	} catch (error) {
		log.error('Failed to load exam session', { error });
		return null;
	}
}

/**
 * Start autosave for an exam session
 */
function startAutosave(sessionId: string): void {
	// Clear existing timer if any
	const existingTimer = autosaveTimers.get(sessionId);
	if (existingTimer) {
		clearInterval(existingTimer);
	}

	const timer = setInterval(async () => {
		try {
			const state = activeSessions.get(sessionId);
			if (!state?.session || state.unsavedChanges === false) {
				return; // Nothing to save
			}

			await saveExamProgress({
				sessionId,
				answers: state.session.answers,
				progress: state.session.progress,
			});

			log.debug('Autosave completed', { sessionId });
		} catch (error) {
			log.error('Autosave failed', { sessionId, error });
			// Don't throw - autosave failures should not interrupt the exam
		}
	}, AUTOSAVE_INTERVAL_MS);

	autosaveTimers.set(sessionId, timer);
}

/**
 * Get all active exam sessions for a user
 */
export async function getUserActiveExamSessions(userId: string): Promise<ExamSession[]> {
	const db = dbManagerV2.getDb();
	if (!db) {
		return [];
	}

	try {
		const sessions = await db
			.select()
			.from(examSessionsTable)
			.where(
				and(
					eq(examSessionsTable.userId, userId),
					eq(examSessionsTable.isActive, true),
					gt(examSessionsTable.expiresAt, new Date())
				)
			);

		return sessions.map((s) => ({
			...s,
			progress: s.progress as Record<string, unknown>,
			answers: (s.answers as ExamAnswer[]) || [],
		}));
	} catch (error) {
		log.error('Failed to get user active exam sessions', { error });
		return [];
	}
}

/**
 * Cleanup expired exam sessions
 * Run this periodically as a cron job
 */
export async function cleanupExpiredSessions(): Promise<number> {
	const db = dbManagerV2.getDb();
	if (!db) {
		return 0;
	}

	try {
		const now = new Date();

		const deleted = await db
			.delete(examSessionsTable)
			.where(
				and(
					eq(examSessionsTable.isActive, false),
					eq(examSessionsTable.isCompleted, true),
					lt(examSessionsTable.completedAt, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) // Older than 7 days
				)
			)
			.returning({ id: examSessionsTable.id });

		log.info('Expired exam sessions cleaned up', { count: deleted.length });
		return deleted.length;
	} catch (error) {
		log.error('Failed to cleanup expired sessions', { error });
		return 0;
	}
}

/**
 * Initialize exam session tracking
 */
export async function initializeExamSessions(): Promise<void> {
	const db = dbManagerV2.getDb();
	if (!db) {
		log.warn('Database not available - skipping exam session initialization');
		return;
	}

	try {
		await db.execute(`
      CREATE TABLE IF NOT EXISTS exam_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        exam_type VARCHAR(50) NOT NULL,
        subject_id INTEGER,
        started_at TIMESTAMP NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        last_activity_at TIMESTAMP NOT NULL,
        last_saved_at TIMESTAMP,
        progress JSONB,
        answers JSONB,
        is_active BOOLEAN DEFAULT true,
        is_completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

		log.info('Exam sessions table initialized');
	} catch (error) {
		log.error('Failed to initialize exam sessions table', { error });
	}
}
