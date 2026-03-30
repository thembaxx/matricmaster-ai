import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

describe('useDebouncedCallback', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	describe('basic debounce functionality', () => {
		it('should debounce function calls', () => {
			const mockFn = vi.fn();
			const { result } = renderHook(() => useDebouncedCallback(mockFn, 300));

			act(() => {
				result.current();
			});

			expect(mockFn).not.toHaveBeenCalled();

			act(() => {
				vi.advanceTimersByTime(300);
			});

			expect(mockFn).toHaveBeenCalledTimes(1);
		});

		it('should pass arguments to the debounced function', () => {
			const mockFn = vi.fn();
			const { result } = renderHook(() => useDebouncedCallback(mockFn, 300));

			act(() => {
				result.current('arg1', 'arg2');
			});

			act(() => {
				vi.advanceTimersByTime(300);
			});

			expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
		});

		it('should only call the function once after multiple rapid calls', () => {
			const mockFn = vi.fn();
			const { result } = renderHook(() => useDebouncedCallback(mockFn, 300));

			act(() => {
				result.current();
				result.current();
				result.current();
			});

			act(() => {
				vi.advanceTimersByTime(300);
			});

			expect(mockFn).toHaveBeenCalledTimes(1);
		});
	});

	describe('delay variations', () => {
		it('should use custom delay', () => {
			const mockFn = vi.fn();
			const { result } = renderHook(() => useDebouncedCallback(mockFn, 500));

			act(() => {
				result.current();
			});

			act(() => {
				vi.advanceTimersByTime(300);
			});

			expect(mockFn).not.toHaveBeenCalled();

			act(() => {
				vi.advanceTimersByTime(200);
			});

			expect(mockFn).toHaveBeenCalledTimes(1);
		});

		it('should handle zero delay', () => {
			const mockFn = vi.fn();
			const { result } = renderHook(() => useDebouncedCallback(mockFn, 0));

			act(() => {
				result.current();
			});

			expect(mockFn).toHaveBeenCalledTimes(1);
		});

		it('should handle very long delay', () => {
			const mockFn = vi.fn();
			const { result } = renderHook(() => useDebouncedCallback(mockFn, 10000));

			act(() => {
				result.current();
			});

			act(() => {
				vi.advanceTimersByTime(5000);
			});

			expect(mockFn).not.toHaveBeenCalled();

			act(() => {
				vi.advanceTimersByTime(5000);
			});

			expect(mockFn).toHaveBeenCalledTimes(1);
		});
	});

	describe('callback updates', () => {
		it('should use latest callback after re-render', () => {
			const mockFn1 = vi.fn();
			const mockFn2 = vi.fn();

			const { result, rerender } = renderHook(({ fn, delay }) => useDebouncedCallback(fn, delay), {
				initialProps: { fn: mockFn1, delay: 300 },
			});

			act(() => {
				result.current();
			});

			rerender({ fn: mockFn2, delay: 300 });

			act(() => {
				result.current();
			});

			act(() => {
				vi.advanceTimersByTime(300);
			});

			expect(mockFn1).not.toHaveBeenCalled();
			expect(mockFn2).toHaveBeenCalledTimes(2);
		});
	});

	describe('cleanup', () => {
		it('should clear timeout on unmount', () => {
			const mockFn = vi.fn();
			const { result, unmount } = renderHook(() => useDebouncedCallback(mockFn, 300));

			act(() => {
				result.current();
			});

			unmount();

			act(() => {
				vi.advanceTimersByTime(300);
			});

			expect(mockFn).not.toHaveBeenCalled();
		});

		it('should clear previous timeout when called again', () => {
			const mockFn = vi.fn();
			const { result } = renderHook(() => useDebouncedCallback(mockFn, 300));

			act(() => {
				result.current();
			});

			act(() => {
				vi.advanceTimersByTime(200);
			});

			act(() => {
				result.current();
			});

			act(() => {
				vi.advanceTimersByTime(200);
			});

			expect(mockFn).not.toHaveBeenCalled();

			act(() => {
				vi.advanceTimersByTime(100);
			});

			expect(mockFn).toHaveBeenCalledTimes(1);
		});
	});

	describe('edge cases', () => {
		it('should handle function with no arguments', () => {
			const mockFn = vi.fn();
			const { result } = renderHook(() => useDebouncedCallback(mockFn, 100));

			act(() => {
				result.current();
			});

			act(() => {
				vi.advanceTimersByTime(100);
			});

			expect(mockFn).toHaveBeenCalled();
		});

		it('should handle complex arguments', () => {
			const mockFn = vi.fn();
			const { result } = renderHook(() => useDebouncedCallback(mockFn, 100));
			const complexArg = { nested: { value: 123 }, arr: [1, 2, 3] };

			act(() => {
				result.current(complexArg);
			});

			act(() => {
				vi.advanceTimersByTime(100);
			});

			expect(mockFn).toHaveBeenCalledWith(complexArg);
		});
	});
});
