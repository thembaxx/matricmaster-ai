'use client';

import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface TutorProfileLoadingProps {
	isLoading: boolean;
	tutor: { userName: string | null } | null;
}

export function TutorProfileLoading({ isLoading, tutor }: TutorProfileLoadingProps) {
	const router = useRouter();

	if (isLoading) {
		return (
			<div className="flex flex-col h-full min-w-0 bg-background pb-40 px-4 sm:px-6 lg:px-8">
				<BackgroundMesh variant="subtle" />
				<main className="max-w-4xl mx-auto w-full pt-6 space-y-6 relative z-10">
					<div className="flex items-start gap-4">
						<Skeleton className="size-20 rounded-full" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-4 w-24" />
						</div>
					</div>
				</main>
			</div>
		);
	}

	if (!tutor) {
		return (
			<div className="flex flex-col h-full min-w-0 bg-background pb-40 px-4 sm:px-6 lg:px-8">
				<BackgroundMesh variant="subtle" />
				<main className="max-w-4xl mx-auto w-full pt-6 text-center relative z-10">
					<AlertTriangle className="size-12 mx-auto text-muted-foreground mb-4" />
					<h2 className="text-xl font-bold">Tutor not found</h2>
					<Button className="mt-4" onClick={() => router.push('/marketplace')}>
						Back to Marketplace
					</Button>
				</main>
			</div>
		);
	}

	return null;
}
