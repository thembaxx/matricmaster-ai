'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SubjectsSkeleton() {
	return (
		<div className="container mx-auto max-w-6xl px-4 pt-8 pb-32">
			<div className="flex items-center gap-4 mb-8">
				<Skeleton className="h-10 w-10 rounded-full" />
				<div>
					<h1 className="text-4xl font-black tracking-tight text-foreground ">
						<Skeleton className="h-10 w-64 rounded-xl" />
					</h1>
					<div className="text-muted-foreground font-bold  text-xs tracking-widest mt-1">
						<Skeleton className="h-3 w-48 rounded-full" />
					</div>
				</div>
			</div>

			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{[1, 2, 3, 4, 5, 6].map((item) => (
					<Card
						key={`subjects-skeleton-${item}`}
						className="shadow-tiimo border-border/50 overflow-hidden flex flex-col"
					>
						<CardHeader className="bg-muted/30">
							<CardTitle className="text-xl font-black  tracking-tight">
								<Skeleton className="h-6 w-40 rounded-full" />
							</CardTitle>
							<CardDescription className="text-xs font-bold  tracking-wider">
								<Skeleton className="h-3 w-24 rounded-full" />
							</CardDescription>
						</CardHeader>
						<CardContent className="p-6 flex-1 flex flex-col gap-6">
							<div className="space-y-2">
								<Skeleton className="h-4 w-full rounded-full" />
								<Skeleton className="h-4 w-3/4 rounded-full" />
								<Skeleton className="h-4 w-1/2 rounded-full" />
							</div>

							<div className="mt-auto">
								<Skeleton className="h-10 w-full rounded-full" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
