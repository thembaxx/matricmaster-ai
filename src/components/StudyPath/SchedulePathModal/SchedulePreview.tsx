'use client';

import { Calendar02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/components/ui/badge';
import type { PathScheduleResult } from '@/services/studyPathSchedulerService';

interface ScheduleSummaryProps {
	stepsLength: number;
	hours: number;
	minutes: number;
}

export function ScheduleSummary({ stepsLength, hours, minutes }: ScheduleSummaryProps) {
	return (
		<div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
			<div className="flex items-center gap-2 mb-2">
				<HugeiconsIcon icon={Calendar02Icon} className="h-4 w-4 text-primary" />
				<span className="text-sm font-semibold">Schedule Summary</span>
			</div>
			<div className="grid grid-cols-2 gap-3">
				<div className="bg-background/80 rounded-xl p-3">
					<p className="text-xs text-muted-foreground mb-1">Total Steps</p>
					<p className="font-mono font-bold text-lg">{stepsLength}</p>
				</div>
				<div className="bg-background/80 rounded-xl p-3">
					<p className="text-xs text-muted-foreground mb-1">Est. Time</p>
					<p className="font-mono font-bold text-lg">
						{hours}h {minutes}m
					</p>
				</div>
			</div>
		</div>
	);
}

interface SchedulePreviewProps {
	result: PathScheduleResult;
	hours: number;
	minutes: number;
}

export function SchedulePreview({ result, hours, minutes }: SchedulePreviewProps) {
	return (
		<div className="space-y-4">
			<div className="bg-success-soft rounded-2xl p-4 border border-success/20">
				<div className="flex items-center gap-2 mb-2">
					<HugeiconsIcon icon={Calendar02Icon} className="h-5 w-5 text-success" />
					<span className="font-semibold">Schedule Preview</span>
				</div>
				<p className="text-sm text-muted-foreground">
					{result.estimatedDays} days | {hours}h {minutes}m total
				</p>
			</div>

			<div className="max-h-64 overflow-y-auto space-y-2">
				{result.blocks.slice(0, 6).map((block, index) => (
					<div key={block.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
						<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
							<span className="font-mono text-xs font-bold text-primary">{index + 1}</span>
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium truncate">{block.topic}</p>
							<p className="text-xs text-muted-foreground">
								{new Date(block.date).toLocaleDateString('en-ZA', {
									weekday: 'short',
									day: 'numeric',
								})}{' '}
								· {block.startTime}
							</p>
						</div>
						<Badge variant="outline" className="font-mono text-xs">
							{block.duration}m
						</Badge>
					</div>
				))}
				{result.blocks.length > 6 && (
					<p className="text-xs text-muted-foreground text-center py-2">
						+{result.blocks.length - 6} more blocks
					</p>
				)}
			</div>

			{result.conflicts && result.conflicts.length > 0 && (
				<div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
					<div className="flex items-center gap-2 mb-2">
						<span className="text-sm font-semibold text-amber-700">
							{result.conflicts.length} Adjustment
							{result.conflicts.length > 1 ? 's' : ''}
						</span>
					</div>
					{result.conflicts.slice(0, 2).map((conflict, i) => (
						<p key={i} className="text-xs text-amber-700">
							{conflict.suggestion}
						</p>
					))}
				</div>
			)}
		</div>
	);
}
