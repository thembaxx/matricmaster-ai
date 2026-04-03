'use client';

import {
	BookOpenIcon,
	CheckCircleIcon,
	CircleIcon,
	ClockIcon,
	DownloadIcon,
	HardDriveIcon,
	TrashIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CachedPaper } from '@/lib/offline/offline-cache';
import type { CachedTask } from '@/lib/offline/task-cache';

interface SubjectStatus {
	id: number;
	name: string;
	isCached: boolean;
	isDownloading: boolean;
	downloadProgress: number;
}

interface StorageUsage {
	used: number;
	total: number;
	percentage: number;
}

function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

export function StorageStatusCard({
	isOnline,
	storageUsage,
}: {
	isOnline: boolean;
	storageUsage: StorageUsage | null;
}) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<HardDriveIcon className="h-4 w-4" />
					Storage Status
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{storageUsage ? (
					<>
						<div className="flex justify-between text-sm">
							<span>Used</span>
							<span className="font-mono">
								{formatBytes(storageUsage.used)} / {formatBytes(storageUsage.total)}
							</span>
						</div>
						<Progress value={storageUsage.percentage} className="h-2" />
						<p className="text-xs text-muted-foreground">{storageUsage.percentage}% storage used</p>
					</>
				) : (
					<p className="text-sm text-muted-foreground">Loading storage info...</p>
				)}

				{isOnline && (
					<div className="flex items-center gap-2 text-sm text-green-600">
						<CheckCircleIcon className="h-4 w-4" />
						Connected - Content updates available
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function CachedTasksList({ tasks }: { tasks: CachedTask[] }) {
	if (tasks.length === 0) {
		return (
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-base">
						<ClockIcon className="h-4 w-4" />
						Saved Tasks
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">No cached tasks yet</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<ClockIcon className="h-4 w-4" />
					Saved Tasks ({tasks.length})
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ScrollArea className="min-h-[150px] max-h-[300px]">
					<div className="space-y-2">
						{tasks.map((task) => (
							<div key={task.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
								<CircleIcon className="h-4 w-4 text-muted-foreground" />
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate">{task.title}</p>
									<p className="text-xs text-muted-foreground">{task.subject}</p>
								</div>
							</div>
						))}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}

export function SubjectDownloadList({
	subjectStatuses,
	isOnline,
	onDownload,
}: {
	subjectStatuses: SubjectStatus[];
	isOnline: boolean;
	onDownload: (subjectId: number) => void;
}) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<DownloadIcon className="h-4 w-4" />
					Download Content
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{subjectStatuses.map((status) => (
					<div key={status.id} className="flex items-center justify-between p-3 rounded-lg border">
						<div className="flex items-center gap-3">
							<BookOpenIcon className="h-5 w-5 text-muted-foreground" />
							<span className="font-medium">{status.name}</span>
						</div>
						<div className="flex items-center gap-2">
							{status.isDownloading ? (
								<div className="w-24">
									<Progress value={status.downloadProgress} className="h-2" />
								</div>
							) : status.isCached ? (
								<span className="text-xs text-green-600 flex items-center gap-1">
									<CheckCircleIcon className="h-3 w-3" />
									Cached
								</span>
							) : (
								<Button
									size="sm"
									variant="outline"
									disabled={!isOnline}
									onClick={() => onDownload(status.id)}
								>
									{isOnline ? 'Download' : 'Offline'}
								</Button>
							)}
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}

export function CachedPapersList({
	papers,
	onDelete,
}: {
	papers: CachedPaper[];
	onDelete: (paperId: string) => void;
}) {
	if (papers.length === 0) {
		return (
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-base">
						<BookOpenIcon className="h-4 w-4" />
						Cached Past Papers
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">No cached papers yet</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<BookOpenIcon className="h-4 w-4" />
					Cached Past Papers ({papers.length})
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ScrollArea className="min-h-[150px] max-h-[300px]">
					<div className="space-y-2">
						{papers.map((paper) => (
							<div
								key={paper.id}
								className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
							>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate">
										{paper.subject} - {paper.paper}
									</p>
									<p className="text-xs text-muted-foreground">
										{paper.year} {paper.month} • {formatBytes(paper.size)}
									</p>
								</div>
								<Button size="sm" variant="ghost" onClick={() => onDelete(paper.id)}>
									<TrashIcon className="h-4 w-4 text-destructive" />
								</Button>
							</div>
						))}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
