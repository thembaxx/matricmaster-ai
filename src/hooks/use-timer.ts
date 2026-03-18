'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
	const onCompleteRef = useRef(fullConfig.onComplete);

	useEffect(() => {
		onCompleteRef.current = fullConfig.onComplete;
	}, [fullConfig.onComplete]);

	const clearTimer = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	}, []);

	const handleComplete = useCallback(() => {
		clearTimer();
		setIsRunning(false);

		const completedCycles = mode === 'focus' ? cycles + 1 : cycles;
		if (mode === 'focus') {
			setCycles((c) => c + 1);
		}

		onCompleteRef.current?.(mode, completedCycles);

		if (mode === 'focus') {
			const isLongBreak = (cycles + 1) % fullConfig.longBreakInterval === 0;
			const nextMode: TimerMode = isLongBreak ? 'long-break' : 'short-break';
			const nextDuration = getDuration(nextMode);

			setModeState(nextMode);
			setTimeRemaining(nextDuration);
			setTotalTime(nextDuration);

			if (fullConfig.autoStartBreaks) {
				setTimeout(() => setIsRunning(true), 100);
			}
		} else {
			setModeState('focus');
			const focusDuration = getDuration('focus');
			setTimeRemaining(focusDuration);
			setTotalTime(focusDuration);

			if (fullConfig.autoStartFocus) {
				setTimeout(() => setIsRunning(true), 100);
			}
		}
	}, [mode, cycles, clearTimer, fullConfig, getDuration]);

	useEffect(() => {
		if (isRunning && timeRemaining > 0) {
			intervalRef.current = setInterval(() => {
				setTimeRemaining((prev) => {
					if (prev <= 1) {
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}

		return clearTimer;
	}, [isRunning, clearTimer, timeRemaining]);

	useEffect(() => {
		if (isRunning && timeRemaining === 0) {
			handleComplete();
		}
	}, [timeRemaining, isRunning, handleComplete]);

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
		handleComplete();
	}, [clearTimer, handleComplete]);

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

	const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;

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
