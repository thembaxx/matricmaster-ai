'use client';

import {
	Book01Icon,
	CalculatorIcon,
	Chemistry01Icon,
	Compass01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getEnrolledSubjectsAction } from '@/lib/db/actions';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, typeof CalculatorIcon> = {
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

interface EnrolledSubject {
	id: number;
	name: string;
	description: string | null;
}

const MOCK_SUBJECTS: EnrolledSubject[] = [
	{ id: 1, name: 'Mathematics', description: 'Core mathematics curriculum' },
	{ id: 2, name: 'Physics', description: 'Physical sciences and mechanics' },
	{ id: 3, name: 'English', description: 'Language and literature' },
	{ id: 4, name: 'Life Sciences', description: 'Biology and biotechnology' },
	{ id: 5, name: 'Geography', description: 'Earth sciences and spatial awareness' },
	{ id: 6, name: 'History', description: 'South African and world history' },
];

export function SubjectGrid() {
	const router = useRouter();
	const [subjects, setSubjects] = useState<EnrolledSubject[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function load() {
			const data = await getEnrolledSubjectsAction();
			setSubjects(data.length > 0 ? data : MOCK_SUBJECTS);
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
		<m.div layout className="grid grid-cols-2 sm:grid-cols-3 gap-6">
			<AnimatePresence mode="popLayout">
				{subjects.map((subject, index) => {
					const subjectKey = subject.name.toLowerCase();
					const Icon = ICON_MAP[subjectKey] || Book01Icon;
					const color = COLOR_MAP[subjectKey] || 'bg-tiimo-gray-muted';

					return (
						<m.button
							layout
							key={subject.id}
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							transition={{ delay: index * 0.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => router.push(`/subjects/${subject.id}`)}
							className="aspect-square bg-card rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-4 shadow-tiimo border border-border/50 transition-all hover:scale-105 group"
						>
							<div
								className={cn(
									'w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:rotate-12',
									color
								)}
							>
								<HugeiconsIcon icon={Icon} className="w-8 h-8 text-white" />
							</div>
							<span className="font-medium text-xs text-center">{subject.name}</span>
						</m.button>
					);
				})}
			</AnimatePresence>

			<m.button
				layout
				type="button"
				whileTap={{ scale: 0.95 }}
				onClick={() => router.push('/subjects')}
				className="aspect-square bg-secondary/30 rounded-[2.5rem] border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-3 text-tiimo-gray-muted hover:bg-secondary/50 transition-all"
			>
				<div className="w-12 h-12 rounded-full border-2 border-dashed border-tiimo-gray-muted/50 flex items-center justify-center">
					<span className="text-2xl font-light">+</span>
				</div>
				<span className="font-medium text-[10px]">Add more</span>
			</m.button>
		</m.div>
	);
}
