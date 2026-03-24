'use client';
/* eslint-disable react-hooks/setState-in-use-effect */

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

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
import {
	deleteCalendarEventAction,
	getEnrolledSubjectsAction,
	updateCalendarEventAction,
} from '@/lib/db/actions';

import { BlockActions } from './BlockActions';
import { useMediaQuery } from './hooks';

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

export function BlockActionSheet({ open, onOpenChange, event, onSuccess }: BlockActionSheetProps) {
	const isDesktop = useMediaQuery('(min-width: 1024px)');
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const { data: subjectsData } = useQuery({
		queryKey: ['enrolled-subjects'],
		queryFn: () => getEnrolledSubjectsAction(),
	});

	const subjects = subjectsData ?? [];

	const getSubjectName = (subjectId?: number): string => {
		if (!subjectId) return '';
		const subject = subjects.find((s) => s.id === subjectId);
		return subject?.name || '';
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

	const actionsContent = (
		<BlockActions
			event={event}
			getSubjectName={getSubjectName}
			isEditModalOpen={isEditModalOpen}
			onEditModalOpenChange={setIsEditModalOpen}
			isDeleting={isDeleting}
			onToggleComplete={handleToggleComplete}
			onDelete={handleDelete}
			onSuccess={onSuccess}
			onOpenChange={onOpenChange}
		/>
	);

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
										•{' '}
										{new Date(event.startTime).toLocaleTimeString('en-US', {
											hour: 'numeric',
											minute: '2-digit',
											hour12: true,
										})}{' '}
										-{' '}
										{new Date(event.endTime).toLocaleTimeString('en-US', {
											hour: 'numeric',
											minute: '2-digit',
											hour12: true,
										})}
									</span>
								)}
							</DialogDescription>
						</DialogHeader>
					</div>
					<div className="px-6 pb-6">{actionsContent}</div>
				</DialogContent>
			</Dialog>
		);
	}

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
									•{' '}
									{new Date(event.startTime).toLocaleTimeString('en-US', {
										hour: 'numeric',
										minute: '2-digit',
										hour12: true,
									})}{' '}
									-{' '}
									{new Date(event.endTime).toLocaleTimeString('en-US', {
										hour: 'numeric',
										minute: '2-digit',
										hour12: true,
									})}
								</span>
							)}
						</DrawerDescription>
					</DrawerHeader>
				</div>
				<div className="px-1 overflow-y-auto max-h-[65vh]">{actionsContent}</div>
			</DrawerContent>
		</Drawer>
	);
}
