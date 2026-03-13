import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
	cleanup();
});

// Define persistent mock functions for useRouter
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockBack = vi.fn();
const mockForward = vi.fn();
const mockRefresh = vi.fn();
const mockPrefetch = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: mockPush,
		replace: mockReplace,
		back: mockBack,
		forward: mockForward,
		refresh: mockRefresh,
		prefetch: mockPrefetch,
	}),
	usePathname: vi.fn(() => '/'),
}));

vi.mock('@/lib/auth-client', () => ({
	useSession: () => ({
		data: null,
		isLoading: false,
	}),
}));

// Export mocks for use in tests
export { mockBack, mockForward, mockPrefetch, mockPush, mockRefresh, mockReplace };
