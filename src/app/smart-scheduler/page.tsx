'use client';

import { Add01Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { BlockEditor } from '@/components/SmartScheduler/BlockEditor';
import { CalendarView } from '@/components/SmartScheduler/CalendarView';
import { SmartSchedulerProvider } from '@/components/SmartScheduler/ScheduleProvider';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';

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

	// biome-ignore lint/correctness/useExhaustiveDependencies: only run once on mount
	useEffect(() => {
		checkAdaptiveSchedule();
	}, []);

	const handleSaveBlock = async (block: Parameters<typeof saveBlock>[0]) => {
		await saveBlock(block);
		setEditorOpen(false);
	};

	return (
		<div className="container max-w-7xl mx-auto px-4 py-6">
			<header className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-display font-bold">Smart Scheduler</h1>
					<p className="text-muted-foreground mt-1">
						AI-powered study planning with exam countdown
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => checkAdaptiveSchedule()}
						disabled={isLoading}
					>
						<HugeiconsIcon icon={SparklesIcon} className="h-4 w-4 mr-1" />
						{isLoading ? 'Checking...' : 'Check Schedule'}
					</Button>
					<Popover open={editorOpen} onOpenChange={setEditorOpen}>
						<PopoverTrigger asChild>
							<Button size="sm">
								<HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-1" />
								Add Block
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
