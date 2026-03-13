'use client';

import {
	Book01Icon,
	CalculatorIcon,
	Chemistry01Icon,
	Compass01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getEnrolledSubjectsAction } from '@/lib/db/actions';
import type { Subject } from '@/lib/db/schema';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
	math: CalculatorIcon,
	mathematics: CalculatorIcon,
	physics: Chemistry01Icon,
	science: Chemistry01Icon,
	'physical sciences': Chemistry01Icon,
	english: Book01Icon,
	geography: Compass01Icon,
};

const COLOR_MAP: Record<string, string> = {
	math: 'bg-tiimo-lavender',
	mathematics: 'bg-tiimo-lavender',
	physics: 'bg-tiimo-blue',
	'physical sciences': 'bg-tiimo-blue',
	english: 'bg-tiimo-orange',
	geography: 'bg-tiimo-green',
};

export function SubjectGrid() {
	const router = useRouter();
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function load() {
			const data = await getEnrolledSubjectsAction();
			setSubjects(data);
			setIsLoading(false);
		}
		load();
	}, []);

	if (isLoading) {
		return (
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
				{[1, 2, 3].map((i) => (
					<div key={i} className="aspect-square bg-secondary/50 animate-pulse rounded-[2.5rem]" />
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
			{subjects.map((subject, index) => {
				const subjectKey = subject.name.toLowerCase();
				const Icon = ICON_MAP[subjectKey] || Book01Icon;
				const color = COLOR_MAP[subjectKey] || 'bg-tiimo-gray-muted';

				return (
					<m.button
						key={subject.id}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: index * 0.05 }}
						onClick={() => router.push(`/subjects/${subject.id}`)}
						className="aspect-square bg-card rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-4 shadow-tiimo border border-border/50 transition-all hover:scale-105 group active:scale-95"
					>
						<div
							className={cn(
								'w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:rotate-12',
								color
							)}
						>
							<HugeiconsIcon icon={Icon} className="w-8 h-8 text-white" />
						</div>
						<span className="font-black text-xs uppercase tracking-widest text-center">
							{subject.name}
						</span>
					</m.button>
				);
			})}

			<button
				type="button"
				onClick={() => router.push('/subjects')}
				className="aspect-square bg-secondary/30 rounded-[2.5rem] border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-3 text-tiimo-gray-muted hover:bg-secondary/50 transition-all active:scale-95"
			>
				<div className="w-12 h-12 rounded-full border-2 border-dashed border-tiimo-gray-muted/50 flex items-center justify-center">
					<span className="text-2xl font-light">+</span>
				</div>
				<span className="font-black text-[10px] uppercase tracking-[0.2em]">Add More</span>
			</button>
		</div>
	);
}
