'use client';

import {
	BookOpen01Icon,
	CheckmarkCircle02Icon,
	GlobeIcon,
	RotateClockwiseIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SubjectStatus {
	id: number;
	name: string;
	isCached: boolean;
	isDownloading: boolean;
	downloadProgress: number;
}

interface SubjectDownloadListProps {
	subjects: { id: number; name: string }[];
	subjectStatuses: SubjectStatus[];
	isOnline: boolean;
	onDownload: (subjectId: number) => void;
}

export function SubjectDownloadList({
	subjects,
	subjectStatuses,
	isOnline,
	onDownload,
}: SubjectDownloadListProps) {
	const cachedSubjectsCount = subjectStatuses.filter((s) => s.isCached).length;

	return (
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
						{cachedSubjectsCount} of {subjects.length} downloaded
					</span>
					<Progress value={(cachedSubjectsCount / subjects.length) * 100} className="w-24 h-2" />
				</div>
				{subjects.map((subject) => {
					const status = subjectStatuses.find((s) => s.id === subject.id);
					return (
						<div
							key={subject.id}
							className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
						>
							<div className="flex items-center gap-3">
								{status?.isCached ? (
									<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-green-500" />
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
								onClick={() => onDownload(subject.id)}
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
	);
}
