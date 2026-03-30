import { vi } from 'vitest';

export interface MockUser {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	role: string;
	isBlocked: boolean;
	twoFactorEnabled: boolean;
	hasCompletedOnboarding: boolean;
	school: string | null;
	avatarId: string | null;
	deletedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface MockStudyPlan {
	id: string;
	userId: string;
	title: string;
	targetExamDate: string | null;
	focusAreas: string | null;
	weeklyGoals: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface MockTopicMastery {
	id: string;
	userId: string;
	subjectId: number;
	topic: string;
	masteryLevel: string;
	questionsAttempted: number;
	questionsCorrect: number;
	averageTime: number | null;
	lastPracticed: string | null;
	nextReview: string | null;
	consecutiveCorrect: number;
	createdAt: string;
	updatedAt: string;
}

export interface MockTopicConfidence {
	id: string;
	userId: string;
	topic: string;
	subject: string;
	confidenceScore: string;
	timesCorrect: number;
	timesAttempted: number;
	lastAttemptAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface MockSession {
	id: string;
	expiresAt: string;
	token: string;
	createdAt: string;
	updatedAt: string;
	ipAddress: string | null;
	userAgent: string | null;
	userId: string;
}

export interface MockAccount {
	id: string;
	accountId: string;
	providerId: string;
	userId: string;
	accessToken: string | null;
	refreshToken: string | null;
	idToken: string | null;
	accessTokenExpiresAt: string | null;
	refreshTokenExpiresAt: string | null;
	scope: string | null;
	password: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface MockSubjects {
	id: number;
	name: string;
	slug: string;
	category: string | null;
	createdAt: string;
}

export type MockDb = {
	query: {
		users: {
			findFirst: ReturnType<typeof vi.fn>;
			findMany: ReturnType<typeof vi.fn>;
		};
		studyPlans: {
			findFirst: ReturnType<typeof vi.fn>;
			findMany: ReturnType<typeof vi.fn>;
		};
		topicMastery: {
			findFirst: ReturnType<typeof vi.fn>;
			findMany: ReturnType<typeof vi.fn>;
		};
		topicConfidence: {
			findFirst: ReturnType<typeof vi.fn>;
			findMany: ReturnType<typeof vi.fn>;
		};
		subjects: {
			findFirst: ReturnType<typeof vi.fn>;
			findMany: ReturnType<typeof vi.fn>;
		};
	};
	insert: ReturnType<typeof vi.fn>;
	update: ReturnType<typeof vi.fn>;
	delete: ReturnType<typeof vi.fn>;
	select: ReturnType<typeof vi.fn>;
};

export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
	const now = new Date().toISOString();
	return {
		id: 'user_123',
		name: 'Test User',
		email: 'test@example.com',
		emailVerified: true,
		image: null,
		role: 'user',
		isBlocked: false,
		twoFactorEnabled: false,
		hasCompletedOnboarding: false,
		school: null,
		avatarId: null,
		deletedAt: null,
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
}

export function createMockStudyPlan(overrides: Partial<MockStudyPlan> = {}): MockStudyPlan {
	const now = new Date().toISOString();
	return {
		id: 'plan_123',
		userId: 'user_123',
		title: 'Mathematics Study Plan',
		targetExamDate: null,
		focusAreas: null,
		weeklyGoals: null,
		isActive: true,
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
}

export function createMockTopicMastery(
	overrides: Partial<MockTopicMastery> = {}
): MockTopicMastery {
	const now = new Date().toISOString();
	return {
		id: 'mastery_123',
		userId: 'user_123',
		subjectId: 1,
		topic: 'Algebra',
		masteryLevel: '50.00',
		questionsAttempted: 10,
		questionsCorrect: 5,
		averageTime: null,
		lastPracticed: null,
		nextReview: null,
		consecutiveCorrect: 0,
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
}

export function createMockTopicConfidence(
	overrides: Partial<MockTopicConfidence> = {}
): MockTopicConfidence {
	const now = new Date().toISOString();
	return {
		id: 'confidence_123',
		userId: 'user_123',
		topic: 'Algebra',
		subject: 'Mathematics',
		confidenceScore: '0.50',
		timesCorrect: 5,
		timesAttempted: 10,
		lastAttemptAt: null,
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
}

export function createMockSession(overrides: Partial<MockSession> = {}): MockSession {
	const now = new Date().toISOString();
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
	return {
		id: 'session_123',
		expiresAt,
		token: 'mock_token_123',
		createdAt: now,
		updatedAt: now,
		ipAddress: null,
		userAgent: null,
		userId: 'user_123',
		...overrides,
	};
}

export function createMockAccount(overrides: Partial<MockAccount> = {}): MockAccount {
	const now = new Date().toISOString();
	return {
		id: 'account_123',
		accountId: 'account_123',
		providerId: 'google',
		userId: 'user_123',
		accessToken: null,
		refreshToken: null,
		idToken: null,
		accessTokenExpiresAt: null,
		refreshTokenExpiresAt: null,
		scope: null,
		password: null,
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
}

export function createMockSubject(overrides: Partial<MockSubjects> = {}): MockSubjects {
	const now = new Date().toISOString();
	return {
		id: 1,
		name: 'Mathematics',
		slug: 'mathematics',
		category: null,
		createdAt: now,
		...overrides,
	};
}

export function createMockDb(overrides: Partial<MockDb> = {}): MockDb {
	const mockQueryUsersFindFirst = vi.fn().mockResolvedValue(null);
	const mockQueryUsersFindMany = vi.fn().mockResolvedValue([]);
	const mockQueryStudyPlansFindFirst = vi.fn().mockResolvedValue(null);
	const mockQueryStudyPlansFindMany = vi.fn().mockResolvedValue([]);
	const mockQueryTopicMasteryFindFirst = vi.fn().mockResolvedValue(null);
	const mockQueryTopicMasteryFindMany = vi.fn().mockResolvedValue([]);
	const mockQueryTopicConfidenceFindFirst = vi.fn().mockResolvedValue(null);
	const mockQueryTopicConfidenceFindMany = vi.fn().mockResolvedValue([]);
	const mockQuerySubjectsFindFirst = vi.fn().mockResolvedValue(null);
	const mockQuerySubjectsFindMany = vi.fn().mockResolvedValue([]);
	const mockInsert = vi.fn().mockReturnValue({
		values: vi.fn().mockResolvedValue([]),
		onConflictDoNothing: vi.fn().mockResolvedValue([]),
		onConflictDoUpdate: vi.fn().mockResolvedValue([]),
	});
	const mockUpdate = vi.fn().mockReturnValue({
		set: vi.fn().mockReturnValue({
			where: vi.fn().mockResolvedValue([]),
		}),
	});
	const mockDelete = vi.fn().mockReturnValue({
		where: vi.fn().mockResolvedValue([]),
	});
	const mockSelect = vi.fn().mockReturnValue({
		from: vi.fn().mockReturnValue({
			where: vi.fn().mockResolvedValue([]),
			innerJoin: vi.fn().mockResolvedValue([]),
			orderBy: vi.fn().mockResolvedValue([]),
		}),
	});

	return {
		query: {
			users: {
				findFirst: mockQueryUsersFindFirst,
				findMany: mockQueryUsersFindMany,
			},
			studyPlans: {
				findFirst: mockQueryStudyPlansFindFirst,
				findMany: mockQueryStudyPlansFindMany,
			},
			topicMastery: {
				findFirst: mockQueryTopicMasteryFindFirst,
				findMany: mockQueryTopicMasteryFindMany,
			},
			topicConfidence: {
				findFirst: mockQueryTopicConfidenceFindFirst,
				findMany: mockQueryTopicConfidenceFindMany,
			},
			subjects: {
				findFirst: mockQuerySubjectsFindFirst,
				findMany: mockQuerySubjectsFindMany,
			},
		},
		insert: mockInsert,
		update: mockUpdate,
		delete: mockDelete,
		select: mockSelect,
		...overrides,
	};
}

export const mockDbQuery = {
	users: {
		findFirst: vi.fn().mockResolvedValue(null),
		findMany: vi.fn().mockResolvedValue([]),
	},
	studyPlans: {
		findFirst: vi.fn().mockResolvedValue(null),
		findMany: vi.fn().mockResolvedValue([]),
	},
	topicMastery: {
		findFirst: vi.fn().mockResolvedValue(null),
		findMany: vi.fn().mockResolvedValue([]),
	},
	topicConfidence: {
		findFirst: vi.fn().mockResolvedValue(null),
		findMany: vi.fn().mockResolvedValue([]),
	},
	subjects: {
		findFirst: vi.fn().mockResolvedValue(null),
		findMany: vi.fn().mockResolvedValue([]),
	},
};

export const mockDbInsert = vi.fn().mockReturnValue({
	values: vi.fn().mockResolvedValue([]),
	onConflictDoNothing: vi.fn().mockResolvedValue([]),
	onConflictDoUpdate: vi.fn().mockResolvedValue([]),
});

export const mockDbUpdate = vi.fn().mockReturnValue({
	set: vi.fn().mockReturnValue({
		where: vi.fn().mockResolvedValue([]),
	}),
});

export const mockDbDelete = vi.fn().mockReturnValue({
	where: vi.fn().mockResolvedValue([]),
});

export const mockDbSelect = vi.fn().mockReturnValue({
	from: vi.fn().mockReturnValue({
		where: vi.fn().mockResolvedValue([]),
		innerJoin: vi.fn().mockResolvedValue([]),
		orderBy: vi.fn().mockResolvedValue([]),
	}),
});

export function setupDbMocks() {
	vi.mock('@/lib/db/database-manager-v2', () => ({
		dbManagerV2: {
			getDb: vi.fn().mockReturnValue(createMockDb()),
			getSmartDb: vi.fn().mockResolvedValue(createMockDb()),
			isPostgreSQLConnected: vi.fn().mockReturnValue(true),
			isSQLiteConnected: vi.fn().mockReturnValue(false),
		},
	}));

	vi.mock('drizzle-orm', () => ({
		eq: vi.fn().mockReturnValue({}),
		and: vi.fn().mockReturnValue({}),
		or: vi.fn().mockReturnValue({}),
		desc: vi.fn().mockReturnValue({}),
		asc: vi.fn().mockReturnValue({}),
		sql: vi.fn().mockReturnValue({}),
		like: vi.fn().mockReturnValue({}),
		inArray: vi.fn().mockReturnValue({}),
		count: vi.fn().mockReturnValue({}),
		sum: vi.fn().mockReturnValue({}),
		avg: vi.fn().mockReturnValue({}),
		max: vi.fn().mockReturnValue({}),
		min: vi.fn().mockReturnValue({}),
	}));
}
