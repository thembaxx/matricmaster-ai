'use client';

import { QuestionIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface QuizListProps {
	searchQuery?: string;
}

export default function QuizList({ searchQuery: _searchQuery = '' }: QuizListProps) {
	return (
		<div className="text-center py-12 space-y-4">
			<HugeiconsIcon icon={QuestionIcon} className="w-16 h-16 mx-auto text-muted-foreground/50" />
			<p className="text-muted-foreground font-medium">No quizzes available yet.</p>
			<p className="text-sm text-muted-foreground/70">
				Check back later or try a Snap & Solve session.
			</p>
			<Button asChild>
				<Link href="/snap-and-solve">Try Snap & Solve</Link>
			</Button>
		</div>
	);
}
