'use client';

import { Clock01Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';

interface NextActionCardProps {
	suggestedSubject?: string | null;
	onClick?: () => void;
}

export function NextActionCard({ suggestedSubject, onClick }: NextActionCardProps) {
	return (
		<m.div
			whileHover={{ y: -4 }}
			whileTap={{ scale: 0.98 }}
			onClick={onClick}
			className="p-6 flex flex-col justify-between relative group overflow-hidden bg-tiimo-lavender rounded-[var(--radius-lg)] shadow-tiimo text-white cursor-pointer transition-all hover:brightness-110"
		>
			<div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
				<HugeiconsIcon icon={SparklesIcon} className="w-32 h-32" />
			</div>

			<div className="flex items-center justify-between z-10 py-2">
				<div className="p-2 bg-white/20 rounded-xl">
					<HugeiconsIcon icon={Clock01Icon} className="w-5 h-5" />
				</div>
				<span className="text-[10px] font-black tracking-wide bg-white/20 px-2 py-1 rounded-lg">
					Action
				</span>
			</div>
			<div className="z-10 pt-4">
				<p className="text-xs font-bold text-white/70 tracking-wide mb-1">
					Pick up where you left off
				</p>
				<h3 className="text-xl font-black leading-tight">
					{suggestedSubject || 'General Studies'}
				</h3>
			</div>
			<div className="flex items-center gap-2 mt-4 z-10">
				<span className="text-[10px] font-bold bg-white dark:bg-zinc-900 text-tiimo-lavender px-2 py-0.5 rounded-md">
					prompt
				</span>
				<span className="text-[10px] font-medium text-white/80 italic">Ready to finish?</span>
			</div>
		</m.div>
	);
}
