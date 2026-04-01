import { ChampionIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { appConfig } from '@/app.config';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function HeroStatisticsCard({
	masteryLevel,
	progress,
	unlockedCount,
	badgesToNext,
}: {
	masteryLevel: number;
	progress: number;
	unlockedCount: number;
	badgesToNext: number;
}) {
	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
		>
			<Card className="rounded-2xl sm:rounded-[3rem] p-6 sm:p-12 relative overflow-hidden bg-primary text-primary-foreground border-none shadow-2xl shadow-primary/20">
				<div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
				<div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[80px] -ml-24 -mb-24 pointer-events-none" />

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
					<div className="space-y-6">
						<div className="space-y-1">
							<p className="text-xs font-black  tracking-[0.4em] opacity-80">{appConfig.name}</p>
							<h2 className="text-4xl sm:text-5xl lg:text-8xl font-black tracking-tighter  leading-none">
								Level {masteryLevel}
							</h2>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between text-sm font-black  tracking-widest">
								<span>Mastery Progress</span>
								<span>{Math.round(progress)}%</span>
							</div>
							<Progress value={progress} className="h-4 bg-white/20" />
							<p className="text-sm font-bold opacity-80">
								{badgesToNext > 0
									? `Unlock ${badgesToNext} more badges to reach Level ${masteryLevel + 1}!`
									: 'You are at peak mastery! Keep going!'}
							</p>
						</div>
					</div>

					<div className="flex justify-center md:justify-end">
						<div className="relative">
							<m.div
								animate={{ rotate: 360 }}
								transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
								className="absolute inset-0 bg-white/10 rounded-full blur-2xl"
							/>
							<div className="w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 rounded-2xl sm:rounded-[3.5rem] bg-white/10 backdrop-blur-3xl flex items-center justify-center border-4 border-white/20 shadow-2xl relative z-10">
								<HugeiconsIcon
									icon={ChampionIcon}
									aria-hidden="true"
									className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 text-white drop-shadow-2xl"
								/>
							</div>
							<div className="absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6 w-14 h-14 sm:w-20 sm:h-20 bg-brand-amber rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl border-4 border-white z-20">
								<span className="text-lg sm:text-2xl font-black text-white">{unlockedCount}</span>
							</div>
						</div>
					</div>
				</div>
			</Card>
		</m.div>
	);
}
