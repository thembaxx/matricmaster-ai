'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

export type TimerMode = 'focus' | 'short-break' | 'long-break';

export interface TimerConfig {
	focusDuration?: number;
	shortBreakDuration?: number;
	longBreakDuration?: number;
	longBreakInterval?: number;
	autoStartBreaks?: boolean;
	autoStartFocus?: boolean;
	onComplete?: (mode: TimerMode, completedCycles: number) => void;
}

export interface UseTimerReturn {
	timeRemaining: number;
	totalTime: number;
	isRunning: boolean;
	mode: TimerMode;
	cycles: number;
	progress: number;
	start: () => void;
	pause: () => void;
	resume: () => void;
	reset: () => void;
	skip: () => void;
	setMode: (mode: TimerMode) => void;
	setCustomTime: (seconds: number) => void;
	addTime: (seconds: number) => void;
	formatTime: (seconds?: number) => string;
}

const DEFAULT_CONFIG: Required<TimerConfig> = {
	focusDuration: 25 * 60,
	shortBreakDuration: 5 * 60,
	longBreakDuration: 15 * 60,
	longBreakInterval: 4,
	autoStartBreaks: false,
	autoStartFocus: false,
	onComplete: () => {},
};

export function useTimer(config: TimerConfig = {}): UseTimerReturn {
	const fullConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);

	const getDuration = useCallback(
		(mode: TimerMode): number => {
			switch (mode) {
				case 'focus':
					return fullConfig.focusDuration;
				case 'short-break':
					return fullConfig.shortBreakDuration;
				case 'long-break':
					return fullConfig.longBreakDuration;
			}
		},
		[fullConfig]
	);

	const [mode, setModeState] = useState<TimerMode>('focus');
	const [timeRemaining, setTimeRemaining] = useState(fullConfig.focusDuration);
	const [totalTime, setTotalTime] = useState(fullConfig.focusDuration);
	const [isRunning, setIsRunning] = useState(false);
	const [cycles, setCycles] = useState(0);

	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const modeRef = useRef(mode);
	const cyclesRef = useRef(cycles);
	const fullConfigRef = useRef(fullConfig);
	const isRunningRef = useRef(isRunning);
	modeRef.current = mode;
	cyclesRef.current = cycles;
	fullConfigRef.current = fullConfig;
	isRunningRef.current = isRunning;

	const clearTimer = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	}, []);

	const handleCompleteRef = useRef<() => void>(() => {});

	const start = useCallback(() => {
		setIsRunning(true);
	}, []);

	const pause = useCallback(() => {
		setIsRunning(false);
	}, []);

	const resume = useCallback(() => {
		setIsRunning(true);
	}, []);

	const reset = useCallback(() => {
		clearTimer();
		setIsRunning(false);
		setTimeRemaining(getDuration(mode));
		setTotalTime(getDuration(mode));
	}, [clearTimer, getDuration, mode]);

	const skip = useCallback(() => {
		clearTimer();
		setIsRunning(false);
		handleCompleteRef.current();
	}, [clearTimer]);

	const setMode = useCallback(
		(newMode: TimerMode) => {
			clearTimer();
			setIsRunning(false);
			setModeState(newMode);
			const duration = getDuration(newMode);
			setTimeRemaining(duration);
			setTotalTime(duration);
		},
		[clearTimer, getDuration]
	);

	const setCustomTime = useCallback((seconds: number) => {
		setTimeRemaining(seconds);
		setTotalTime(seconds);
	}, []);

	const addTime = useCallback((seconds: number) => {
		setTimeRemaining((prev) => Math.max(0, prev + seconds));
	}, []);

	const formatTime = useCallback(
		(seconds?: number): string => {
			const time = seconds ?? timeRemaining;
			const mins = Math.floor(time / 60);
			const secs = time % 60;
			return `${mins}:${secs.toString().padStart(2, '0')}`;
		},
		[timeRemaining]
	);

	const handleComplete = useCallback(() => {
		clearTimer();
		setIsRunning(false);

		const currentMode = modeRef.current;
		const completedCycles = currentMode === 'focus' ? cyclesRef.current + 1 : cyclesRef.current;
		if (currentMode === 'focus') {
			setCycles((c) => c + 1);
		}

		fullConfigRef.current.onComplete?.(currentMode, completedCycles);

		const localGetDuration = getDuration;
		const localFullConfig = fullConfigRef.current;

		if (currentMode === 'focus') {
			const isLongBreak = (cyclesRef.current + 1) % localFullConfig.longBreakInterval === 0;
			const nextMode: TimerMode = isLongBreak ? 'long-break' : 'short-break';
			const nextDuration = localGetDuration(nextMode);

			setModeState(nextMode);
			setTimeRemaining(nextDuration);
			setTotalTime(nextDuration);

			if (localFullConfig.autoStartBreaks) {
				setTimeout(() => setIsRunning(true), 100);
			}
		} else {
			setModeState('focus');
			const focusDuration = localGetDuration('focus');
			setTimeRemaining(focusDuration);
			setTotalTime(focusDuration);

			if (localFullConfig.autoStartFocus) {
				setTimeout(() => setIsRunning(true), 100);
			}
		}
	}, [clearTimer, getDuration]);

	handleCompleteRef.current = handleComplete;

	const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;

	if (isRunning && !intervalRef.current) {
		intervalRef.current = setInterval(() => {
			setTimeRemaining((prev) => {
				if (prev <= 1) {
					clearTimer();
					setIsRunning(false);
					handleCompleteRef.current();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	} else if (!isRunning && intervalRef.current) {
		clearTimer();
	}

	return {
		timeRemaining,
		totalTime,
		isRunning,
		mode,
		cycles,
		progress,
		start,
		pause,
		resume,
		reset,
		skip,
		setMode,
		setCustomTime,
		addTime,
		formatTime,
	};
}
