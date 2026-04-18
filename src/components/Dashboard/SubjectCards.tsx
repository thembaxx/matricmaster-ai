'use client';

import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { SubjectCardItem } from './SubjectCardItem';
import { SubjectCardModal } from './SubjectCardModal';

export interface Subject {
	id: string;
	title: string;
	progress: number;
	color: string;
	bgColor: string;
	progressBar?: string;
	emoji: string;
	topics: number;
	description: string;
}

const subjects: Subject[] = [
	{
		id: 'math',
		title: 'Mathematics',
		progress: 78,
		color: 'text-subject-math',
		bgColor: 'bg-subject-math-soft',
		progressBar: 'progress-bar-math',
		emoji: '🧮',
		topics: 12,
		description: 'Calculus, Trigonometry, and Financial Maths.',
	},
	{
		id: 'physics',
		title: 'Physical Sciences',
		progress: 62,
		color: 'text-subject-physics',
		bgColor: 'bg-subject-physics-soft',
		progressBar: 'progress-bar-physics',
		emoji: '⚛️',
		topics: 15,
		description: 'Newtonian Mechanics, Electricity, and Chemistry.',
	},
	{
		id: 'lifesci',
		title: 'Life Sciences',
		progress: 85,
		color: 'text-subject-life',
		bgColor: 'bg-subject-life-soft',
		progressBar: 'progress-bar-life',
		emoji: '🧬',
		topics: 10,
		description: 'DNA, Genetics, and Human Evolution.',
	},
	{
		id: 'accounting',
		title: 'Accounting',
		progress: 45,
		color: 'text-subject-accounting',
		bgColor: 'bg-subject-accounting-soft',
		progressBar: 'progress-bar-accounting',
		emoji: '💰',
		topics: 8,
		description: 'Financial Statements and Cost Accounting.',
	},
];

export function SubjectCards() {
	const [selectedId, setSelectedId] = useState<string | null>(null);

	const selectedSubject = subjects.find((s) => s.id === selectedId);

	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative">
			{subjects.map((subject) => (
				<SubjectCardItem
					key={subject.id}
					subject={subject}
					onClick={() => setSelectedId(subject.id)}
				/>
			))}

			<AnimatePresence>
				{selectedId && selectedSubject && (
					<SubjectCardModal subject={selectedSubject} onClose={() => setSelectedId(null)} />
				)}
			</AnimatePresence>
		</div>
	);
}
