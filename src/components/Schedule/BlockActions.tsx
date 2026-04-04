'use client';

import {
	BookOpenIcon,
	Chat01Icon,
	Delete02Icon,
	Edit01Icon,
	File01Icon,
	Timer01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AddBlockModal } from './AddBlockModal';

interface BlockEvent {
	id: string;
	title: string;
	startTime: Date;
	endTime: Date;
	eventType: string;
	subjectId?: number;
	subjectName?: string;
	isCompleted: boolean;
}

interface BlockActionsProps {
	event: BlockEvent | null;
	getSubjectName: (subjectId?: number) => string;
	isEditModalOpen: boolean;
	onEditModalOpenChange: (open: boolean) => void;
	isDeleting: boolean;
	onToggleComplete: () => void;
	onDelete: () => void;
	onSuccess: () => void;
	onOpenChange: (open: boolean) => void;
}

const actionButtonBase =
	'flex flex-col items-center justify-center p-5 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-all gap-2.5 active:scale-[0.98] border border-transparent hover:border-border/50';

export function BlockActions({
	event,
	getSubjectName,
	isEditModalOpen,
	onEditModalOpenChange,
	isDeleting,
	onToggleComplete,
	onDelete,
	onSuccess,
	onOpenChange,
}: BlockActionsProps) {
	const router = useRouter();

	const handleStudySession = () => {
		if (!event) return;
		const duration = Math.round(
			(new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / 60000
		);
		const params = new URLSearchParams();
		params.set('duration', String(duration));
		if (event.subjectId) params.set('subject', String(event.subjectId));
		router.push(`/focus?${params.toString()}`);
	};

	const handleFlashcards = () => {
		if (!event?.subjectId) {
			toast.error('Please link a subject to this block to view flashcards');
			return;
		}
		router.push(`/flashcards?subject=${event.subjectId}`);
	};

	const handlePastPapers = () => {
		if (!event?.subjectId) {
			toast.error('Please link a subject to this block to view past papers');
			return;
		}
		router.push(`/past-papers?subject=${event.subjectId}`);
	};

	const handleAITutor = () => {
		if (!event) return;
		const params = new URLSearchParams();
		if (event.subjectId) params.set('subject', String(event.subjectId));
		params.set('topic', event.title);
		router.push(`/ai-tutor?${params.toString()}`);
	};

	const editModeData = event
		? {
				id: event.id,
				title: event.title,
				startTime: event.startTime,
				endTime: event.endTime,
				eventType: event.eventType,
				subjectId: event.subjectId,
			}
		: null;

	return (
		<div className="space-y-5">
			{event?.subjectId && (
				<div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-xl border border-primary/10">
					<div className="w-2 h-2 rounded-full bg-primary" />
					<span className="text-sm font-medium">{getSubjectName(event.subjectId)}</span>
				</div>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<Button variant="ghost" onClick={handleStudySession} className={`${actionButtonBase} h-28`}>
					<div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 shadow-sm">
						<HugeiconsIcon icon={Timer01Icon} className="w-6 h-6 text-primary" />
					</div>
					<div className="text-center">
						<span className="text-sm font-bold block">Study</span>
						<span className="text-[10px] text-muted-foreground">Start timer</span>
					</div>
				</Button>

				<Button
					variant="ghost"
					onClick={handleFlashcards}
					className={`${actionButtonBase} h-28 ${!event?.subjectId ? 'opacity-50' : ''}`}
					disabled={!event?.subjectId}
				>
					<div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 shadow-sm">
						<HugeiconsIcon icon={BookOpenIcon} className="w-6 h-6 text-purple-500" />
					</div>
					<div className="text-center space-y-0.5">
						<span className="text-sm font-bold block">Flashcards</span>
						<span className="text-[10px] text-muted-foreground">Review cards</span>
					</div>
				</Button>

				<Button
					variant="ghost"
					onClick={handlePastPapers}
					className={`${actionButtonBase} h-28 ${!event?.subjectId ? 'opacity-50' : ''}`}
					disabled={!event?.subjectId}
				>
					<div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-sm">
						<HugeiconsIcon icon={File01Icon} className="w-6 h-6 text-amber-500" />
					</div>
					<div className="text-center space-y-0.5">
						<span className="text-sm font-bold block">Past Papers</span>
						<span className="text-[10px] text-muted-foreground">Practice exams</span>
					</div>
				</Button>

				<Button variant="ghost" onClick={handleAITutor} className={`${actionButtonBase} h-28`}>
					<div className="p-3.5 rounded-2xl bg-green-500/10 border border-green-500/20 shadow-sm">
						<HugeiconsIcon icon={Chat01Icon} className="w-6 h-6 text-green-500" />
					</div>
					<div className="text-center space-y-0.5">
						<span className="text-sm font-bold block">AI Tutor</span>
						<span className="text-[10px] text-muted-foreground">Ask anything</span>
					</div>
				</Button>
			</div>

			<div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/30">
				<div className="flex items-center gap-3.5">
					<div
						className={`p-2.5 rounded-xl ${event?.isCompleted ? 'bg-green-500/15' : 'bg-muted'}`}
					>
						<svg
							aria-label="Completion status"
							className={`w-5 h-5 ${
								event?.isCompleted ? 'text-green-500' : 'text-muted-foreground/50'
							}`}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<title>Completion status</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
					<div className="text-left">
						<p className="text-sm font-bold">Mark Complete</p>
						<p className="text-xs text-muted-foreground">
							{event?.isCompleted ? 'Great job! Keep it up!' : 'Track your progress'}
						</p>
					</div>
				</div>
				<Switch checked={event?.isCompleted || false} onCheckedChange={onToggleComplete} />
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
				<Button
					variant="secondary"
					size="sm"
					onClick={() => onEditModalOpenChange(true)}
					className="h-11 rounded-xl border-border/50 hover:bg-muted/50 hover:border-border font-medium"
				>
					<HugeiconsIcon icon={Edit01Icon} className="w-4 h-4" />
					Edit Block
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={onDelete}
					disabled={isDeleting}
					className="h-11 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/30 font-medium"
				>
					<HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" />
					{isDeleting ? 'Deleting...' : 'Delete'}
				</Button>
			</div>

			<AddBlockModal
				open={isEditModalOpen}
				onOpenChange={onEditModalOpenChange}
				onSuccess={() => {
					onSuccess();
					onOpenChange(false);
				}}
				editMode={editModeData}
			/>
		</div>
	);
}
