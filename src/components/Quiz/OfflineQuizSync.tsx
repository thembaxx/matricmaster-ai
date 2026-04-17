'use client';

import { useEffect, useState } from 'react';
import { syncOfflineQuizzes } from '@/actions/sync/offline-quiz-sync';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { OfflineQuizResult } from '@/lib/sync/offline-quiz-store';
import { getPendingQuizzes } from '@/lib/sync/offline-quiz-store';

interface OfflineQuizSyncProps {
	onSyncComplete?: (synced: number, failed: number) => void;
}

export function OfflineQuizSync({ onSyncComplete }: OfflineQuizSyncProps) {
	const [pendingQuizzes, setPendingQuizzes] = useState<OfflineQuizResult[]>([]);
	const [isOnline, setIsOnline] = useState(true);
	const [isSyncing, setIsSyncing] = useState(false);
	const [syncProgress, setSyncProgress] = useState(0);
	const [syncResult, setSyncResult] = useState<{ synced: number; failed: number } | null>(null);

	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		setIsOnline(navigator.onLine);
		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		loadPendingQuizzes();

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, [loadPendingQuizzes]);

	async function loadPendingQuizzes() {
		try {
			const quizzes = await getPendingQuizzes();
			setPendingQuizzes(quizzes);
		} catch (error) {
			console.error('Failed to load pending quizzes:', error);
		}
	}

	async function handleSync() {
		if (!isOnline || isSyncing) return;

		setIsSyncing(true);
		setSyncProgress(0);
		setSyncResult(null);

		try {
			const result = await syncOfflineQuizzes();
			setSyncResult({ synced: result.synced, failed: result.failed });
			setSyncProgress(100);
			onSyncComplete?.(result.synced, result.failed);
			await loadPendingQuizzes();
		} catch (error) {
			console.error('Sync failed:', error);
			setSyncResult({ synced: 0, failed: pendingQuizzes.length });
		} finally {
			setIsSyncing(false);
		}
	}

	if (pendingQuizzes.length === 0) {
		return null;
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-sm">
					<svg
						className="h-4 w-4 text-amber-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
						/>
					</svg>
					Offline Quiz Results
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between text-xs">
					<span className="text-muted-foreground">
						{pendingQuizzes.length} quiz{pendingQuizzes.length !== 1 ? 'zes' : ''} pending sync
					</span>
					<span className={isOnline ? 'text-green-600' : 'text-amber-600'}>
						{isOnline ? 'Online' : 'Offline'}
					</span>
				</div>

				{syncResult && (
					<div className="rounded-lg bg-muted/50 p-3 text-xs">
						<div className="flex items-center gap-2">
							{syncResult.failed === 0 ? (
								<svg
									className="h-4 w-4 text-green-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							) : (
								<svg
									className="h-4 w-4 text-amber-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
							)}
							<span>
								{syncResult.synced} synced
								{syncResult.failed > 0 && `, ${syncResult.failed} failed`}
							</span>
						</div>
					</div>
				)}

				{isSyncing && <Progress value={syncProgress} className="h-2" />}

				<Button
					onClick={handleSync}
					disabled={!isOnline || isSyncing}
					className="w-full text-xs"
					size="sm"
				>
					{isSyncing ? (
						<>
							<svg className="mr-2 h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
								/>
							</svg>
							Syncing...
						</>
					) : !isOnline ? (
						'Offline - Connect to sync'
					) : (
						'Sync Now'
					)}
				</Button>
			</CardContent>
		</Card>
	);
}

export default OfflineQuizSync;
