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
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Switch } from '@/components/ui/switch';
import {
	deleteCalendarEventAction,
	getEnrolledSubjectsAction,
	updateCalendarEventAction,
} from '@/lib/db/actions';

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

interface BlockActionSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	event: BlockEvent | null;
	onSuccess: () => void;
}

function useMediaQuery(query: string) {
	const [matches, setMatches] = useState(true);

	useEffect(() => {
		const check = () => setMatches(window.matchMedia(query).matches);
		check();
		const mediaQuery = window.matchMedia(query);
		mediaQuery.addEventListener('change', check);
		return () => mediaQuery.removeEventListener('change', check);
	}, [query]);

	return matches;
}

function formatTime(date: Date): string {
	return date.toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	});
}

export function BlockActionSheet({ open, onOpenChange, event, onSuccess }: BlockActionSheetProps) {
	const isDesktop = useMediaQuery('(min-width: 1024px)');
	const router = useRouter();
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);

	useEffect(() => {
		async function loadSubjects() {
			const data = await getEnrolledSubjectsAction();
			setSubjects(data);
		}
		loadSubjects();
	}, []);

	const getSubjectName = (subjectId?: number): string => {
		if (!subjectId) return '';
		const subject = subjects.find((s) => s.id === subjectId);
		return subject?.name || '';
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

	const handleTutor = () => {
		if (!event) return;
		const params = new URLSearchParams();
		if (event.subjectId) params.set('subject', String(event.subjectId));
		params.set('topic', event.title);
		router.push(`/tutor?${params.toString()}`);
	};

	const handleToggleComplete = async () => {
		if (!event) return;
		const result = await updateCalendarEventAction(event.id, {
			eventType: event.isCompleted ? 'study_session' : 'completed',
		});
		if (result.success) {
			toast.success(event.isCompleted ? 'Marked as incomplete' : 'Marked as complete!');
			onSuccess();
		} else {
			toast.error('Failed to update');
		}
	};

	const handleDelete = async () => {
		if (!event || !confirm('Are you sure you want to delete this study block?')) return;
		setIsDeleting(true);
		const result = await deleteCalendarEventAction(event.id);
		if (result.success) {
			toast.success('Study block deleted');
			onSuccess();
			onOpenChange(false);
		} else {
			toast.error('Failed to delete');
		}
		setIsDeleting(false);
	};

	const actionButtonBase =
		'flex flex-col items-center justify-center p-5 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-all gap-2.5 active:scale-[0.98] border border-transparent hover:border-border/50';

	const renderActions = () => (
		<div className="space-y-5">
			{/* Subject Display */}
			{event?.subjectId && (
				<div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-xl border border-primary/10">
					<div className="w-2 h-2 rounded-full bg-primary" />
					<span className="text-sm font-medium">{getSubjectName(event.subjectId)}</span>
				</div>
			)}

			{/* Quick Actions Grid */}
			<div className="grid grid-cols-2 gap-3">
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

				<Button variant="ghost" onClick={handleTutor} className={`${actionButtonBase} h-28`}>
					<div className="p-3.5 rounded-2xl bg-green-500/10 border border-green-500/20 shadow-sm">
						<HugeiconsIcon icon={Chat01Icon} className="w-6 h-6 text-green-500" />
					</div>
					<div className="text-center space-y-0.5">
						<span className="text-sm font-bold block">Tutor</span>
						<span className="text-[10px] text-muted-foreground">Ask anything</span>
					</div>
				</Button>
			</div>

			{/* Completion Toggle */}
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
				<Switch checked={event?.isCompleted || false} onCheckedChange={handleToggleComplete} />
			</div>

			{/* Edit/Delete Actions */}
			<div className="grid grid-cols-2 gap-3 py-1">
				<Button
					variant="secondary"
					size="sm"
					onClick={() => setIsEditModalOpen(true)}
					className="h-11 rounded-xl border-border/50 hover:bg-muted/50 hover:border-border font-medium"
				>
					<HugeiconsIcon icon={Edit01Icon} className="w-4 h-4" />
					Edit Block
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={handleDelete}
					disabled={isDeleting}
					className="h-11 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/30 font-medium"
				>
					<HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" />
					{isDeleting ? 'Deleting...' : 'Delete'}
				</Button>
			</div>

			<AddBlockModal
				open={isEditModalOpen}
				onOpenChange={setIsEditModalOpen}
				onSuccess={() => {
					onSuccess();
					onOpenChange(false);
				}}
				editMode={editModeData}
			/>
		</div>
	);

	// Desktop Dialog
	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden border-border/50">
					<div className="bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 p-6 pb-4">
						<DialogHeader className="text-left">
							<DialogTitle className="text-2xl font-bold flex items-center gap-3">
								<span className="truncate">{event?.title}</span>
								{event?.isCompleted && (
									<span className="shrink-0">
										<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/15 text-green-600 text-xs font-bold">
											<svg
												aria-label="Completed"
												className="w-3.5 h-3.5"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<title>Completed</title>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2.5}
													d="M5 13l4 4L19 7"
												/>
											</svg>
											DONE
										</span>
									</span>
								)}
							</DialogTitle>
							<DialogDescription className="text-sm mt-1.5">
								<span className="font-medium">
									{event?.subjectId ? getSubjectName(event.subjectId) : 'No subject linked'}
								</span>
								{event && (
									<span className="text-muted-foreground/70 ml-2">
										• {formatTime(new Date(event.startTime))} -{' '}
										{formatTime(new Date(event.endTime))}
									</span>
								)}
							</DialogDescription>
						</DialogHeader>
					</div>
					<div className="px-6 pb-6">{renderActions()}</div>
				</DialogContent>
			</Dialog>
		);
	}

	// Mobile Drawer
	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="rounded-t-[2.5rem] px-4 pb-8">
				<div className="bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 -mx-4 px-6 pt-2 pb-4 mb-2">
					<DrawerHeader className="text-left p-0">
						<DrawerTitle className="text-2xl font-bold flex items-center gap-3">
							<span className="truncate">{event?.title}</span>
							{event?.isCompleted && (
								<span className="shrink-0">
									<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/15 text-green-600 text-xs font-bold">
										<svg
											aria-label="Completed"
											className="w-3.5 h-3.5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<title>Completed</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2.5}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										DONE
									</span>
								</span>
							)}
						</DrawerTitle>
						<DrawerDescription className="text-sm mt-1.5">
							<span className="font-medium">
								{event?.subjectId ? getSubjectName(event.subjectId) : 'No subject linked'}
							</span>
							{event && (
								<span className="text-muted-foreground/70 ml-2">
									• {formatTime(new Date(event.startTime))} - {formatTime(new Date(event.endTime))}
								</span>
							)}
						</DrawerDescription>
					</DrawerHeader>
				</div>
				<div className="px-1 overflow-y-auto max-h-[65vh]">{renderActions()}</div>
			</DrawerContent>
		</Drawer>
	);
}
