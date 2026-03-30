import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTimer } from '@/hooks/use-timer';

describe('useTimer', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should initialize with default focus duration', () => {
		const { result } = renderHook(() => useTimer());
		expect(result.current.timeRemaining).toBe(25 * 60);
		expect(result.current.mode).toBe('focus');
		expect(result.current.isRunning).toBe(false);
	});

	it('should start the timer', () => {
		const { result } = renderHook(() => useTimer());

		act(() => {
			result.current.start();
		});

		expect(result.current.isRunning).toBe(true);
	});

	it('should pause the timer', () => {
		const { result } = renderHook(() => useTimer());

		act(() => {
			result.current.start();
		});

		expect(result.current.isRunning).toBe(true);

		act(() => {
			result.current.pause();
		});

		expect(result.current.isRunning).toBe(false);
	});

	it('should resume the timer', () => {
		const { result } = renderHook(() => useTimer());

		act(() => {
			result.current.start();
		});

		act(() => {
			result.current.pause();
		});

		expect(result.current.isRunning).toBe(false);

		act(() => {
			result.current.resume();
		});

		expect(result.current.isRunning).toBe(true);
	});

	it('should reset the timer to current mode duration', () => {
		const { result } = renderHook(() => useTimer());

		act(() => {
			result.current.start();
		});

		act(() => {
			result.current.reset();
		});

		expect(result.current.isRunning).toBe(false);
		expect(result.current.timeRemaining).toBe(25 * 60);
	});

	it('should format time correctly', () => {
		const { result } = renderHook(() => useTimer());

		expect(result.current.formatTime(0)).toBe('0:00');
		expect(result.current.formatTime(65)).toBe('1:05');
		expect(result.current.formatTime(125)).toBe('2:05');
		expect(result.current.formatTime(600)).toBe('10:00');
		expect(result.current.formatTime(3600)).toBe('60:00');
	});

	it('should use timeRemaining when no argument provided', () => {
		const { result } = renderHook(() => useTimer());
		expect(result.current.formatTime()).toBe('25:00');
	});

	it('should set custom time', () => {
		const { result } = renderHook(() => useTimer());

		act(() => {
			result.current.setCustomTime(120);
		});

		expect(result.current.timeRemaining).toBe(120);
		expect(result.current.totalTime).toBe(120);
	});

	it('should add time to timer', () => {
		const { result } = renderHook(() => useTimer());

		act(() => {
			result.current.addTime(60);
		});

		expect(result.current.timeRemaining).toBe(25 * 60 + 60);
	});

	it('should not add negative time below zero', () => {
		const { result } = renderHook(() => useTimer());

		act(() => {
			result.current.setCustomTime(500);
		});

		act(() => {
			result.current.addTime(-1000);
		});

		expect(result.current.timeRemaining).toBe(0);
	});

	it('should set timer mode', () => {
		const { result } = renderHook(() => useTimer());

		act(() => {
			result.current.setMode('short-break');
		});

		expect(result.current.mode).toBe('short-break');
		expect(result.current.timeRemaining).toBe(5 * 60);
	});

	it('should calculate progress correctly', () => {
		const { result } = renderHook(() => useTimer());

		act(() => {
			result.current.setCustomTime(100);
		});

		act(() => {
			result.current.addTime(-50);
		});

		expect(result.current.progress).toBe(50);
	});

	it('should track cycles', () => {
		const { result } = renderHook(() => useTimer());

		expect(result.current.cycles).toBe(0);
	});

	it('should use custom config', () => {
		const { result } = renderHook(() =>
			useTimer({
				focusDuration: 30 * 60,
				shortBreakDuration: 3 * 60,
			})
		);

		expect(result.current.timeRemaining).toBe(30 * 60);

		act(() => {
			result.current.setMode('short-break');
		});

		expect(result.current.timeRemaining).toBe(3 * 60);
	});

	it('should skip to next mode', () => {
		const { result } = renderHook(() => useTimer());

		act(() => {
			result.current.start();
		});

		act(() => {
			result.current.skip();
		});

		expect(result.current.isRunning).toBe(false);
	});
});
