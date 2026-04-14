'use client';

import { ChevronDown } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { SubjectContent } from '@/content';
import { cn } from '@/lib/utils';

interface TutorSubjectSelectorProps {
	selectedSubject: string | null;
	onSelect: (subject: string | null) => void;
	subjects: SubjectContent[];
}

export function TutorSubjectSelector({
	selectedSubject,
	onSelect,
	subjects,
}: TutorSubjectSelectorProps) {
	const [open, setOpen] = useState(false);

	const currentSubject = subjects.find(
		(s) => s.name.toLowerCase() === selectedSubject?.toLowerCase()
	);

	const handleSelect = (subjectName: string | null) => {
		onSelect(subjectName);
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						'h-12 px-3 rounded-2xl gap-2 font-medium shrink-0 min-w-[140px] justify-between',
						!selectedSubject && 'text-muted-foreground'
					)}
				>
					{currentSubject ? (
						<>
							<span className="text-lg">{currentSubject.fluentEmoji}</span>
							<span className="text-sm truncate">{currentSubject.displayName}</span>
						</>
					) : (
						<span className="text-sm">Select subject</span>
					)}
					<HugeiconsIcon
						icon={ChevronDown}
						className={cn('w-4 h-4 shrink-0', open && 'rotate-180 transition-transform')}
					/>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="p-2 rounded-2xl w-[220px] bg-background border-border/50 shadow-lg"
			>
				<div className="space-y-1">
					<Button
						variant="ghost"
						className={cn(
							'w-full justify-start gap-2 h-10 rounded-xl font-medium',
							!selectedSubject && 'bg-muted'
						)}
						onClick={() => handleSelect(null)}
					>
						<span className="text-lg">🌐</span>
						<span className="text-sm">All subjects</span>
					</Button>
					{subjects.map((subject) => (
						<Button
							key={subject.id}
							variant="ghost"
							className={cn(
								'w-full justify-start gap-2 h-10 rounded-xl font-medium',
								selectedSubject?.toLowerCase() === subject.name.toLowerCase() && 'bg-muted'
							)}
							onClick={() => handleSelect(subject.name)}
						>
							<span className="text-lg">{subject.fluentEmoji}</span>
							<span className="text-sm truncate">{subject.displayName}</span>
						</Button>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
