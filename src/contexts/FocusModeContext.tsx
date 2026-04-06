'use client';

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { toast } from 'sonner';

export type FocusModeStatus = 'inactive' | 'active' | 'paused' | 'completed' | 'exited';

export interface ExamConfig {
	paperId: string;
	paperTitle: string;
	subject: string;
	duration: number;
}

interface FocusModeContextType {
	status: FocusModeStatus;
	isActive: boolean;
	isCompleted: boolean;
	config: ExamConfig | null;
	timeRemaining: number;
	totalTime: number;
	violations: number;
	startExam: (config: ExamConfig) => void;
	pauseExam: () => void;
	resumeExam: () => void;
	completeExam: () => void;
	exitExam: () => void;
	resetExam: () => void;
}

const FOCUS_STORAGE_KEY = 'matricmaster-focus-mode';

interface PersistedState {
	status: FocusModeStatus;
	config: ExamConfig | null;
	timeRemaining: number;
	startedAt: number | null;
	violations: number;
}

function loadPersistedState(): PersistedState | null {
	if (typeof window === 'undefined') return null;
	try {
		const raw = localStorage.getItem(FOCUS_STORAGE_KEY);
		if (!raw) return null;
		const state = JSON.parse(raw) as PersistedState;

		if (state.status === 'active' && state.startedAt && state.timeRemaining > 0) {
			const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
			const adjusted = state.timeRemaining - elapsed;
			if (adjusted <= 0) {
				return { ...state, status: 'completed', timeRemaining: 0 };
			}
			return { ...state, timeRemaining: adjusted };
		}

		return state;
	} catch {
		return null;
	}
}

function persistState(state: PersistedState) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(state));
	} catch {
		// Storage full or blocked
	}
}

function clearPersistedState() {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(FOCUS_STORAGE_KEY);
}

const FocusModeContext = createContext<FocusModeContextType>({
	status: 'inactive',
	isActive: false,
	isCompleted: false,
	config: null,
	timeRemaining: 0,
	totalTime: 0,
	violations: 0,
	startExam: () => {},
	pauseExam: () => {},
	resumeExam: () => {},
	completeExam: () => {},
	exitExam: () => {},
	resetExam: () => {},
});

export function FocusModeProvider({ children }: { children: ReactNode }) {
	const [status, setStatus] = useState<FocusModeStatus>('inactive');
	const [config, setConfig] = useState<ExamConfig | null>(null);
	const [timeRemaining, setTimeRemaining] = useState(0);
	const [totalTime, setTotalTime] = useState(0);
	const [violations, setViolations] = useState(0);
	const startedAtRef = useRef<number | null>(null);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const wakeLockRef = useRef<WakeLockSentinel | null>(null);

	const isActive = status === 'active';
	const isCompleted = status === 'completed';

	const requestWakeLock = useCallback(async () => {
		if (typeof window === 'undefined' || !('wakeLock' in navigator)) return;
		try {
			wakeLockRef.current = await navigator.wakeLock.request('screen');
		} catch {
			console.debug('Wake lock not available');
		}
	}, []);

	const releaseWakeLock = useCallback(() => {
		if (wakeLockRef.current) {
			wakeLockRef.current.release().catch(() => {});
			wakeLockRef.current = null;
		}
	}, []);

	const stopTimer = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const startTimer = useCallback(() => {
		stopTimer();
		timerRef.current = setInterval(() => {
			setTimeRemaining((prev) => {
				if (prev <= 1) {
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	}, [stopTimer]);

	const syncPersist = useCallback(
		(s: FocusModeStatus, tr: number, cfg: ExamConfig | null, v: number) => {
			persistState({
				status: s,
				config: cfg,
				timeRemaining: tr,
				startedAt: s === 'active' ? startedAtRef.current : null,
				violations: v,
			});
		},
		[]
	);

	useEffect(() => {
		const persisted = loadPersistedState();
		if (persisted && persisted.status !== 'inactive') {
			setStatus(persisted.status);
			setConfig(persisted.config);
			setTimeRemaining(persisted.timeRemaining);
			setViolations(persisted.violations);
			if (persisted.config) {
				setTotalTime(persisted.config.duration * 60);
			}
			if (persisted.status === 'active') {
				startedAtRef.current = persisted.startedAt || Date.now();
				startTimer();
			}
		}
	}, [startTimer]);

	useEffect(() => {
		if (timeRemaining === 0 && status === 'active') {
			stopTimer();
			setStatus('completed');
			clearPersistedState();
			releaseWakeLock();
			toast.info("time's up!", {
				description: 'your exam session has ended.',
			});
		}
	}, [timeRemaining, status, stopTimer, releaseWakeLock]);

	// Wake lock effect - keep screen on during focus mode
	useEffect(() => {
		if (status === 'active') {
			requestWakeLock();
		} else {
			releaseWakeLock();
		}
		return () => {
			releaseWakeLock();
		};
	}, [status, requestWakeLock, releaseWakeLock]);

	useEffect(() => {
		if (status === 'active') {
			syncPersist('active', timeRemaining, config, violations);
		}
	}, [timeRemaining, status, config, violations, syncPersist]);

	useEffect(() => {
		if (status !== 'active') return;

		const handleVisibilityChange = () => {
			if (document.hidden) {
				setViolations((prev) => {
					const next = prev + 1;
					toast.warning('tab switch detected', {
						description: `this has been logged. ${next >= 3 ? 'exam will end after 3 violations.' : `violation ${next}/3.`}`,
					});
					if (next >= 3) {
						setStatus('completed');
						stopTimer();
						clearPersistedState();
					}
					return next;
				});
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
	}, [status, stopTimer]);

	useEffect(() => {
		if (status !== 'active') return;

		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			e.returnValue = 'your exam is in progress. are you sure you want to leave?';
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	}, [status]);

	useEffect(() => {
		if (status !== 'active') return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [status]);

	const startExam = useCallback(
		(cfg: ExamConfig) => {
			const seconds = cfg.duration * 60;
			setConfig(cfg);
			setTotalTime(seconds);
			setTimeRemaining(seconds);
			setViolations(0);
			setStatus('active');
			startedAtRef.current = Date.now();
			startTimer();
		},
		[startTimer]
	);

	const pauseExam = useCallback(() => {
		stopTimer();
		setStatus('paused');
		syncPersist('paused', timeRemaining, config, violations);
	}, [stopTimer, timeRemaining, config, violations, syncPersist]);

	const resumeExam = useCallback(() => {
		setStatus('active');
		startedAtRef.current = Date.now();
		startTimer();
	}, [startTimer]);

	const completeExam = useCallback(() => {
		stopTimer();
		setStatus('completed');
		clearPersistedState();
	}, [stopTimer]);

	const exitExam = useCallback(() => {
		stopTimer();
		setStatus('exited');
		clearPersistedState();
	}, [stopTimer]);

	const resetExam = useCallback(() => {
		stopTimer();
		setStatus('inactive');
		setConfig(null);
		setTimeRemaining(0);
		setTotalTime(0);
		setViolations(0);
		startedAtRef.current = null;
		clearPersistedState();
	}, [stopTimer]);

	return (
		<FocusModeContext.Provider
			value={{
				status,
				isActive,
				isCompleted,
				config,
				timeRemaining,
				totalTime,
				violations,
				startExam,
				pauseExam,
				resumeExam,
				completeExam,
				exitExam,
				resetExam,
			}}
		>
			{children}
		</FocusModeContext.Provider>
	);
}

export function useFocusModeContext() {
	return useContext(FocusModeContext);
}

export function useFocusMode() {
	const ctx = useContext(FocusModeContext);
	return {
		isFocusMode: ctx.isActive || ctx.status === 'paused',
		state: ctx.status,
		endFocusMode: ctx.resetExam,
		startFocusMode: ctx.startExam,
		completeExam: ctx.completeExam,
	};
}
