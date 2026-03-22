'use client';

import { ArrowLeft01Icon, Download01Icon, WifiOffIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
	CachedPapersList,
	CachedTasksList,
	StorageStatusCard,
	SubjectDownloadList,
} from '@/components/Offline/OfflinePage';
import { QuickTipsPanel } from '@/components/Offline/QuickTipsPanel';
import { Button } from '@/components/ui/button';
import {
	type CachedPaper,
	cacheLessons,
	clearOldCache,
	deleteCachedPaper,
	getCachedPastPapers,
	getStorageUsage,
	isLessonCached,
} from '@/lib/offline/offline-cache';
import { type CachedTask, getCachedTasks } from '@/lib/offline/task-cache';
import { useOfflineStore } from '@/stores/useOfflineStore';

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

interface SubjectStatus {
	id: number;
	name: string;
	isCached: boolean;
	isDownloading: boolean;
	downloadProgress: number;
}

export default function OfflinePage() {
	const { isOnline, lastSynced, setOnlineStatus } = useOfflineStore();
	const [cachedPapers, setCachedPapers] = useState<CachedPaper[]>([]);
	const [cachedTasks, setCachedTasks] = useState<CachedTask[]>([]);
	const [storageUsage, setStorageUsage] = useState<{
		used: number;
		total: number;
		percentage: number;
	} | null>(null);
	const [subjectStatuses, setSubjectStatuses] = useState<SubjectStatus[]>(() =>
		SUBJECTS.map((s) => ({ ...s, isCached: false, isDownloading: false, downloadProgress: 0 }))
	);
	const [isClearing, setIsClearing] = useState(false);

	const loadCachedPapers = useCallback(async () => {
		try {
			const papers = await getCachedPastPapers();
			setCachedPapers(papers);
		} catch (error) {
			console.debug('Failed to load cached papers:', error);
		}
	}, []);

	const loadCachedTasks = useCallback(async () => {
		try {
			const tasks = await getCachedTasks();
			setCachedTasks(tasks);
		} catch (error) {
			console.debug('Failed to load cached tasks:', error);
		}
	}, []);

	const loadStorageUsage = useCallback(async () => {
		try {
			const usage = await getStorageUsage();
			setStorageUsage(usage);
		} catch (error) {
			console.debug('Failed to load storage usage:', error);
		}
	}, []);

	const loadSubjectStatuses = useCallback(async () => {
		const updated = await Promise.all(
			SUBJECTS.map(async (s) => {
				const cached = await isLessonCached(s.id);
				return { ...s, isCached: cached, isDownloading: false, downloadProgress: 0 };
			})
		);
		setSubjectStatuses(updated);
	}, []);

	useEffect(() => {
		const handleOnline = () => setOnlineStatus(true);
		const handleOffline = () => setOnlineStatus(false);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		if (navigator.onLine !== isOnline) {
			setOnlineStatus(navigator.onLine);
		}

		loadCachedPapers();
		loadCachedTasks();
		loadStorageUsage();
		loadSubjectStatuses();

		const interval = setInterval(() => {
			loadStorageUsage();
			loadCachedTasks();
		}, 30000);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
			clearInterval(interval);
		};
	}, [
		setOnlineStatus,
		isOnline,
		loadCachedPapers,
		loadCachedTasks,
		loadStorageUsage,
		loadSubjectStatuses,
	]);

	const handleDownloadSubject = async (subjectId: number) => {
		setSubjectStatuses((prev) =>
			prev.map((s) => (s.id === subjectId ? { ...s, isDownloading: true, downloadProgress: 0 } : s))
		);

		try {
			await cacheLessons(subjectId);

			for (let i = 0; i <= 100; i += 20) {
				await new Promise((r) => setTimeout(r, 100));
				setSubjectStatuses((prev) =>
					prev.map((s) => (s.id === subjectId ? { ...s, downloadProgress: i } : s))
				);
			}

			setSubjectStatuses((prev) =>
				prev.map((s) => (s.id === subjectId ? { ...s, isCached: true, isDownloading: false } : s))
			);
			loadStorageUsage();
		} catch (error) {
			console.error('Failed to download lessons:', error);
			setSubjectStatuses((prev) =>
				prev.map((s) =>
					s.id === subjectId ? { ...s, isDownloading: false, downloadProgress: 0 } : s
				)
			);
		}
	};

	const handleDeletePaper = async (paperId: string) => {
		await deleteCachedPaper(paperId);
		await Promise.all([loadCachedPapers(), loadStorageUsage()]);
	};

	const handleClearOldCache = async () => {
		setIsClearing(true);
		try {
			await clearOldCache();
			await Promise.all([
				loadCachedPapers(),
				loadCachedTasks(),
				loadStorageUsage(),
				loadSubjectStatuses(),
			]);
		} catch (error) {
			console.error('Failed to clear cache:', error);
		}
		setIsClearing(false);
	};

	return (
		<div className="min-h-screen bg-background pb-20">
			<header className="px-6 pt-12 pb-4 bg-card border-b border-border sticky top-0 z-20">
				<div className="flex items-center gap-4 max-w-2xl mx-auto">
					<Link href="/dashboard">
						<Button variant="ghost" size="icon">
							<HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5" />
						</Button>
					</Link>
					<div className="flex items-center gap-3">
						{isOnline ? (
							<HugeiconsIcon icon={Download01Icon} className="w-6 h-6 text-green-500" />
						) : (
							<HugeiconsIcon icon={WifiOffIcon} className="w-6 h-6 text-orange-500" />
						)}
						<div>
							<h1 className="text-xl font-bold">Offline Storage</h1>
							<p className="text-xs text-muted-foreground">
								{isOnline ? 'Online' : 'Offline Mode'}
								{lastSynced &&
									` • Synced ${formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}`}
							</p>
						</div>
					</div>
				</div>
			</header>

			<main className="p-6 space-y-6 max-w-2xl mx-auto">
				<StorageStatusCard isOnline={isOnline} storageUsage={storageUsage} />

				<QuickTipsPanel />

				<CachedTasksList tasks={cachedTasks} />

				<SubjectDownloadList
					subjectStatuses={subjectStatuses}
					isOnline={isOnline}
					onDownload={handleDownloadSubject}
				/>

				<CachedPapersList papers={cachedPapers} onDelete={handleDeletePaper} />

				{(cachedPapers.length > 0 || cachedTasks.length > 0) && (
					<Button
						variant="outline"
						className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
						onClick={handleClearOldCache}
						disabled={isClearing}
					>
						{isClearing ? 'Clearing...' : 'Clear All Cache'}
					</Button>
				)}
			</main>
		</div>
	);
}
