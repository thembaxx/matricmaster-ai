'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
			<div className="max-w-md w-full text-center space-y-6">
				<div className="space-y-2">
					<h1 className="text-4xl font-black text-foreground">Quiz Not Found</h1>
					<p className="text-muted-foreground font-medium">
						This quiz may have been removed or the link is incorrect.
					</p>
				</div>

				<Link href="/quiz">
					<Button className="rounded-2xl">Browse Quizzes</Button>
				</Link>
			</div>
		</div>
	);
}
