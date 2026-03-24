'use client';

import { Button } from '@/components/ui/button';

interface Subject {
	id: string;
	label: string;
	subjectId: number;
}

interface SubjectTabsProps {
	subjects: readonly Subject[];
	activeSubject: string;
	onSubjectChange: (subjectId: string) => void;
}

export function SubjectTabs({ subjects, activeSubject, onSubjectChange }: SubjectTabsProps) {
	return (
		<div className="flex gap-2 p-1 bg-muted/50 rounded-xl border border-border/50 overflow-x-auto no-scrollbar">
			{subjects.map((sub) => (
				<Button
					key={sub.id}
					type="button"
					variant="ghost"
					onClick={() => onSubjectChange(sub.id)}
					className={`px-3 py-1.5 rounded-lg text-[10px] font-bold  tracking-wider whitespace-nowrap transition-all ${
						activeSubject === sub.id
							? 'bg-primary text-primary-foreground shadow-md'
							: 'text-muted-foreground hover:text-foreground'
					}`}
				>
					{sub.label}
				</Button>
			))}
		</div>
	);
}
