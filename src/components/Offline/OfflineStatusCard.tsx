'use client';

import {
	CheckmarkCircle02Icon,
	Delete02Icon,
	Download01Icon,
	GlobeIcon,
	HardDriveIcon,
	RotateClockwiseIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { formatDistanceToNow } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
	cacheLessons,
	clearOldCache,
	formatBytes,
	getCacheStats,
	getStorageUsage,
	isLessonCached,
} from '@/lib/offline/offline-cache';
import { useOfflineStore } from '@/stores/useOfflineStore';

interface SubjectDownloadStatus {
	id: number;
	name: string;
	isCached: boolean;
	isDownloading: boolean;
	downloadProgress: number;
}

const SUBJECTS = [
	{ id: 1, name: 'Mathematics', key: 'mathematics' },
	{ id: 2, name: 'Physical Sciences', key: 'physical_sciences' },
	{ id: 3, name: 'Life Sciences', key: 'life_sciences' },
	{ id: 4, name: 'Accounting', key: 'accounting' },
	{ id: 5, name: 'Geography', key: 'geography' },
	{ id: 6, name: 'Business Studies', key: 'business_studies' },
	{ id: 7, name: 'History', key: 'history' },
	{ id: 8, name: 'Economics', key: 'economics' },
	{ id: 9, name: 'English', key: 'english' },
	{ id: 10, name: 'Life Orientation', key: 'life_orientation' },
];

export function OfflineStatusCard() {
	const { isOnline, lastSynced, setOnlineStatus } = useOfflineStore();
	const [storageUsage, setStorageUsage] = useState<{
		used: number;
		total: number;
		percentage: number;
	} | null>(null);
	const [cacheStats, setCacheStats] = useState<{
		lessonCount: number;
		paperCount: number;
		quizCount: number;
		aiResponseCount: number;
	} | null>(null);
	const [subjectStatuses, setSubjectStatuses] = useState<SubjectDownloadStatus[]>(() =>
		SUBJECTS.map((s) => ({ ...s, isCached: false, isDownloading: false, downloadProgress: 0 }))
	);
	const [isClearing, setIsClearing] = useState(false);

	const refreshStorageInfo = useCallback(async () => {
		try {
			const usage = await getStorageUsage();
			setStorageUsage(usage);
			const stats = await getCacheStats();
			setCacheStats(stats);

			const updatedStatuses = await Promise.all(
				SUBJECTS.map(async (s) => {
					const cached = await isLessonCached(s.id);
					return { ...s, isCached: cached, isDownloading: false, downloadProgress: 0 };
				})
			);
			setSubjectStatuses(updatedStatuses);
		} catch (error) {
			console.debug('Failed to refresh storage info:', error);
		}
	}, []);

	useEffect(() => {
		const handleOnline = () => setOnlineStatus(true);
		const handleOffline = () => setOnlineStatus(false);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);
		setOnlineStatus(navigator.onLine);

		refreshStorageInfo();

		const interval = setInterval(refreshStorageInfo, 30000);
		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
			clearInterval(interval);
		};
	}, [setOnlineStatus, refreshStorageInfo]);

	const handleDownloadSubject = async (subjectId: number) => {
		setSubjectStatuses((prev) =>
			prev.map((s) => (s.id === subjectId ? { ...s, isDownloading: true, downloadProgress: 0 } : s))
		);

		try {
			await cacheLessons(subjectId);

			for (let i = 0; i <= 100; i += 10) {
				await new Promise((r) => setTimeout(r, 50));
				setSubjectStatuses((prev) =>
					prev.map((s) => (s.id === subjectId ? { ...s, downloadProgress: i } : s))
				);
			}

			setSubjectStatuses((prev) =>
				prev.map((s) => (s.id === subjectId ? { ...s, isCached: true, isDownloading: false } : s))
			);
			await refreshStorageInfo();
		} catch (error) {
			console.error('Failed to download lessons:', error);
			setSubjectStatuses((prev) =>
				prev.map((s) =>
					s.id === subjectId ? { ...s, isDownloading: false, downloadProgress: 0 } : s
				)
			);
		}
	};

	const handleClearCache = async () => {
		setIsClearing(true);
		try {
			await clearOldCache();
			await refreshStorageInfo();
		} catch (error) {
			console.error('Failed to clear cache:', error);
		}
		setIsClearing(false);
	};

	return (
		<div className="space-y-4">
			<Card className="bg-gradient-to-br from-brand-blue/5 to-brand-purple/5 border-brand-blue/20">
				<CardHeader className="pb-2">
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2 text-base">
							{isOnline ? (
								<HugeiconsIcon icon={Download01Icon} className="w-5 h-5 text-green-500" />
							) : (
								<HugeiconsIcon icon={GlobeIcon} className="w-5 h-5 text-orange-500" />
							)}
							{isOnline ? 'Online' : 'Offline Mode'}
						</CardTitle>
						{lastSynced && (
							<span className="text-xs text-muted-foreground">
								Synced {formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}
							</span>
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-3">
					{storageUsage && (
						<div className="space-y-2">
							<div className="flex justify-between text-xs">
								<span className="flex items-center gap-1">
									<HugeiconsIcon icon={HardDriveIcon} className="w-3 h-3" />
									Storage Used
								</span>
								<span className="text-muted-foreground">
									{formatBytes(storageUsage.used)} / {formatBytes(storageUsage.total)}
								</span>
							</div>
							<Progress
								value={storageUsage.percentage}
								className="h-2"
								indicatorClassName={
									storageUsage.percentage > 80
										? 'bg-red-500'
										: storageUsage.percentage > 50
											? 'bg-orange-500'
											: 'bg-brand-blue'
								}
							/>
						</div>
					)}

					{cacheStats && (
						<div className="grid grid-cols-2 gap-2 text-xs">
							<div className="bg-background/50 rounded-lg p-2">
								<div className="text-muted-foreground">Lessons</div>
								<div className="font-bold">{cacheStats.lessonCount}</div>
							</div>
							<div className="bg-background/50 rounded-lg p-2">
								<div className="text-muted-foreground">Papers</div>
								<div className="font-bold">{cacheStats.paperCount}</div>
							</div>
							<div className="bg-background/50 rounded-lg p-2">
								<div className="text-muted-foreground">Quizzes</div>
								<div className="font-bold">{cacheStats.quizCount}</div>
							</div>
							<div className="bg-background/50 rounded-lg p-2">
								<div className="text-muted-foreground">AI Cache</div>
								<div className="font-bold">{cacheStats.aiResponseCount}</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-base">Download for Offline</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{subjectStatuses.map((subject) => (
						<div
							key={subject.id}
							className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
						>
							<div className="flex items-center gap-3">
								{subject.isCached ? (
									<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-green-500" />
								) : subject.isDownloading ? (
									<HugeiconsIcon
										icon={RotateClockwiseIcon}
										className="w-5 h-5 text-brand-blue animate-spin"
									/>
								) : (
									<HugeiconsIcon icon={GlobeIcon} className="w-5 h-5 text-muted-foreground" />
								)}
								<span className="text-sm font-medium">{subject.name}</span>
							</div>
							<Button
								size="sm"
								variant={subject.isCached ? 'ghost' : 'outline'}
								disabled={subject.isCached || subject.isDownloading || !isOnline}
								onClick={() => handleDownloadSubject(subject.id)}
								className="text-xs h-8"
							>
								{subject.isDownloading
									? `${subject.downloadProgress}%`
									: subject.isCached
										? 'Cached'
										: 'Download'}
							</Button>
						</div>
					))}
				</CardContent>
			</Card>

			<Button
				variant="destructive"
				className="w-full gap-2"
				onClick={handleClearCache}
				disabled={isClearing}
			>
				<HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" />
				{isClearing ? 'Clearing...' : 'Clear Old Cache'}
			</Button>
		</div>
	);
}
