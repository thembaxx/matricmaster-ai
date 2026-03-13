'use client';

import {
	AtomIcon,
	BookOpen01Icon,
	CalculatorIcon,
	Cursor01Icon,
	PlusSignIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getEnrolledSubjectsAction } from '@/lib/db/actions';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, any> = {
	math: CalculatorIcon,
	mathematics: CalculatorIcon,
	physics: AtomIcon,
	physical_sciences: AtomIcon,
	life: AtomIcon,
	life_sciences: AtomIcon,
	accounting: Cursor01Icon,
	geography: BookOpen01Icon,
	business: CalculatorIcon,
	history: BookOpen01Icon,
	economics: CalculatorIcon,
	lo: BookOpen01Icon,
};

const COLOR_MAP: Record<string, { color: string; bgColor: string }> = {
	math: { color: 'text-subject-math', bgColor: 'bg-subject-math-soft' },
	physics: { color: 'text-subject-physics', bgColor: 'bg-subject-physics-soft' },
	life: { color: 'text-subject-life', bgColor: 'bg-subject-life-soft' },
	accounting: { color: 'text-subject-accounting', bgColor: 'bg-subject-accounting-soft' },
	geography: { color: 'text-subject-geography', bgColor: 'bg-subject-geography-soft' },
	history: { color: 'text-subject-history', bgColor: 'bg-subject-history-soft' },
};

export function SubjectGrid() {
	const [subjects, setSubjects] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function loadEnrolled() {
			try {
				const enrolled = await getEnrolledSubjectsAction();
				setSubjects(enrolled);
			} catch (error) {
				console.error('Failed to load enrolled subjects:', error);
			} finally {
				setIsLoading(false);
			}
		}
		loadEnrolled();
	}, []);

	if (isLoading) {
		return (
			<div className="h-32 flex items-center justify-center font-bold uppercase text-[10px] tracking-widest text-muted-foreground animate-pulse">
				Syncing Subjects...
			</div>
		);
	}

	return (
		<section>
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-black text-foreground tracking-tight">Your Subjects</h2>
				<Link
					href="/subjects"
					className="text-[10px] font-black text-tiimo-lavender uppercase tracking-widest hover:underline flex items-center gap-1"
				>
					<HugeiconsIcon icon={PlusSignIcon} className="w-3 h-3" />
					Add More
				</Link>
			</div>

			{subjects.length > 0 ? (
				<div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
					{subjects.map((subject, index) => {
						const slug = subject.name.toLowerCase().replace(/ /g, '_');
						const theme = COLOR_MAP[slug] || COLOR_MAP.math;
						const Icon = ICON_MAP[slug] || BookOpen01Icon;

						return (
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
										className={cn('p-4 rounded-[1.5rem] mb-3', theme.bgColor)}
									>
										<HugeiconsIcon icon={Icon} className={cn('w-7 h-7', theme.color)} />
									</m.div>
									<span className="font-black text-xs uppercase tracking-tighter text-center line-clamp-1">
										{subject.name}
									</span>
								</Link>
							</m.div>
						);
					})}
				</div>
			) : (
				<div className="p-12 text-center bg-muted/20 rounded-[2.5rem] border border-dashed border-border">
					<p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">
						No subjects enrolled
					</p>
					<Button
						asChild
						className="rounded-full font-black uppercase text-xs tracking-widest px-8"
					>
						<Link href="/subjects">Explore Marketplace</Link>
					</Button>
				</div>
			)}
		</section>
	);
}
