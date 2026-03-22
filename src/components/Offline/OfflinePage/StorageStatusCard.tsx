'use client';

import { Download01Icon, GlobeIcon, HardDriveIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface StorageStatusCardProps {
	isOnline: boolean;
	storageUsage: {
		used: number;
		total: number;
		percentage: number;
	} | null;
	cacheStats: {
		lessonCount: number;
		paperCount: number;
		quizCount: number;
		aiResponseCount: number;
	} | null;
}

export function StorageStatusCard({ isOnline, storageUsage, cacheStats }: StorageStatusCardProps) {
	const formatBytes = (bytes: number) => {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
	};

	return (
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
	);
}
