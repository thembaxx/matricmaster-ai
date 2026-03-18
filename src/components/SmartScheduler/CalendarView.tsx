'use client';

import { useEffect } from 'react';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';
import { AISuggestionsPanel } from './AISuggestionsPanel';
import { DayView } from './DayView';
import { ExamCountdownPanel } from './ExamCountdownPanel';
import { WeekView } from './WeekView';

export function CalendarView() {
	const { viewMode, isLoading, loadSchedule, generateSchedule, isGenerating } =
		useSmartSchedulerStore();

	useEffect(() => {
		loadSchedule();
	}, [loadSchedule]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
			<div className="lg:col-span-3 space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">
						{viewMode === 'week' ? 'Weekly Schedule' : 'Daily Schedule'}
					</h2>
					<button
						type="button"
						onClick={() => generateSchedule()}
						disabled={isGenerating}
						className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
					>
						{isGenerating ? 'Generating...' : 'Generate with AI'}
					</button>
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
