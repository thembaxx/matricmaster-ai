'use client';

import { cn } from '@/lib/utils';

type SubjectFilterPillsProps = {
	subjects: string[];
	selectedSubject: string;
	onSelect: (subject: string) => void;
	getColor: (subject: string) => {
		bg: string;
		text: string;
	};
};

export function SubjectFilterPills({
	subjects,
	selectedSubject,
	onSelect,
	getColor,
}: SubjectFilterPillsProps) {
	return (
		<div className="w-full overflow-x-auto whitespace-nowrap pb-4 no-scrollbar">
			<div className="flex gap-3 px-1">
				{subjects.map((subject) => {
					const colors = getColor(subject);
					const isSelected = subject === selectedSubject;
					return (
						<button
							type="button"
							key={subject}
							onClick={() => onSelect(subject)}
							className={cn(
								"h-12 px-6 rounded-2xl text-sm font-black transition-all shrink-0 active:scale-95",
								isSelected
									? cn(colors.bg, "text-white shadow-xl scale-105 shadow-primary/20")
									: "bg-muted/10 text-muted-foreground/60 hover:bg-muted/20"
							)}
						>
							{subject}
						</button>
					);
				})}
			</div>
		</div>
	);
}

export function getSubjectColor(subject: string) {
	switch (subject) {
		case 'Physical Sciences':
			return {
				bg: 'bg-physics',
				text: 'text-physics',
				border: 'border-physics',
				bgSoft: 'bg-physics/5',
				borderSoft: 'hover:border-physics/30',
				shadow: 'shadow-physics/20',
			};
		case 'Mathematics':
			return {
				bg: 'bg-math',
				text: 'text-math',
				border: 'border-math',
				bgSoft: 'bg-math/5',
				borderSoft: 'hover:border-math/30',
				shadow: 'shadow-math/20',
			};
		case 'Life Sciences':
			return {
				bg: 'bg-life-sci',
				text: 'text-life-sci',
				border: 'border-life-sci',
				bgSoft: 'bg-life-sci/5',
				borderSoft: 'hover:border-life-sci/30',
				shadow: 'shadow-life-sci/20',
			};
		case 'Accounting':
			return {
				bg: 'bg-accounting',
				text: 'text-accounting',
				border: 'border-accounting',
				bgSoft: 'bg-accounting/5',
				borderSoft: 'hover:border-accounting/30',
				shadow: 'shadow-accounting/20',
			};
		case 'English HL':
			return {
				bg: 'bg-english',
				text: 'text-english',
				border: 'border-english',
				bgSoft: 'bg-english/5',
				borderSoft: 'hover:border-english/30',
				shadow: 'shadow-english/20',
			};
		case 'Geography':
			return {
				bg: 'bg-geography',
				text: 'text-geography',
				border: 'border-geography',
				bgSoft: 'bg-geography/5',
				borderSoft: 'hover:border-geography/30',
				shadow: 'shadow-geography/20',
			};
		default:
			return {
				bg: 'bg-primary',
				text: 'text-primary',
				border: 'border-border',
				bgSoft: 'bg-primary/5',
				borderSoft: 'hover:border-primary/30',
				shadow: 'shadow-primary/10',
			};
	}
}
