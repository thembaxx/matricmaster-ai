import { ChampionIcon, LockIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';

interface Badge {
	id: string;
	name: string;
	icon: string | null;
	iconBg: string;
	unlocked: boolean;
	category: 'all' | 'science' | 'math' | 'history' | 'streak';
	description?: string;
}

export function BadgesGridSection({ filteredBadges }: { filteredBadges: Badge[] }) {
	return (
		<AnimatePresence mode="wait">
			{filteredBadges.length === 0 ? (
				<m.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="text-center py-32 space-y-4 opacity-50"
				>
					<HugeiconsIcon
						icon={LockIcon}
						aria-hidden="true"
						className="w-16 h-16 mx-auto text-muted-foreground"
					/>
					<p className="text-xl font-bold uppercase tracking-widest">No achievements yet.</p>
				</m.div>
			) : (
				<m.div
					variants={STAGGER_CONTAINER}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8"
				>
					{filteredBadges.map((badge) => (
						<m.div key={badge.id} variants={STAGGER_ITEM}>
							<Card
								className={`group relative h-full flex flex-col items-center gap-6 p-8 rounded-[2.5rem] border-2 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
									badge.unlocked
										? 'bg-card border-border hover:border-primary/20 hover:shadow-primary/5'
										: 'bg-muted/30 border-dashed border-muted-foreground/20 opacity-60'
								}`}
							>
								<div
									className={`w-24 h-24 lg:w-32 lg:h-32 rounded-[2rem] flex items-center justify-center relative transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${
										badge.unlocked ? 'shadow-xl' : 'grayscale'
									}`}
									style={{
										backgroundColor: badge.unlocked ? badge.iconBg : 'var(--muted)',
									}}
								>
									{badge.unlocked ? (
										badge.icon ? (
											<span aria-hidden="true" className="text-5xl lg:text-6xl drop-shadow-xl">
												{badge.icon}
											</span>
										) : (
											<HugeiconsIcon
												icon={ChampionIcon}
												aria-hidden="true"
												className="w-12 h-12 text-primary"
											/>
										)
									) : (
										<HugeiconsIcon
											icon={LockIcon}
											aria-hidden="true"
											className="w-10 h-10 text-muted-foreground/30"
										/>
									)}
								</div>

								<div className="text-center space-y-2">
									<h3
										className={`text-lg font-black tracking-tighter leading-none ${
											badge.unlocked ? 'text-foreground' : 'text-muted-foreground'
										}`}
									>
										{badge.name}
									</h3>
									<p
										className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border-2 inline-block ${
											badge.unlocked
												? 'text-primary border-primary/20 bg-primary/5'
												: 'text-muted-foreground/50 border-muted-foreground/10'
										}`}
									>
										{badge.unlocked ? 'Mastered' : 'Locked'}
									</p>
								</div>

								<div className="absolute inset-0 bg-primary rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
									<p className="text-primary-foreground font-black text-sm uppercase tracking-widest mb-2">
										{badge.name}
									</p>
									<p className="text-primary-foreground/80 text-xs font-bold leading-relaxed">
										{badge.description || 'Complete challenges to unlock this achievement!'}
									</p>
								</div>
							</Card>
						</m.div>
					))}
				</m.div>
			)}
		</AnimatePresence>
	);
}
