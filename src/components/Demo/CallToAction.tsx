'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CallToAction() {
	return (
		<div className="mt-12 p-8 bg-muted/30 rounded-2xl text-center">
			<h2 className="text-2xl font-bold mb-2">Ready to Start Learning?</h2>
			<p className="text-muted-foreground mb-6 max-w-md mx-auto">
				This demo showcases our comprehensive NSC Grade 12 curriculum data. Sign up to access
				quizzes, flashcards, past papers, and more.
			</p>
			<div className="flex gap-4 justify-center">
				<Link href="/sign-up">
					<Button size="lg">Get Started Free</Button>
				</Link>
				<Link href="/dashboard">
					<Button size="lg" variant="outline">
						Go to Dashboard
					</Button>
				</Link>
			</div>
		</div>
	);
}
