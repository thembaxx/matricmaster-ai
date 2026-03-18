'use client';

import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ScienceLabPage() {
	const router = useRouter();
	const pathname = usePathname();

	const activeTab = pathname.split('/').pop() || 'circuits';

	return (
		<div className="flex flex-col h-full">
			<header className="px-6 pt-12 pb-40 bg-card border-b border-border">
				<div className="flex items-center gap-4 mb-4">
					<Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
						<HugeiconsIcon icon={ArrowLeft02Icon} className="w-5 h-5" />
					</Button>
					<h1 className="text-xl font-black">Virtual Science Lab</h1>
				</div>

				<Tabs value={activeTab} onValueChange={(v) => router.push(`/science-lab/${v}`)}>
					<TabsList className="grid grid-cols-3 w-full">
						<TabsTrigger value="circuits">Electric Circuits</TabsTrigger>
						<TabsTrigger value="momentum">Momentum</TabsTrigger>
						<TabsTrigger value="waves">Wave Motion</TabsTrigger>
					</TabsList>
				</Tabs>
			</header>

			<main className="flex-1 p-6">
				{activeTab === 'circuits' && (
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-2">
							<div className="bg-card rounded-2xl p-8 min-h-[400px]">
								<p className="text-muted-foreground">Loading circuits simulation...</p>
							</div>
						</div>
						<div>
							<div className="bg-card rounded-2xl p-4 min-h-[300px]">
								<p className="text-muted-foreground">Loading controls...</p>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
