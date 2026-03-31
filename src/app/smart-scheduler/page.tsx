'use client';

import { Add01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { toast } from 'sonner';
import { CalendarView } from '@/components/SmartScheduler/CalendarView';
import { ExamCountdown } from '@/components/SmartScheduler/ExamCountdown';
import { SmartSchedulerProvider } from '@/components/SmartScheduler/ScheduleProvider';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';

const BlockEditor = dynamic(
	() =>
		import('@/components/SmartScheduler/BlockEditor').then((mod) => ({ default: mod.BlockEditor })),
	{ ssr: false, loading: () => null }
);

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
	const [isSaving, setIsSaving] = useState(false);

	useQuery({
		queryKey: ['adaptive-schedule'],
		queryFn: fetchAdaptiveSchedule,
		staleTime: 60_000,
	});

	const handleSaveBlock = async (block: Parameters<typeof saveBlock>[0]) => {
		setIsSaving(true);
		try {
			await saveBlock(block);
			setEditorOpen(false);
			toast.success(block.id ? 'Block updated' : 'Block added');
		} catch (error) {
			console.error('Failed to save block:', error);
			toast.error('Failed to save block');
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="container max-w-7xl mx-auto px-4 py-8">
			<header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
						<h1 className="text-3xl font-bold tracking-tight">Smart Scheduler</h1>
					</div>
					<p className="text-muted-foreground ml-3 text-sm">
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
							<svg
								className="h-4 w-4"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
							>
								<title>Optimize</title>
								<path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.49-8.49l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93" />
							</svg>
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
							<BlockEditor
								onSave={handleSaveBlock}
								onClose={() => setEditorOpen(false)}
								isSaving={isSaving}
							/>
						</PopoverContent>
					</Popover>
				</div>
			</header>

			<div className="mb-6">
				<ExamCountdown />
			</div>

			<CalendarView />
		</div>
	);
}
