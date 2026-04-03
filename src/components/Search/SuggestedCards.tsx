'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Icon } from '@iconify/react';
import { m } from 'framer-motion';
import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { STAGGER_ITEM } from '@/lib/animation-presets';

export const SuggestedCards = memo(function SuggestedCards() {
	return (
		<m.div variants={STAGGER_ITEM} className="space-y-6">
			<h2 className="text-[10px] font-black text-muted-foreground  tracking-[0.3em]">
				Suggested for You
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<m.div whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}>
					<Card className="p-8 bg-linear-to-br from-primary/10 to-brand-purple/10 border-none rounded-[2.5rem] relative overflow-hidden group h-full">
						<div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-125 transition-transform duration-700" />
						<div className="relative z-10 flex items-center gap-8">
							<div className="w-20 h-20 rounded-[1.5rem] bg-card flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform">
								<HugeiconsIcon icon={SparklesIcon} className="w-10 h-10 text-brand-amber" />
							</div>
							<div className="space-y-1">
								<h3 className="text-xl font-black text-foreground tracking-tighter ">
									Physics Mastery
								</h3>
								<p className="text-xs font-bold text-muted-foreground  tracking-widest">
									Personalized Challenges
								</p>
							</div>
						</div>
					</Card>
				</m.div>
				<m.div whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}>
					<Card className="p-8 bg-linear-to-br from-emerald-500/10 to-primary/10 border-none rounded-[2.5rem] relative overflow-hidden group h-full">
						<div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-125 transition-transform duration-700" />
						<div className="relative z-10 flex items-center gap-8">
							<div className="w-20 h-20 rounded-[1.5rem] bg-card flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform">
								<Icon
									icon="fluent:hat-graduation-24-filled"
									className="w-10 h-10 text-emerald-500"
								/>
							</div>
							<div className="space-y-1">
								<h3 className="text-xl font-black text-foreground tracking-tighter ">
									Past Paper Vault
								</h3>
								<p className="text-xs font-bold text-muted-foreground  tracking-widest">
									Over 10,000 resources
								</p>
							</div>
						</div>
					</Card>
				</m.div>
			</div>
		</m.div>
	);
});
