'use client';

import { Tick01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { FluentEmoji } from '@lobehub/fluent-emoji';
import { cn } from '@/lib/utils';

const AVATARS = [
	{ id: 'math-whiz', emoji: '🧮', color: 'bg-subject-math', label: 'Math Whiz' },
	{ id: 'science-pro', emoji: '⚛️', color: 'bg-subject-physics', label: 'Science Pro' },
	{ id: 'book-worm', emoji: '📚', color: 'bg-subject-life', label: 'Book Worm' },
	{ id: 'ai-scholar', emoji: '🎓', color: 'bg-primary', label: 'AI Scholar' },
];

interface AvatarPickerProps {
	selectedId?: string;
	onSelect: (id: string) => void;
}

export function AvatarPicker({ selectedId, onSelect }: AvatarPickerProps) {
	return (
		<div className="grid grid-cols-4 gap-4">
			{AVATARS.map((avatar) => (
				<button
					key={avatar.id}
					type="button"
					onClick={() => onSelect(avatar.id)}
					className={cn(
						'relative group flex flex-col items-center gap-2 transition-all',
						selectedId === avatar.id
							? 'scale-110'
							: 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0'
					)}
				>
					<div
						className={cn(
							'w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6 overflow-hidden',
							avatar.color
						)}
					>
						<FluentEmoji type="3d" emoji={avatar.emoji} size={40} />
					</div>
					{selectedId === avatar.id && (
						<div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full flex items-center justify-center shadow-md">
							<HugeiconsIcon icon={Tick01Icon} className="w-3 h-3 text-white" />
						</div>
					)}
					<span className="text-[8px] font-black  tracking-widest">{avatar.label}</span>
				</button>
			))}
		</div>
	);
}
