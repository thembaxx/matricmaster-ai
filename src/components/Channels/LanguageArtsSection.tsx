'use client';

import { BookOpen01Icon, TranslateIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';

interface LanguageArtsCardProps {
	title: string;
	students: string;
	icon: React.ReactNode;
	bgClass: string;
}

export function LanguageArtsCard({ title, students, icon, bgClass }: LanguageArtsCardProps) {
	return (
		<div className="bg-card p-5 rounded-3xl flex flex-col gap-4 shadow-sm border border-border hover:shadow-md transition-all cursor-pointer ios-active-scale">
			<div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bgClass}`}>
				{icon}
			</div>
			<div>
				<h4 className="font-black text-foreground  tracking-tight leading-tight">{title}</h4>
				<div className="mt-3 inline-block px-3 py-1 bg-secondary rounded-lg">
					<span className="text-[10px] font-black text-label-tertiary  tracking-widest">
						{students}
					</span>
				</div>
			</div>
		</div>
	);
}

interface LanguageArtsSectionProps {
	onViewAll?: () => void;
}

export function LanguageArtsSection({ onViewAll }: LanguageArtsSectionProps) {
	const items: LanguageArtsCardProps[] = [
		{
			title: 'English House Language',
			students: '18k Students',
			icon: <HugeiconsIcon icon={BookOpen01Icon} className="w-6 h-6 text-english" />,
			bgClass: 'bg-english/10',
		},
		{
			title: 'Afrikaans FAL',
			students: '10.5k Students',
			icon: <HugeiconsIcon icon={TranslateIcon} className="w-6 h-6 text-warning" />,
			bgClass: 'bg-warning/10',
		},
	];

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between px-1">
				<h3 className="text-xl font-black text-foreground  tracking-tight">Language Arts</h3>
				<Button
					type="button"
					variant="ghost"
					className="text-[11px] font-black text-primary  tracking-[0.2em] hover:underline ios-active-scale"
					onClick={onViewAll}
				>
					View All
				</Button>
			</div>
			<div className="grid grid-cols-2 gap-4">
				{items.map((item) => (
					<LanguageArtsCard key={item.title} {...item} />
				))}
			</div>
		</section>
	);
}
