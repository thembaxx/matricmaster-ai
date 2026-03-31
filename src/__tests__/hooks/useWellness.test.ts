import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useShouldShowCheckIn } from '@/hooks/useWellness';

describe('useShouldShowCheckIn', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should not show check-in initially', () => {
		vi.setSystemTime(new Date('2024-01-01T12:00:00').getTime());
		const { result } = renderHook(() => useShouldShowCheckIn());

		expect(result.current.shouldShow).toBe(false);
		expect(result.current.reason).toBe(null);
	});

	it('should show check-in after consecutive wrong threshold', () => {
		vi.setSystemTime(new Date('2024-01-01T12:00:00').getTime());
		const { result } = renderHook(() => useShouldShowCheckIn());

		act(() => {
			result.current.incrementWrong();
		});
		act(() => {
			result.current.incrementWrong();
		});
		act(() => {
			result.current.incrementWrong();
		});
		act(() => {
			result.current.incrementWrong();
		});
		act(() => {
			result.current.incrementWrong();
		});

		expect(result.current.shouldShow).toBe(true);
		expect(result.current.reason).toBe('consecutive_wrong');
		expect(result.current.consecutiveWrong).toBe(5);
	});

	it('should reset consecutive wrong count', () => {
		vi.setSystemTime(new Date('2024-01-01T12:00:00').getTime());
		const { result } = renderHook(() => useShouldShowCheckIn());

		act(() => {
			result.current.incrementWrong();
		});
		act(() => {
			result.current.incrementWrong();
		});

		expect(result.current.consecutiveWrong).toBe(2);

		act(() => {
			result.current.resetWrong();
		});

		expect(result.current.consecutiveWrong).toBe(0);
	});

	it('should start a new session', () => {
		vi.setSystemTime(new Date('2024-01-01T12:00:00').getTime());
		const { result } = renderHook(() => useShouldShowCheckIn());

		act(() => {
			result.current.startSession();
		});

		expect(result.current.studyDuration).toBe(0);
	});

	it('should increment check-ins this session', () => {
		vi.setSystemTime(new Date('2024-01-01T12:00:00').getTime());
		const { result } = renderHook(() => useShouldShowCheckIn());

		act(() => {
			result.current.dismissCheckIn();
		});

		expect(result.current.shouldShow).toBe(false);
	});

	it('should track consecutive wrong answers', () => {
		vi.setSystemTime(new Date('2024-01-01T12:00:00').getTime());
		const { result } = renderHook(() => useShouldShowCheckIn());

		expect(result.current.consecutiveWrong).toBe(0);

		act(() => {
			result.current.incrementWrong();
		});

		expect(result.current.consecutiveWrong).toBe(1);

		act(() => {
			result.current.incrementWrong();
		});

		expect(result.current.consecutiveWrong).toBe(2);
	});
});
