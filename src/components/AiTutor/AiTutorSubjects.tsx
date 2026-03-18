'use client';

import { Button } from '@/components/ui/button';
import { SUBJECTS } from '@/constants/subjects';
import { cn } from '@/lib/utils';

interface AiTutorSubjectsProps {
	selectedSubject: string | null;
	setSelectedSubject: (id: string | null) => void;
}

const subjects = [
	{ id: 'mathematics', name: 'Mathematics', color: 'bg-math', icon: SUBJECTS.mathematics.emoji },
	{ id: 'physics', name: 'Physics', color: 'bg-physics', icon: SUBJECTS.physics.emoji },
	{ id: 'chemistry', name: 'Chemistry', color: 'bg-brand-amber', icon: SUBJECTS.chemistry.emoji },
	{
		id: 'life sciences',
		name: 'Life Sciences',
		color: 'bg-life-sci',
		icon: SUBJECTS['life-sciences'].emoji,
	},
];

export function AiTutorSubjects({ selectedSubject, setSelectedSubject }: AiTutorSubjectsProps) {
	return (
		<div className="border-b bg-surface-base/50 backdrop-blur-md px-4 md:px-6 py-3">
			<div className="max-w-4xl mx-auto">
				<div className="flex flex-wrap gap-2">
					{subjects.map((subject) => (
						<Button
							key={subject.id}
							variant={selectedSubject === subject.id ? 'default' : 'outline'}
							size="sm"
							onClick={() => setSelectedSubject(selectedSubject === subject.id ? null : subject.id)}
							className={cn(
								'gap-1.5 md:gap-2 rounded-xl md:rounded-2xl border-border/50 transition-all duration-300 text-xs md:text-sm',
								selectedSubject === subject.id
									? 'shadow-lg scale-105'
									: 'bg-surface-elevated/30 hover:bg-surface-elevated'
							)}
						>
							<span className="text-sm">{subject.icon}</span>
							<span className="font-bold hidden sm:inline">{subject.name}</span>
						</Button>
					))}
				</div>
			</div>
		</div>
	);
}
