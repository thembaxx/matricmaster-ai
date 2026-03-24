'use client';

import { BookOpen01Icon, TranslateIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';

const languageArtsItems = [
	{
		title: 'English House Language',
		students: '18k Students',
		icon: <HugeiconsIcon icon={BookOpen01Icon} className="w-6 h-6 text-english" />,
		bg: 'bg-english/10',
	},
	{
		title: 'Afrikaans FAL',
		students: '10.5k Students',
		icon: <HugeiconsIcon icon={TranslateIcon} className="w-6 h-6 text-warning" />,
		bg: 'bg-warning/10',
	},
];

export function LanguageArtsSection() {
	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between px-1">
				<h3 className="text-xl font-black text-foreground  tracking-tight">Language Arts</h3>
				<Button
					type="button"
					variant="ghost"
					className="text-[11px] font-black text-primary  tracking-[0.2em] hover:underline ios-active-scale"
				>
					View All
				</Button>
			</div>
			<div className="grid grid-cols-2 gap-4">
				{languageArtsItems.map((item) => (
					<div
						key={item.title}
						className="bg-card p-5 rounded-3xl flex flex-col gap-4 shadow-sm border border-border hover:shadow-md transition-all cursor-pointer ios-active-scale"
					>
						<div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg}`}>
							{item.icon}
						</div>
						<div>
							<h4 className="font-black text-foreground  tracking-tight leading-tight">
								{item.title}
							</h4>
							<div className="mt-3 inline-block px-3 py-1 bg-secondary rounded-lg">
								<span className="text-[10px] font-black text-label-tertiary  tracking-widest">
									{item.students}
								</span>
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
