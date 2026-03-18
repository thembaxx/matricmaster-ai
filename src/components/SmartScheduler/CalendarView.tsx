'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';
import { AISuggestionsPanel } from './AISuggestionsPanel';
import { DayView } from './DayView';
import { ExamCountdownPanel } from './ExamCountdownPanel';
import { WeekView } from './WeekView';

function CalendarSkeleton() {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
			<div className="lg:col-span-3">
				<div className="bg-card rounded-xl border overflow-hidden">
					<div className="p-4 border-b">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="h-6 w-32 bg-muted rounded animate-pulse" />
								<div className="h-6 w-24 bg-muted rounded animate-pulse" />
							</div>
							<div className="h-9 w-36 bg-muted rounded-lg animate-pulse" />
						</div>
					</div>
					<div className="p-4">
						<div className="grid grid-cols-7 gap-2">
							{Array.from({ length: 7 }).map((_, i) => (
								<div key={i} className="space-y-2">
									<div className="h-16 bg-muted rounded animate-pulse" />
									<div className="space-y-1">
										<div className="h-8 bg-muted rounded animate-pulse" />
										<div className="h-8 bg-muted rounded animate-pulse" />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
			<div className="space-y-4">
				<div className="bg-card rounded-xl border p-4">
					<div className="h-5 w-32 bg-muted rounded animate-pulse mb-3" />
					<div className="space-y-2">
						<div className="h-20 bg-muted rounded animate-pulse" />
						<div className="h-20 bg-muted rounded animate-pulse" />
					</div>
				</div>
				<div className="bg-card rounded-xl border p-4">
					<div className="h-5 w-32 bg-muted rounded animate-pulse mb-3" />
					<div className="space-y-2">
						<div className="h-16 bg-muted rounded animate-pulse" />
					</div>
				</div>
			</div>
		</div>
	);
}

export function CalendarView() {
	const { viewMode, isLoading, loadSchedule, generateSchedule, isGenerating } =
		useSmartSchedulerStore();

	useEffect(() => {
		loadSchedule();
	}, [loadSchedule]);

	if (isLoading) {
		return <CalendarSkeleton />;
	}

	return (
		<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
			<div className="lg:col-span-3 space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">
						{viewMode === 'week' ? 'Weekly Schedule' : 'Daily Schedule'}
					</h2>
					<Button
						type="button"
						onClick={() => generateSchedule()}
						disabled={isGenerating}
						size="sm"
						className="gap-2"
					>
						{isGenerating ? (
							<div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
						) : (
							<HugeiconsIcon icon={SparklesIcon} className="h-4 w-4" />
						)}
						<span>{isGenerating ? 'Generating...' : 'Generate with AI'}</span>
					</Button>
				</div>

				{viewMode === 'week' ? <WeekView /> : <DayView />}
			</div>

			<div className="space-y-4">
				<ExamCountdownPanel />
				<AISuggestionsPanel />
			</div>
		</div>
	);
}
