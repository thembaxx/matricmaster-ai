import { vi } from 'vitest';

export interface MockSessionUser {
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
	createdAt: Date;
	updatedAt: Date;
}

export interface MockSessionData {
	user: MockSessionUser;
	expiresAt: Date;
	sessionId: string;
}

export interface MockUseSessionReturn {
	data: MockSessionData | null;
	isLoading: boolean;
	error: Error | null;
}

export function createMockSessionUser(overrides: Partial<MockSessionUser> = {}): MockSessionUser {
	const now = new Date();
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
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
}

export function createMockSessionData(overrides: Partial<MockSessionData> = {}): MockSessionData {
	const now = new Date();
	const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
	return {
		user: createMockSessionUser(),
		expiresAt,
		sessionId: 'session_123',
		...overrides,
	};
}

export const mockUseSession = vi.fn().mockReturnValue({
	data: null,
	isLoading: false,
	error: null,
});

export const mockSignIn = vi.fn().mockResolvedValue({
	data: null,
	error: null,
});

export const mockSignOut = vi.fn().mockResolvedValue({
	data: null,
	error: null,
});

export const mockSignUp = vi.fn().mockResolvedValue({
	data: null,
	error: null,
});

export const mockGetSession = vi.fn().mockResolvedValue({
	data: {
		user: createMockSessionUser(),
		expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		sessionId: 'session_123',
	},
	error: null,
});

export const mockAuthClient = {
	signIn: mockSignIn,
	signUp: mockSignUp,
	signOut: mockSignOut,
	useSession: () => mockUseSession(),
	getSession: mockGetSession,
};

export function createAuthenticatedSession() {
	return {
		data: createMockSessionData(),
		isLoading: false,
		error: null,
	};
}

export function createUnauthenticatedSession() {
	return {
		data: null,
		isLoading: false,
		error: null,
	};
}

export function createLoadingSession() {
	return {
		data: null,
		isLoading: true,
		error: null,
	};
}

export function createBlockedUserSession() {
	return {
		data: createMockSessionData({
			user: createMockSessionUser({
				isBlocked: true,
			}),
		}),
		isLoading: false,
		error: null,
	};
}

export function createTwoFactorEnabledSession() {
	return {
		data: createMockSessionData({
			user: createMockSessionUser({
				twoFactorEnabled: true,
			}),
		}),
		isLoading: false,
		error: null,
	};
}

export function setupAuthMocks() {
	vi.mock('@/lib/auth-client', () => ({
		signIn: mockSignIn,
		signUp: mockSignUp,
		signOut: mockSignOut,
		useSession: () => mockUseSession(),
		getSession: mockGetSession,
		authClient: mockAuthClient,
	}));

	vi.mock('better-auth/client/plugins', () => ({
		twoFactorClient: vi.fn().mockReturnValue({}),
	}));

	vi.mock('better-auth/react', () => ({
		createAuthClient: vi.fn().mockReturnValue(mockAuthClient),
	}));
}

export function resetAuthMocks() {
	mockUseSession.mockReset();
	mockSignIn.mockReset();
	mockSignOut.mockReset();
	mockSignUp.mockReset();
	mockGetSession.mockReset();
}

export function setMockSession(user: MockSessionUser | null) {
	mockUseSession.mockReturnValue({
		data: user
			? {
					user,
					expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
					sessionId: 'session_123',
				}
			: null,
		isLoading: false,
		error: null,
	});
}
