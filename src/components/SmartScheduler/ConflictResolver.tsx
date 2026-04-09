'use client';

import { AlertTriangle } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card } from '@/components/ui/card';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';

export function ConflictResolver() {
	const { blocks, resolveConflict, removeBlock } = useSmartSchedulerStore();

	const conflicts = blocks.reduce(
		(acc: Array<{ blockA: (typeof blocks)[0]; blockB: (typeof blocks)[0] }[]>, block, index) => {
			const otherBlocks = blocks.slice(index + 1);
			for (const other of otherBlocks) {
				const sameDate =
					new Date(block.date).toDateString() === new Date(other.date).toDateString();
				if (!sameDate) continue;

				const blockStart = Number.parseInt(block.startTime.replace(':', ''), 10);
				const blockEnd = Number.parseInt(block.endTime.replace(':', ''), 10);
				const otherStart = Number.parseInt(other.startTime.replace(':', ''), 10);
				const otherEnd = Number.parseInt(other.endTime.replace(':', ''), 10);

				const hasOverlap = blockStart < otherEnd && otherStart < blockEnd;
				if (hasOverlap) {
					acc.push([{ blockA: block, blockB: other }]);
				}
			}
			return acc;
		},
		[]
	);

	const flatConflicts = conflicts.flat();

	if (flatConflicts.length === 0) return null;

	return (
		<Card className="p-4 bg-amber-500/5 border-amber-200/50">
			<div className="flex items-center gap-2 mb-4">
				<HugeiconsIcon icon={AlertTriangle} className="w-5 h-5 text-amber-600" />
				<h3 className="font-semibold text-sm">Schedule Conflicts</h3>
				<span className="text-xs text-muted-foreground">({flatConflicts.length} found)</span>
			</div>
			<div className="space-y-3">
				{flatConflicts.map((conflict, idx) => {
					const { blockA, blockB } = conflict;
					return (
						<div key={idx} className="p-3 rounded-lg bg-background/50 border border-amber-200/30">
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<p className="text-sm font-medium">
										{blockA.subject} ({blockA.startTime} - {blockA.endTime})
									</p>
									<p className="text-xs text-muted-foreground">conflicts with</p>
									<p className="text-sm font-medium">
										{blockB.subject} ({blockB.startTime} - {blockB.endTime})
									</p>
								</div>
								<div className="flex gap-2">
									<button
										type="button"
										onClick={() => {
											removeBlock(blockA.id);
											resolveConflict(blockA.id, 'remove');
										}}
										className="text-xs px-3 py-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
									>
										Remove A
									</button>
									<button
										type="button"
										onClick={() => {
											removeBlock(blockB.id);
											resolveConflict(blockB.id, 'remove');
										}}
										className="text-xs px-3 py-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
									>
										Remove B
									</button>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</Card>
	);
}
