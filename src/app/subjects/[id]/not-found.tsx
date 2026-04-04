'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
			<div className="max-w-md w-full text-center space-y-6">
				<div className="space-y-2">
					<h1 className="text-4xl font-black text-foreground">Subject Not Found</h1>
					<p className="text-muted-foreground font-medium">
						This subject is not available in the curriculum.
					</p>
				</div>

				<Link href="/subjects">
					<Button className="rounded-2xl">Browse Subjects</Button>
				</Link>
			</div>
		</div>
	);
}
