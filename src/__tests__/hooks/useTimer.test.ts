import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type TimerConfig, useTimer } from '@/hooks/use-timer';

describe('useTimer', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	describe('initialization with default values', () => {
		it('should initialize with default focus mode values', () => {
			const { result } = renderHook(() => useTimer());

			expect(result.current.mode).toBe('focus');
			expect(result.current.timeRemaining).toBe(25 * 60);
			expect(result.current.totalTime).toBe(25 * 60);
			expect(result.current.isRunning).toBe(false);
			expect(result.current.cycles).toBe(0);
			expect(result.current.progress).toBe(0);
		});

		it('should initialize with custom config values', () => {
			const config: TimerConfig = {
				focusDuration: 30 * 60,
				shortBreakDuration: 10 * 60,
				longBreakDuration: 20 * 60,
				longBreakInterval: 3,
			};

			const { result } = renderHook(() => useTimer(config));

			expect(result.current.timeRemaining).toBe(30 * 60);
			expect(result.current.totalTime).toBe(30 * 60);
			expect(result.current.mode).toBe('focus');
		});
	});

	describe('start, pause, resume functions', () => {
		it('should start the timer', () => {
			const { result } = renderHook(() => useTimer());

			act(() => result.current.start());

			expect(result.current.isRunning).toBe(true);
		});

		it('should pause the timer', () => {
			const { result } = renderHook(() => useTimer());

			act(() => result.current.start());
			act(() => result.current.pause());

			expect(result.current.isRunning).toBe(false);
		});

		it('should resume the timer', () => {
			const { result } = renderHook(() => useTimer());

			act(() => result.current.start());
			act(() => result.current.pause());
			act(() => result.current.resume());

			expect(result.current.isRunning).toBe(true);
		});
	});

	describe('reset function', () => {
		it('should reset timer to current mode duration', () => {
			const { result } = renderHook(() => useTimer());

			act(() => result.current.start());
			act(() => {
				vi.advanceTimersByTime(5000);
			});
			act(() => result.current.reset());

			expect(result.current.isRunning).toBe(false);
			expect(result.current.timeRemaining).toBe(25 * 60);
		});

		it('should reset to correct duration after mode change', () => {
			const { result } = renderHook(() => useTimer());

			act(() => result.current.setMode('short-break'));
			act(() => result.current.start());
			act(() => result.current.reset());

			expect(result.current.mode).toBe('short-break');
			expect(result.current.timeRemaining).toBe(5 * 60);
		});
	});

	describe('time formatting', () => {
		it('should format time correctly with default parameter', () => {
			const { result } = renderHook(() => useTimer());

			expect(result.current.formatTime()).toBe('25:00');
		});

		it('should format time correctly with custom seconds', () => {
			const { result } = renderHook(() => useTimer());

			expect(result.current.formatTime(90)).toBe('1:30');
			expect(result.current.formatTime(65)).toBe('1:05');
			expect(result.current.formatTime(0)).toBe('0:00');
		});

		it('should pad single digit seconds with zero', () => {
			const { result } = renderHook(() => useTimer());

			expect(result.current.formatTime(61)).toBe('1:01');
		});
	});

	describe('custom time setting', () => {
		it('should set custom time', () => {
			const { result } = renderHook(() => useTimer());

			act(() => result.current.setCustomTime(1800));

			expect(result.current.timeRemaining).toBe(1800);
			expect(result.current.totalTime).toBe(1800);
		});

		it('should add time to remaining', () => {
			const { result } = renderHook(() => useTimer());

			act(() => result.current.addTime(60));

			expect(result.current.timeRemaining).toBe(25 * 60 + 60);
		});

		it('should not add negative time below zero', () => {
			const { result } = renderHook(() => useTimer());

			act(() => result.current.addTime(-30 * 60));

			expect(result.current.timeRemaining).toBe(0);
		});
	});

	describe('mode switching', () => {
		it('should switch to short-break mode', () => {
			const { result } = renderHook(() => useTimer());

			act(() => result.current.setMode('short-break'));

			expect(result.current.mode).toBe('short-break');
			expect(result.current.timeRemaining).toBe(5 * 60);
			expect(result.current.totalTime).toBe(5 * 60);
			expect(result.current.isRunning).toBe(false);
		});

		it('should switch to long-break mode', () => {
			const { result } = renderHook(() => useTimer());

			act(() => result.current.setMode('long-break'));

			expect(result.current.mode).toBe('long-break');
			expect(result.current.timeRemaining).toBe(15 * 60);
			expect(result.current.totalTime).toBe(15 * 60);
		});

		it('should switch back to focus mode', () => {
			const { result } = renderHook(() => useTimer());

			act(() => result.current.setMode('short-break'));
			act(() => result.current.setMode('focus'));

			expect(result.current.mode).toBe('focus');
			expect(result.current.timeRemaining).toBe(25 * 60);
		});
	});

	describe('cycle counting', () => {
		it('should start with zero cycles', () => {
			const { result } = renderHook(() => useTimer());

			expect(result.current.cycles).toBe(0);
		});

		it('should increment cycles after focus completion', () => {
			const onComplete = vi.fn();
			const { result } = renderHook(() => useTimer({ onComplete, autoStartBreaks: false }));

			act(() => result.current.start());

			act(() => {
				vi.advanceTimersByTime(25 * 60 * 1000);
			});

			expect(result.current.cycles).toBe(1);
		});
	});

	describe('progress calculation', () => {
		it('should calculate progress as zero when not started', () => {
			const { result } = renderHook(() => useTimer());

			expect(result.current.progress).toBe(0);
		});

		it('should calculate progress correctly after interval tick', () => {
			const { result } = renderHook(() => useTimer({ focusDuration: 100 }));

			act(() => result.current.start());

			act(() => {
				vi.advanceTimersByTime(1001);
			});

			expect(result.current.progress).toBeGreaterThan(0);
		});
	});

	describe('skip function', () => {
		it('should skip and stop timer', () => {
			const onComplete = vi.fn();
			const { result } = renderHook(() => useTimer({ onComplete, autoStartBreaks: false }));

			act(() => result.current.start());
			act(() => result.current.skip());

			expect(result.current.isRunning).toBe(false);
			expect(onComplete).toHaveBeenCalled();
		});

		it('should call onComplete with correct parameters on skip (cycles incremented first)', () => {
			const onComplete = vi.fn();
			const { result } = renderHook(() => useTimer({ onComplete, autoStartBreaks: false }));

			act(() => result.current.start());
			act(() => result.current.skip());

			expect(onComplete).toHaveBeenCalledWith('focus', 1);
		});
	});

	describe('auto-start behavior', () => {
		it('should switch to break mode after focus completes', () => {
			const { result } = renderHook(() => useTimer({ autoStartBreaks: true }));

			act(() => result.current.start());

			act(() => {
				vi.advanceTimersByTime(25 * 60 * 1000 + 100);
			});

			expect(result.current.mode).toBe('short-break');
		});
	});

	describe('long break interval', () => {
		it('should increment cycles correctly', () => {
			const { result } = renderHook(() =>
				useTimer({ longBreakInterval: 3, autoStartBreaks: true })
			);

			for (let i = 0; i < 3; i++) {
				act(() => result.current.start());

				act(() => {
					vi.advanceTimersByTime(25 * 60 * 1000 + 100);
				});
			}

			expect(result.current.cycles).toBeGreaterThanOrEqual(2);
		});
	});

	describe('edge cases', () => {
		it('should handle zero total time', () => {
			const { result } = renderHook(() => useTimer({ focusDuration: 0 }));

			expect(result.current.progress).toBe(0);
		});

		it('should handle mode switching while running', () => {
			const { result } = renderHook(() => useTimer());

			act(() => result.current.start());
			act(() => result.current.setMode('short-break'));

			expect(result.current.isRunning).toBe(false);
			expect(result.current.mode).toBe('short-break');
		});

		it('should handle rapid start/pause', () => {
			const { result } = renderHook(() => useTimer());

			act(() => result.current.start());
			act(() => result.current.pause());
			act(() => result.current.start());
			act(() => result.current.pause());

			expect(result.current.isRunning).toBe(false);
		});
	});
});
