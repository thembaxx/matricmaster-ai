'use client';

import {
	ArrowLeft02Icon,
	BookOpen01Icon,
	CheckmarkCircle02Icon,
	Delete02Icon,
	Download01Icon,
	File01Icon,
	GlobeIcon,
	HardDriveIcon,
	RotateClockwiseIcon,
	SparklesIcon,
	WifiOffIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { QuickTipsPanel } from '@/components/Offline/QuickTipsPanel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
	type CachedPaper,
	cacheLessons,
	clearOldCache,
	deleteCachedPaper,
	formatBytes,
	getCachedPastPapers,
	getCacheStats,
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

const TASK_TYPE_LABELS: Record<string, string> = {
	lesson: 'Lesson',
	quiz: 'Quiz',
	flashcards: 'Flashcards',
	'past-paper': 'Past Paper',
};

export default function OfflinePage() {
	const { isOnline, lastSynced, setOnlineStatus } = useOfflineStore();
	const [cachedPapers, setCachedPapers] = useState<CachedPaper[]>([]);
	const [cachedTasks, setCachedTasks] = useState<CachedTask[]>([]);
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

	const loadCacheStats = useCallback(async () => {
		try {
			const stats = await getCacheStats();
			setCacheStats(stats);
		} catch (error) {
			console.debug('Failed to load cache stats:', error);
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
		setOnlineStatus(navigator.onLine);

		loadCachedPapers();
		loadCachedTasks();
		loadStorageUsage();
		loadCacheStats();
		loadSubjectStatuses();

		const interval = setInterval(() => {
			loadStorageUsage();
			loadCacheStats();
			loadCachedTasks();
		}, 30000);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
			clearInterval(interval);
		};
	}, [
		setOnlineStatus,
		loadCachedPapers,
		loadCachedTasks,
		loadStorageUsage,
		loadCacheStats,
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
			loadCacheStats();
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
		await Promise.all([loadCachedPapers(), loadStorageUsage(), loadCacheStats()]);
	};

	const handleClearOldCache = async () => {
		setIsClearing(true);
		try {
			await clearOldCache();
			await Promise.all([
				loadCachedPapers(),
				loadCachedTasks(),
				loadStorageUsage(),
				loadCacheStats(),
				loadSubjectStatuses(),
			]);
		} catch (error) {
			console.error('Failed to clear cache:', error);
		}
		setIsClearing(false);
	};

	const cachedSubjectsCount = subjectStatuses.filter((s) => s.isCached).length;

	return (
		<div className="min-h-screen bg-background pb-20">
			<header className="px-6 pt-12 pb-4 bg-card border-b border-border sticky top-0 z-20">
				<div className="flex items-center gap-4 max-w-2xl mx-auto">
					<Link href="/dashboard">
						<Button variant="ghost" size="icon">
							<HugeiconsIcon icon={ArrowLeft02Icon} className="w-5 h-5" />
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

				<QuickTipsPanel />

				{cachedTasks.length > 0 && (
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="flex items-center gap-2 text-base">
								<HugeiconsIcon icon={BookOpen01Icon} className="w-5 h-5 text-brand-blue" />
								Cached Tasks ({cachedTasks.length})
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{cachedTasks.map((task) => (
								<div
									key={task.id}
									className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
								>
									<div className="flex items-center gap-3 min-w-0">
										{task.completed ? (
											<HugeiconsIcon
												icon={CheckmarkCircle02Icon}
												className="w-5 h-5 text-green-500 shrink-0"
											/>
										) : (
											<div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
										)}
										<div className="min-w-0">
											<div className="font-medium text-sm truncate">{task.title}</div>
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<span>{task.subject}</span>
												<span>•</span>
												<Badge variant="secondary" className="text-[10px] h-4 px-1.5">
													{TASK_TYPE_LABELS[task.type] ?? task.type}
												</Badge>
											</div>
										</div>
									</div>
									<Badge variant="outline" className="text-[10px] shrink-0">
										Available Offline
									</Badge>
								</div>
							))}
						</CardContent>
					</Card>
				)}

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-base">
							<HugeiconsIcon icon={BookOpen01Icon} className="w-5 h-5 text-brand-blue" />
							Download Subjects for Offline
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						<div className="flex items-center justify-between mb-3">
							<span className="text-xs text-muted-foreground">
								{cachedSubjectsCount} of {SUBJECTS.length} downloaded
							</span>
							<Progress
								value={(cachedSubjectsCount / SUBJECTS.length) * 100}
								className="w-24 h-2"
							/>
						</div>
						{SUBJECTS.map((subject) => {
							const status = subjectStatuses.find((s) => s.id === subject.id);
							return (
								<div
									key={subject.id}
									className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
								>
									<div className="flex items-center gap-3">
										{status?.isCached ? (
											<HugeiconsIcon
												icon={CheckmarkCircle02Icon}
												className="w-5 h-5 text-green-500"
											/>
										) : status?.isDownloading ? (
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
										variant={status?.isCached ? 'ghost' : 'outline'}
										disabled={status?.isCached || status?.isDownloading || !isOnline}
										onClick={() => handleDownloadSubject(subject.id)}
										className="text-xs h-8"
									>
										{status?.isDownloading
											? `${status.downloadProgress}%`
											: status?.isCached
												? 'Cached'
												: 'Download'}
									</Button>
								</div>
							);
						})}
					</CardContent>
				</Card>

				{cachedPapers.length > 0 && (
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="flex items-center gap-2 text-base">
								<HugeiconsIcon icon={File01Icon} className="w-5 h-5 text-brand-green" />
								Saved Past Papers ({cachedPapers.length})
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{cachedPapers.map((paper) => (
								<div
									key={paper.id}
									className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
								>
									<div>
										<div className="font-medium text-sm">
											{paper.subject} {paper.paper}
										</div>
										<div className="text-xs text-muted-foreground">
											{paper.month} {paper.year} • {formatBytes(paper.size)}
										</div>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleDeletePaper(paper.id)}
										className="text-red-500 hover:text-red-600 hover:bg-red-50"
									>
										<HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" />
									</Button>
								</div>
							))}
						</CardContent>
					</Card>
				)}

				<Card className="bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-base">
							<HugeiconsIcon icon={WifiOffIcon} className="w-5 h-5 text-orange-500" />
							Offline Mode Info
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="space-y-2 text-sm">
							<div className="flex items-start gap-2">
								<Badge variant="secondary" className="mt-0.5 shrink-0">
									1
								</Badge>
								<p className="text-muted-foreground">
									Download lessons and past papers while online for offline access
								</p>
							</div>
							<div className="flex items-start gap-2">
								<Badge variant="secondary" className="mt-0.5 shrink-0">
									2
								</Badge>
								<p className="text-muted-foreground">
									Study materials, quizzes, and flashcards work without internet
								</p>
							</div>
							<div className="flex items-start gap-2">
								<Badge variant="secondary" className="mt-0.5 shrink-0">
									3
								</Badge>
								<p className="text-muted-foreground">
									Progress syncs automatically when you reconnect
								</p>
							</div>
						</div>
						<Link href="/dashboard">
							<Button variant="outline" className="w-full gap-2">
								<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4" />
								Continue Learning
							</Button>
						</Link>
					</CardContent>
				</Card>

				<Button
					variant="destructive"
					className="w-full gap-2"
					onClick={handleClearOldCache}
					disabled={isClearing}
				>
					<HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" />
					{isClearing ? 'Clearing...' : 'Clear Old Cache'}
				</Button>
			</main>
		</div>
	);
}
