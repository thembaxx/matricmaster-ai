'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const SUBJECTS = [
	'Mathematics',
	'Physics',
	'Chemistry',
	'English',
	'History',
	'Economics',
	'Accounting',
];

interface SubjectSelectorProps {
	currentSubject: string;
	onSelect: (subject: string) => void;
	onClose: () => void;
}

export function SubjectSelector({ currentSubject, onSelect, onClose }: SubjectSelectorProps) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				type="button"
				className="absolute inset-0 bg-black/50 cursor-default"
				onClick={onClose}
				aria-label="Close modal"
			/>
			<Card className="w-full max-w-md p-6 bg-background relative z-10">
				<h3 className="text-lg font-bold mb-4">Select Subject</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
					{SUBJECTS.map((subject) => (
						<Button
							key={subject}
							variant={currentSubject === subject ? 'default' : 'outline'}
							onClick={() => onSelect(subject)}
							className="rounded-xl"
						>
							{subject}
						</Button>
					))}
				</div>
			</Card>
		</div>
	);
}
