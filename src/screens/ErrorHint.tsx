'use client';

import { Cancel01Icon, Idea01Icon, ViewIcon, Warning } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ErrorHint() {
	const router = useRouter();
	return (
		<div className="flex flex-col h-full bg-background">
			{/* Alert Banner - Sticky */}
			<div className="px-6 pt-12 pb-2 sticky top-0 z-20 bg-background/80 backdrop-blur-sm shrink-0">
				<div className="bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm border border-amber-200 dark:border-amber-800">
					<div className="flex items-center gap-3">
						<HugeiconsIcon icon={Warning} className="w-5 h-5 fill-amber-500 text-amber-500" />
						<span className="font-bold text-sm">Not quite right yet</span>
					</div>
					<Button
						variant="ghost"
						size="icon"
						type="button"
						onClick={() => router.push('/quiz')}
						className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
						aria-label="Close hint"
					>
						<HugeiconsIcon
							icon={Cancel01Icon}
							className="w-5 h-5 opacity-50 hover:opacity-100 transition-opacity"
						/>
					</Button>
				</div>
			</div>

			<ScrollArea className="flex-1">
				<main className="px-6 py-4 pb-12">
					{/* Original Question */}
					<div className="mb-8">
						<div className="flex justify-between items-start mb-1">
							<span className="text-xs font-bold text-muted-foreground tracking-widest">
								original question
							</span>
							<div className="w-12 h-12 bg-muted rounded-xl" />{' '}
							{/* Placeholder for question thumbnail */}
						</div>
						<h2 className="text-lg font-bold text-foreground mb-1">q4: circuit analysis</h2>
						<p className="text-sm text-muted-foreground">calculate the total resistance...</p>
					</div>

					<h1 className="text-3xl font-bold text-foreground mb-6">let's break it down</h1>

					{/* Diagram Card */}
					<Card className="p-8 mb-8 bg-card rounded-3xl shadow-sm border-border relative overflow-hidden">
						{/* Circuit Board Illustration Placeholder */}
						<div className="relative w-full aspect-square max-w-[200px] mx-auto border-2 border-green-700 rounded-lg p-6 flex items-center justify-center">
							<div className="w-full h-full border-2 border-dashed border-green-500 rounded relative">
								<div className="absolute top-1/2 left-0 -translate-y-1/2 -ml-3 w-6 h-2 bg-red-500 rounded-full" />
								<div className="absolute top-1/2 right-0 -translate-y-1/2 -mr-3 w-6 h-2 bg-red-500 rounded-full" />
								<div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-3 w-2 h-6 bg-red-500 rounded-full" />
								<div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-3 w-2 h-6 bg-red-500 rounded-full" />

								{/* Resistors */}
								<div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-12 h-4 bg-orange-300 rounded-full" />
								<div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-12 h-4 bg-orange-300 rounded-full" />
							</div>
						</div>

						{/* Focus Badge */}
						<div className="absolute bottom-4 right-4 bg-card shadow-md border border-border rounded-full px-3 py-1.5 flex items-center gap-2">
							<HugeiconsIcon icon={ViewIcon} className="w-4 h-4 text-amber-500" />
							<span className="text-xs font-bold text-foreground">focus: series path</span>
						</div>
					</Card>

					{/* Hint Section */}
					<div className="mb-8">
						<div className="flex items-center gap-2 mb-3">
							<HugeiconsIcon icon={Idea01Icon} className="w-5 h-5 text-amber-500 fill-current" />
							<span className="font-bold text-amber-500 text-sm tracking-widest">hint</span>
						</div>
						<h3 className="text-xl font-bold text-foreground mb-4 leading-tight">
							think about how the resistance changes if we add another resistor in series.
						</h3>
						<p className="text-muted-foreground text-sm leading-relaxed mb-6">
							when components are lined up one after another, the current must flow through{' '}
							<strong className="text-foreground">all of them</strong>.
						</p>

						{/* Formula Box */}
						<div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
							<p className="text-xs font-bold text-amber-800 dark:text-amber-200 mb-2 uppercase opacity-70">
								recall the formula:
							</p>
							<p className="font-mono text-lg font-bold text-amber-900 dark:text-amber-100">
								r_total = r1 + r2 + ...
							</p>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="space-y-4 text-center">
						<Button
							size="lg"
							className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-full h-14 text-base font-bold shadow-lg shadow-amber-500/20"
							onClick={() => router.push('/quiz')}
						>
							try again
						</Button>
						<Button
							variant="ghost"
							type="button"
							className="text-muted-foreground hover:text-foreground font-bold text-sm"
							onClick={() => router.push('/quiz')}
						>
							see solution
						</Button>
					</div>
				</main>
			</ScrollArea>
		</div>
	);
}
