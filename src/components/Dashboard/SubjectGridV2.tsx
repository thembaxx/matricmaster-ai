'use client';

import { AtomIcon, BookOpen01Icon, CalculatorIcon, Cursor01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const SUBJECTS = [
	{
		id: 'math',
		name: 'Maths',
		icon: CalculatorIcon,
		color: 'text-subject-math',
		bgColor: 'bg-subject-math-soft',
	},
	{
		id: 'physics',
		name: 'Physics',
		icon: AtomIcon,
		color: 'text-subject-physics',
		bgColor: 'bg-subject-physics-soft',
	},
	{
		id: 'life',
		name: 'Life Sci',
		icon: AtomIcon,
		color: 'text-subject-life',
		bgColor: 'bg-subject-life-soft',
	},
	{
		id: 'accounting',
		name: 'Account',
		icon: Cursor01Icon,
		color: 'text-subject-accounting',
		bgColor: 'bg-subject-accounting-soft',
	},
	{
		id: 'english',
		name: 'English',
		icon: BookOpen01Icon,
		color: 'text-subject-english',
		bgColor: 'bg-subject-english-soft',
	},
];

export function SubjectGrid() {
	return (
		<section>
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-black text-foreground tracking-tight">Your Subjects</h2>
				<Link
					href="/subjects"
					className="text-[10px] font-black text-tiimo-lavender uppercase tracking-widest hover:underline"
				>
					View All
				</Link>
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
				{SUBJECTS.map((subject, index) => (
					<m.div
						key={subject.id}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: index * 0.05 }}
						whileTap={{ scale: 0.95 }}
						className="tiimo-press"
					>
						<Link
							href={`/subjects/${subject.id}`}
							className={cn(
								'flex flex-col items-center justify-center p-6 rounded-[2rem] transition-all border border-border/50 shadow-tiimo bg-card hover:shadow-tiimo-lg hover:border-primary/20 h-full'
							)}
						>
							<m.div
								layoutId={`subject-icon-${subject.id}`}
								className={cn('p-4 rounded-[1.5rem] mb-3', subject.bgColor)}
							>
								<HugeiconsIcon icon={subject.icon} className={cn('w-7 h-7', subject.color)} />
							</m.div>
							<span className="font-black text-xs uppercase tracking-tighter text-center line-clamp-1">
								{subject.name}
							</span>
						</Link>
					</m.div>
				))}
			</div>
		</section>
	);
}
