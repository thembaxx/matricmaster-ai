'use client';

import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { AudioPlayer } from './AudioPlayer';

interface ResponsiveAudioPlayerProps {
	audioSrc?: string;
	text: string;
	title?: string;
	description?: string;
	trigger?: React.ReactNode;
	autoPlay?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ResponsiveAudioPlayer({
	audioSrc,
	text,
	title,
	description,
	trigger,
	autoPlay = false,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
}: ResponsiveAudioPlayerProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	const isControlled = controlledOpen !== undefined;
	const isOpen = isControlled ? controlledOpen : internalOpen;

	const handleOpenChange = (newOpen: boolean) => {
		if (!isControlled) {
			setInternalOpen(newOpen);
		}
		controlledOnOpenChange?.(newOpen);
	};

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	const playerContent = (
		<AudioPlayer
			audioSrc={audioSrc}
			text={text}
			title={title}
			description={description}
			isOpen={isOpen}
			autoPlay={autoPlay}
		/>
	);

	if (isMobile) {
		return (
			<>
				{trigger && (
					<div
						onClick={() => handleOpenChange(true)}
						className="cursor-pointer"
						role="button"
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								handleOpenChange(true);
							}
						}}
					>
						{trigger}
					</div>
				)}
				<Drawer open={isOpen} onOpenChange={handleOpenChange}>
					<DrawerContent className="h-[80vh] sm:h-[70vh]">
						<DrawerHeader className="pb-0">
							<DrawerTitle className="sr-only">Audio Player</DrawerTitle>
							<DrawerDescription className="sr-only">
								Listen to the lesson with transcription
							</DrawerDescription>
						</DrawerHeader>
						<div className="p-4 h-full overflow-hidden">{playerContent}</div>
					</DrawerContent>
				</Drawer>
			</>
		);
	}

	return (
		<>
			{trigger && (
				<div
					onClick={() => handleOpenChange(true)}
					className="cursor-pointer"
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							handleOpenChange(true);
						}
					}}
				>
					{trigger}
				</div>
			)}
			<Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
					<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[85vh] bg-background rounded-2xl shadow-2xl border border-border p-6 z-50 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
						<Dialog.Title className="sr-only">Audio Player</Dialog.Title>
						<Dialog.Description className="sr-only">
							Listen to the content with transcription
						</Dialog.Description>
						<div className="h-full max-h-[75vh] overflow-hidden">{playerContent}</div>
						<Dialog.Close asChild>
							<Button
								variant="ghost"
								size="icon"
								className="absolute right-4 top-4 rounded-full hover:bg-muted"
							>
								<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
								<span className="sr-only">Close</span>
							</Button>
						</Dialog.Close>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</>
	);
}
