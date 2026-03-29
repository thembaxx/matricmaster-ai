'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getOfflineProgress, saveOfflineProgress, syncOfflineProgress } from '@/lib/offlineStorage';
import type { QuizSession } from '@/services/offlineQuizSync';
import {
	getAllPendingSessions,
	registerOnlineListener,
	syncAllPendingData,
} from '@/services/offlineQuizSync';
import { useOfflineStore } from '@/stores/useOfflineStore';

interface SyncState {
	isSyncing: boolean;
	lastSyncTime: Date | null;
	pendingItems: number;
	hasConflicts: boolean;
}

interface BackupState {
	quizProgress: QuizSession | null;
	flashcardReviews: Array<{
		cardId: string;
		reviewed: boolean;
		confidence: 'easy' | 'medium' | 'hard';
		reviewedAt: string;
	}>;
	studySessionData: Record<string, unknown>;
	timestamp: number;
}

const SYNC_INTERVAL = 30000;
const BACKUP_BEFORE_AUTH_THRESHOLD = 5000;

export function useOfflineSync() {
	const { isOnline, setOnlineStatus } = useOfflineStore();
	const [syncState, setSyncState] = useState<SyncState>({
		isSyncing: false,
		lastSyncTime: null,
		pendingItems: 0,
		hasConflicts: false,
	});

	const [isBackingUp, setIsBackingUp] = useState(false);
	const lastBackupRef = useRef<number>(0);
	const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

	const backupCurrentState = useCallback(async () => {
		setIsBackingUp(true);
		try {
			const backup: BackupState = {
				quizProgress: null,
				flashcardReviews: [],
				studySessionData: {},
				timestamp: Date.now(),
			};

			const pendingSessions = await getAllPendingSessions();
			if (pendingSessions.length > 0) {
				backup.quizProgress = pendingSessions[0];
			}

			const offlineProgress = getOfflineProgress();
			if (offlineProgress) {
				backup.flashcardReviews = offlineProgress.flashcardReviews || [];
				backup.studySessionData = offlineProgress.studySessionData || {};
			}

			saveOfflineProgress(backup);

			lastBackupRef.current = Date.now();
			console.debug('State backed up successfully');
		} catch (error) {
			console.error('Failed to backup state:', error);
		} finally {
			setIsBackingUp(false);
		}
	}, []);

	const restoreState = useCallback(async (): Promise<BackupState | null> => {
		try {
			const backup = getOfflineProgress();
			if (backup) {
				const age = Date.now() - backup.timestamp;
				if (age < BACKUP_BEFORE_AUTH_THRESHOLD) {
					return backup;
				}
			}
			return null;
		} catch (error) {
			console.error('Failed to restore state:', error);
			return null;
		}
	}, []);

	const syncPendingData = useCallback(async () => {
		if (!isOnline) {
			return;
		}

		setSyncState((prev) => ({ ...prev, isSyncing: true }));

		try {
			const pendingSessions = await getAllPendingSessions();
			setSyncState((prev) => ({ ...prev, pendingItems: pendingSessions.length }));

			if (pendingSessions.length > 0) {
				const result = await syncAllPendingData();
				setSyncState((prev) => ({
					...prev,
					lastSyncTime: new Date(),
					pendingItems: pendingSessions.length - result.synced,
				}));

				if (result.synced > 0) {
					toast.success(`Synced ${result.synced} item(s) successfully`);
				}

				if (result.failed > 0) {
					toast.error(`Failed to sync ${result.failed} item(s)`);
				}
			}

			await syncOfflineProgress();
		} catch (error) {
			console.error('Sync failed:', error);
		} finally {
			setSyncState((prev) => ({ ...prev, isSyncing: false }));
		}
	}, [isOnline]);

	const queueQuizAttempt = useCallback(
		async (sessionId: string, quizId: string, subject: string, answers: unknown[]) => {
			try {
				await saveOfflineProgress({
					quizProgress: {
						id: sessionId,
						quizId,
						subject,
						answers: answers as never[],
						currentQuestionIndex: 0,
						startedAt: new Date().toISOString(),
						lastUpdatedAt: new Date().toISOString(),
						completed: false,
					},
					flashcardReviews: [],
					studySessionData: {},
					timestamp: Date.now(),
				});
			} catch (error) {
				console.error('Failed to queue quiz attempt:', error);
			}
		},
		[]
	);

	const syncWhenOnline = useCallback(async () => {
		if (!isOnline) {
			toast.info('Waiting for connection...');
			return;
		}

		await syncPendingData();
	}, [syncPendingData, isOnline]);

	useEffect(() => {
		const handleOnline = () => {
			setOnlineStatus(true);
			syncPendingData();
			toast.success('Back online! Syncing your progress...');
		};

		const handleOffline = () => {
			setOnlineStatus(false);
			backupCurrentState();
			toast.info('You are offline. Your progress will be saved locally.');
		};

		const cleanup = registerOnlineListener((online) => {
			if (online) {
				handleOnline();
			} else {
				handleOffline();
			}
		});

		syncIntervalRef.current = setInterval(() => {
			if (isOnline) {
				syncPendingData();
			}
		}, SYNC_INTERVAL);

		if (navigator.onLine !== isOnline) {
			setOnlineStatus(navigator.onLine);
		}

		if (navigator.onLine) {
			syncPendingData();
		}

		return () => {
			cleanup();
			if (syncIntervalRef.current) {
				clearInterval(syncIntervalRef.current);
			}
		};
	}, [isOnline, setOnlineStatus, syncPendingData, backupCurrentState]);

	return {
		isOnline,
		syncState,
		isBackingUp,
		syncPendingData,
		backupCurrentState,
		restoreState,
		queueQuizAttempt,
		syncWhenOnline,
	};
}
