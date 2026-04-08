'use client';

import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SubjectMap } from '@/components/SubjectMap/SubjectMap';
import type { MasteryState } from '@/components/SubjectMap/types';
import { Button } from '@/components/ui/button';

const SUBJECTS = ['All', 'Mathematics', 'Physical Sciences', 'Life Sciences'] as const;

export default function SubjectMapPage() {
	const router = useRouter();
	const [activeFilter, setActiveFilter] = useState<string>('All');
	const [mastery] = useState<Record<string, MasteryState>>({});

	const filterSubject = activeFilter === 'All' ? undefined : activeFilter;

	return (
		<div className="flex flex-col h-[100dvh] bg-background">
			<header className="px-4 sm:px-6 pt-6 pb-3 flex items-center justify-between shrink-0">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.back()}
					className="rounded-full shrink-0"
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5" />
				</Button>
				<h1 className="text-lg font-bold tracking-tight">subject map</h1>
				<div className="w-10" />
			</header>

			<div className="px-4 sm:px-6 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
				{SUBJECTS.map((subject) => (
					<button
						type="button"
						key={subject}
						onClick={() => setActiveFilter(subject)}
						className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
							activeFilter === subject
								? 'bg-primary text-primary-foreground shadow-md'
								: 'bg-muted/60 text-muted-foreground hover:bg-muted'
						}`}
					>
						{subject.toLowerCase()}
					</button>
				))}
			</div>

			<main className="flex-1 px-4 sm:px-6 pb-40">
				<SubjectMap
					onNodeClick={(topic, subject) => {
						router.push(
							`/lessons?topic=${encodeURIComponent(topic)}&subject=${encodeURIComponent(subject)}`
						);
					}}
					masteryOverride={mastery}
					filterSubject={filterSubject}
				/>
			</main>
		</div>
	);
}
