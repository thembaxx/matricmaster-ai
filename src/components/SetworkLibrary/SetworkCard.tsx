'use client';

import { BookOpenIcon, UserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import type { Setwork } from '@/content/setworks/types';

interface SetworkCardProps {
	setwork: Setwork;
}

export function SetworkCard({ setwork }: SetworkCardProps) {
	const router = useRouter();

	return (
		<Card
			className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
			onClick={() => router.push(`/setwork-library/${setwork.id}`)}
		>
			<div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl mb-4 flex items-center justify-center">
				<HugeiconsIcon icon={BookOpenIcon} className="w-16 h-16 text-primary/30" />
			</div>

			<h3 className="font-black text-lg mb-1">{setwork.title}</h3>
			<p className="text-sm text-muted-foreground mb-3">{setwork.author}</p>

			<div className="flex gap-4 text-xs text-muted-foreground">
				<span className="flex items-center gap-1">
					<HugeiconsIcon icon={UserIcon} className="w-3 h-3" />
					{setwork.characters.length} characters
				</span>
				<span>{setwork.themes.length} themes</span>
			</div>

			<div className="mt-3 flex gap-2">
				<span className="text-xs px-2 py-1 bg-secondary rounded-full capitalize">
					{setwork.genre}
				</span>
				<span className="text-xs px-2 py-1 bg-secondary rounded-full">{setwork.targetLevel}</span>
			</div>
		</Card>
	);
}
