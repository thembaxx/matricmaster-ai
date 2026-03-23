'use client';

import { FluentEmoji } from '@lobehub/fluent-emoji';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SUBJECTS, type SubjectId } from '@/constants/subjects';
import { getEnrolledSubjectsAction } from '@/lib/db/actions';
import { cn } from '@/lib/utils';

const COLOR_MAP: Record<string, string> = {
	math: 'bg-tiimo-lavender',
	mathematics: 'bg-tiimo-lavender',
	physics: 'bg-tiimo-blue',
	'physical sciences': 'bg-tiimo-blue',
	english: 'bg-tiimo-orange',
	geography: 'bg-tiimo-green',
	'life sciences': 'bg-tiimo-green',
	history: 'bg-tiimo-orange',
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
	const { data: subjectsData, isLoading } = useQuery({
		queryKey: ['enrolled-subjects'],
		queryFn: () => getEnrolledSubjectsAction(),
	});

	const subjects = (subjectsData?.length ?? 0) > 0 ? (subjectsData ?? []) : MOCK_SUBJECTS;

	if (isLoading) {
		return (
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
				{[1, 2, 3, 4, 5, 6].map((item) => (
					<div
						key={`subject-grid-skeleton-${item}`}
						className={cn(
							'bg-secondary/50 animate-pulse rounded-2xl',
							item === 1 ? 'md:col-span-2 aspect-[2/1]' : 'aspect-square'
						)}
					/>
				))}
			</div>
		);
	}

	return (
		<m.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
			<AnimatePresence mode="popLayout">
				{subjects.map((subject, index) => {
					const subjectKey = subject.name.toLowerCase() as SubjectId;
					const subjectData = SUBJECTS[subjectKey];
					const fluentEmoji = subjectData?.fluentEmoji ?? 'Books';
					const color = COLOR_MAP[subjectKey] || 'bg-tiimo-gray-muted';
					const isLarge = index === 0;

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
							className={cn(
								'bg-card rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-tiimo border border-border/50 transition-all hover:scale-105 group',
								isLarge ? 'md:col-span-2 aspect-[2/1]' : 'aspect-square'
							)}
						>
							<div
								className={cn(
									'rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12',
									color,
									isLarge ? 'w-14 h-14' : 'w-12 h-12'
								)}
							>
								<FluentEmoji
									type='3d'
									emoji={fluentEmoji}
									size={isLarge ? 28 : 24}
									className={cn(isLarge ? 'w-7 h-7' : 'w-6 h-6', 'text-white')}
								/>
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
				className="aspect-square bg-secondary/30 rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-2 text-tiimo-gray-muted hover:bg-secondary/50 transition-all"
			>
				<div className="w-10 h-10 rounded-full border-2 border-dashed border-tiimo-gray-muted/50 flex items-center justify-center">
					<span className="text-xl font-light">+</span>
				</div>
				<span className="font-medium text-[10px]">Add more</span>
			</m.button>
		</m.div>
	);
}
