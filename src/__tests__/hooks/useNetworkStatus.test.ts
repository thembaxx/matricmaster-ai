import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

describe('useNetworkStatus', () => {
	beforeEach(() => {
		const mockNavigator = { onLine: true };
		const mockWindow = {
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		};
		globalThis.navigator = mockNavigator as unknown as Navigator;
		globalThis.window = mockWindow as unknown as typeof window;
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	describe('initialization', () => {
		it('should initialize as online when navigator.onLine is true', () => {
			globalThis.navigator = { onLine: true } as Navigator;

			const { result } = renderHook(() => useNetworkStatus());

			expect(result.current.isOnline).toBe(true);
			expect(result.current.wasOffline).toBe(false);
		});

		it('should initialize as offline when navigator.onLine is false', () => {
			globalThis.navigator = { onLine: false } as Navigator;

			const { result } = renderHook(() => useNetworkStatus());

			expect(result.current.isOnline).toBe(false);
			expect(result.current.wasOffline).toBe(true);
		});
	});

	describe('online/offline events', () => {
		it('should detect transition to online', () => {
			globalThis.navigator = { onLine: false } as Navigator;

			const { result } = renderHook(() => useNetworkStatus());

			expect(result.current.isOnline).toBe(false);
			expect(result.current.wasOffline).toBe(true);

			act(() => {
				const eventCallbacks = (
					window.addEventListener as ReturnType<typeof vi.fn>
				).mock.calls.filter((call: unknown[]) => call[0] === 'online');
				if (eventCallbacks.length > 0) {
					const onlineCallback = eventCallbacks[0][1] as () => void;
					onlineCallback();
				}
			});

			expect(result.current.isOnline).toBe(true);
		});

		it('should detect transition to offline', () => {
			const { result } = renderHook(() => useNetworkStatus());

			expect(result.current.isOnline).toBe(true);

			act(() => {
				const eventCallbacks = (
					window.addEventListener as ReturnType<typeof vi.fn>
				).mock.calls.filter((call: unknown[]) => call[0] === 'offline');
				if (eventCallbacks.length > 0) {
					const offlineCallback = eventCallbacks[0][1] as () => void;
					offlineCallback();
				}
			});

			expect(result.current.isOnline).toBe(false);
			expect(result.current.wasOffline).toBe(true);
		});
	});

	describe('grace period behavior', () => {
		it('should reset wasOffline after grace period when going online', () => {
			globalThis.navigator = { onLine: false } as Navigator;

			const { result } = renderHook(() => useNetworkStatus());

			expect(result.current.wasOffline).toBe(true);

			act(() => {
				const onlineCallbacks = (
					window.addEventListener as ReturnType<typeof vi.fn>
				).mock.calls.filter((call: unknown[]) => call[0] === 'online');
				if (onlineCallbacks.length > 0) {
					const callback = onlineCallbacks[0][1] as () => void;
					callback();
				}
			});

			expect(result.current.wasOffline).toBe(true);

			act(() => {
				vi.advanceTimersByTime(5000);
			});

			expect(result.current.wasOffline).toBe(false);
		});

		it('should clear grace period timeout when going offline again', () => {
			globalThis.navigator = { onLine: false } as Navigator;

			const { result } = renderHook(() => useNetworkStatus());

			act(() => {
				const onlineCallbacks = (
					window.addEventListener as ReturnType<typeof vi.fn>
				).mock.calls.filter((call: unknown[]) => call[0] === 'online');
				if (onlineCallbacks.length > 0) {
					const callback = onlineCallbacks[0][1] as () => void;
					callback();
				}
			});

			act(() => {
				vi.advanceTimersByTime(2000);
			});

			act(() => {
				const offlineCallbacks = (
					window.addEventListener as ReturnType<typeof vi.fn>
				).mock.calls.filter((call: unknown[]) => call[0] === 'offline');
				if (offlineCallbacks.length > 0) {
					const callback = offlineCallbacks[0][1] as () => void;
					callback();
				}
			});

			act(() => {
				vi.advanceTimersByTime(5000);
			});

			expect(result.current.wasOffline).toBe(true);
		});
	});

	describe('cleanup', () => {
		it('should remove event listeners on unmount', () => {
			const { unmount } = renderHook(() => useNetworkStatus());

			unmount();

			expect(window.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
			expect(window.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
		});
	});

	describe('edge cases', () => {
		it('should handle window being undefined', () => {
			const originalWindow = globalThis.window;
			globalThis.window = undefined as unknown as typeof window;

			const { result } = renderHook(() => useNetworkStatus());

			expect(result.current.isOnline).toBe(true);

			globalThis.window = originalWindow;
		});

		it('should handle repeated online/offline transitions', () => {
			const { result } = renderHook(() => useNetworkStatus());

			act(() => {
				const offlineCallbacks = (
					window.addEventListener as ReturnType<typeof vi.fn>
				).mock.calls.filter((call: unknown[]) => call[0] === 'offline');
				if (offlineCallbacks.length > 0) {
					const callback = offlineCallbacks[0][1] as () => void;
					callback();
				}
			});

			expect(result.current.wasOffline).toBe(true);

			act(() => {
				const onlineCallbacks = (
					window.addEventListener as ReturnType<typeof vi.fn>
				).mock.calls.filter((call: unknown[]) => call[0] === 'online');
				if (onlineCallbacks.length > 0) {
					const callback = onlineCallbacks[0][1] as () => void;
					callback();
				}
			});

			act(() => {
				const offlineCallbacks = (
					window.addEventListener as ReturnType<typeof vi.fn>
				).mock.calls.filter((call: unknown[]) => call[0] === 'offline');
				if (offlineCallbacks.length > 0) {
					const callback = offlineCallbacks[0][1] as () => void;
					callback();
				}
			});

			expect(result.current.isOnline).toBe(false);
			expect(result.current.wasOffline).toBe(true);
		});
	});
});
