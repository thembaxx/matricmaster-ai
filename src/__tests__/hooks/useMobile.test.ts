import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useIsMobile } from '@/hooks/use-mobile';

describe('useIsMobile', () => {
	beforeEach(() => {
		const mockMatchMedia = vi.fn().mockImplementation((_query: string) => ({
			matches: false,
			media: '',
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		}));
		globalThis.window = {
			innerWidth: 1024,
			matchMedia: mockMatchMedia,
		} as unknown as typeof window;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('initialization', () => {
		it('should return false for desktop width', () => {
			globalThis.window = {
				innerWidth: 1024,
				matchMedia: vi.fn().mockImplementation(() => ({
					matches: false,
					media: '(max-width: 767px)',
					addEventListener: vi.fn(),
					removeEventListener: vi.fn(),
				})),
			} as unknown as typeof window;

			const { result } = renderHook(() => useIsMobile());

			expect(result.current).toBe(false);
		});

		it('should return true for mobile width', () => {
			globalThis.window = {
				innerWidth: 480,
				matchMedia: vi.fn().mockImplementation(() => ({
					matches: true,
					media: '(max-width: 767px)',
					addEventListener: vi.fn(),
					removeEventListener: vi.fn(),
				})),
			} as unknown as typeof window;

			const { result } = renderHook(() => useIsMobile());

			expect(result.current).toBe(true);
		});

		it('should return false for tablet width (768px)', () => {
			globalThis.window = {
				innerWidth: 768,
				matchMedia: vi.fn().mockImplementation(() => ({
					matches: false,
					media: '(max-width: 767px)',
					addEventListener: vi.fn(),
					removeEventListener: vi.fn(),
				})),
			} as unknown as typeof window;

			const { result } = renderHook(() => useIsMobile());

			expect(result.current).toBe(false);
		});
	});

	describe('breakpoint behavior', () => {
		it('should use 768px as mobile breakpoint', () => {
			const matchMediaSpy = vi.fn().mockImplementation(() => ({
				matches: false,
				media: '',
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
			}));

			globalThis.window = {
				innerWidth: 500,
				matchMedia: matchMediaSpy,
			} as unknown as typeof window;

			renderHook(() => useIsMobile());

			expect(matchMediaSpy).toHaveBeenCalledWith('(max-width: 767px)');
		});

		it('should handle width at breakpoint threshold', () => {
			globalThis.window = {
				innerWidth: 767,
				matchMedia: vi.fn().mockImplementation(() => ({
					matches: false,
					media: '',
					addEventListener: vi.fn(),
					removeEventListener: vi.fn(),
				})),
			} as unknown as typeof window;

			const { result } = renderHook(() => useIsMobile());

			expect(result.current).toBe(false);
		});
	});

	describe('resize handling', () => {
		it('should update on media query change', () => {
			const callbacks: Array<(e: { matches: boolean }) => void> = [];

			globalThis.window = {
				innerWidth: 500,
				matchMedia: vi.fn().mockImplementation(() => ({
					matches: true,
					media: '(max-width: 767px)',
					addEventListener: vi.fn((_event: string, callback: (e: { matches: boolean }) => void) => {
						callbacks.push(callback);
					}),
					removeEventListener: vi.fn(),
				})),
			} as unknown as typeof window;

			const { result, rerender } = renderHook(() => useIsMobile());

			expect(result.current).toBe(true);

			globalThis.window = {
				innerWidth: 1024,
				matchMedia: vi.fn().mockImplementation(() => ({
					matches: false,
					media: '(max-width: 767px)',
					addEventListener: vi.fn(),
					removeEventListener: vi.fn(),
				})),
			} as unknown as typeof window;

			callbacks.forEach((cb) => {
				cb({ matches: false });
			});

			rerender();

			expect(result.current).toBe(false);
		});
	});

	describe('edge cases', () => {
		it('should return false when innerWidth is exactly 0', () => {
			globalThis.window = {
				innerWidth: 0,
				matchMedia: vi.fn().mockImplementation(() => ({
					matches: false,
					media: '',
					addEventListener: vi.fn(),
					removeEventListener: vi.fn(),
				})),
			} as unknown as typeof window;

			const { result } = renderHook(() => useIsMobile());

			expect(result.current).toBe(false);
		});

		it('should return false for very large screens', () => {
			globalThis.window = {
				innerWidth: 2560,
				matchMedia: vi.fn().mockImplementation(() => ({
					matches: false,
					media: '',
					addEventListener: vi.fn(),
					removeEventListener: vi.fn(),
				})),
			} as unknown as typeof window;

			const { result } = renderHook(() => useIsMobile());

			expect(result.current).toBe(false);
		});

		it('should handle cleanup on unmount', () => {
			const removeEventListenerSpy = vi.fn();

			globalThis.window = {
				innerWidth: 500,
				matchMedia: vi.fn().mockImplementation(() => ({
					matches: true,
					media: '',
					addEventListener: vi.fn(),
					removeEventListener: removeEventListenerSpy,
				})),
			} as unknown as typeof window;

			const { unmount } = renderHook(() => useIsMobile());

			unmount();

			expect(removeEventListenerSpy).toHaveBeenCalled();
		});
	});
});
