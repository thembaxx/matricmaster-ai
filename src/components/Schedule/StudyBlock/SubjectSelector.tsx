'use client';

import { Label } from '@/components/ui/label';

interface Subject {
	id: number;
	name: string;
}

interface SubjectSelectorProps {
	id: string;
	subjects: Subject[];
	selectedSubjectId: string;
	onChange: (subjectId: string) => void;
}

export function SubjectSelector({
	id,
	subjects,
	selectedSubjectId,
	onChange,
}: SubjectSelectorProps) {
	return (
		<div className="flex flex-col gap-2.5">
			<Label htmlFor={id} className="text-xs font-bold tracking-wider text-muted-foreground ml-1">
				Subject <span className="text-muted-foreground/50 font-normal">(optional)</span>
			</Label>
			{subjects.length > 0 ? (
				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						onClick={() => onChange('')}
						className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
							selectedSubjectId === ''
								? 'bg-muted text-muted-foreground'
								: 'bg-muted/50 text-muted-foreground/70 hover:bg-muted'
						}`}
					>
						None
					</button>
					{subjects.map((subject) => (
						<button
							key={subject.id}
							type="button"
							onClick={() => onChange(String(subject.id))}
							className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
								selectedSubjectId === String(subject.id)
									? 'bg-primary text-primary-foreground shadow-md'
									: 'bg-muted/50 text-muted-foreground/70 hover:bg-muted'
							}`}
						>
							{subject.name}
						</button>
					))}
				</div>
			) : (
				<p className="text-sm text-muted-foreground/60 italic">No subjects enrolled</p>
			)}
		</div>
	);
}
