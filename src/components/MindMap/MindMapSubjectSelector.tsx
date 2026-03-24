'use client';

import { Button } from '@/components/ui/button';
import { subjectLabels } from './mindmap-data';

interface MindMapSubjectSelectorProps {
	selectedSubject: string;
	onSubjectChange: (subject: string) => void;
}

export function MindMapSubjectSelector({
	selectedSubject,
	onSubjectChange,
}: MindMapSubjectSelectorProps) {
	return (
		<div className="flex gap-2">
			{Object.entries(subjectLabels).map(([key, label]) => (
				<Button
					type="button"
					variant="ghost"
					key={key}
					onClick={() => onSubjectChange(key)}
					className={`px-3 py-1.5 h-auto rounded-lg text-sm font-medium ${
						selectedSubject === key
							? 'bg-primary text-primary-foreground'
							: 'bg-muted hover:bg-muted/80'
					}`}
				>
					{label}
				</Button>
			))}
		</div>
	);
}
