'use client';

import { Add01Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { BlockEditor } from '@/components/SmartScheduler/BlockEditor';
import { CalendarView } from '@/components/SmartScheduler/CalendarView';
import { SmartSchedulerProvider } from '@/components/SmartScheduler/ScheduleProvider';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';

async function fetchAdaptiveSchedule() {
	const response = await fetch('/api/smart-scheduler/adaptive', { method: 'POST' });
	if (!response.ok) throw new Error('Failed to check adaptive schedule');
	return response.json();
}

export default function SmartSchedulerPage() {
	return (
		<SmartSchedulerProvider>
			<SmartSchedulerContent />
		</SmartSchedulerProvider>
	);
}

function SmartSchedulerContent() {
	const { saveBlock, checkAdaptiveSchedule, isLoading } = useSmartSchedulerStore();
	const [editorOpen, setEditorOpen] = useState(false);

	useQuery({
		queryKey: ['adaptive-schedule'],
		queryFn: fetchAdaptiveSchedule,
	});

	const handleSaveBlock = async (block: Parameters<typeof saveBlock>[0]) => {
		await saveBlock(block);
		setEditorOpen(false);
	};

	return (
		<div className="container max-w-7xl mx-auto px-4 py-8">
			<header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
						<h1 className="text-3xl font-display font-bold tracking-tight">Smart Scheduler</h1>
					</div>
					<p className="text-muted-foreground ml-3">
						AI-powered study planning with exam countdown
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="sm"
						onClick={() => checkAdaptiveSchedule()}
						disabled={isLoading}
						className="gap-2"
					>
						{isLoading ? (
							<div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
						) : (
							<HugeiconsIcon icon={SparklesIcon} className="h-4 w-4 text-primary" />
						)}
						<span>{isLoading ? 'Checking...' : 'Optimize'}</span>
					</Button>
					<Popover open={editorOpen} onOpenChange={setEditorOpen}>
						<PopoverTrigger asChild>
							<Button size="sm" className="gap-2">
								<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
								<span>Add Block</span>
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end" className="w-auto p-0">
							<BlockEditor onSave={handleSaveBlock} onClose={() => setEditorOpen(false)} />
						</PopoverContent>
					</Popover>
				</div>
			</header>

			<CalendarView />
		</div>
	);
}
