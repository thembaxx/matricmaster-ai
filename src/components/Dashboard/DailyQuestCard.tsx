'use client';

import { ArrowRight02Icon, Loading03Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { STAGGER_ITEM } from '@/lib/animation-presets';

interface DailyQuestCardProps {
	totalQuestions: number;
	dailyProgress: number;
	isLoading: boolean;
	onNavigateToQuiz: () => void;
}

export const DailyQuestCard = memo(function DailyQuestCard({
	totalQuestions,
	dailyProgress,
	isLoading,
	onNavigateToQuiz,
}: DailyQuestCardProps) {
	return (
		<m.div variants={STAGGER_ITEM} className="md:col-span-2">
			<Card className="p-8 premium-glass border-none rounded-[2.5rem] h-full space-y-8 relative overflow-hidden group">
				<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
				<div className="absolute -right-8 -top-8 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-500" />

				<div className="flex justify-between items-start relative z-10">
					<div className="space-y-3">
						<m.div
							initial={{ x: -10, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							className="inline-flex items-center px-3 py-1 bg-primary/10 rounded-full"
						>
							<span className="text-[10px] font-black text-primary uppercase tracking-wider lg:text-xs">
								Daily Quest
							</span>
						</m.div>
						<h3 className="text-3xl font-black text-foreground tracking-tighter lg:text-5xl">
							Algebra Master
						</h3>
						<p className="text-sm text-muted-foreground font-bold lg:text-base">
							{totalQuestions} questions answered
						</p>
					</div>
					<m.div
						whileHover={{ rotate: 180, scale: 1.1 }}
						transition={{ type: 'spring', stiffness: 200 }}
						className="w-16 h-16 bg-card/50 rounded-2xl flex items-center justify-center border border-border/20 shadow-xl"
					>
						<HugeiconsIcon icon={SparklesIcon} className="w-8 h-8 text-brand-amber" />
					</m.div>
				</div>

				<div className="space-y-4 relative z-10">
					<div className="flex justify-between items-end">
						<span className="text-xs font-black text-foreground opacity-60 uppercase tracking-widest">
							{totalQuestions} / 100 QUESTIONS
						</span>
						<span className="text-sm font-black text-primary">{dailyProgress}%</span>
					</div>
					<div className="h-3 w-full bg-muted rounded-full overflow-hidden shadow-inner">
						<m.div
							initial={{ width: 0 }}
							animate={{ width: `${dailyProgress}%` }}
							transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
							className="h-full bg-primary rounded-full shadow-lg"
						/>
					</div>
				</div>

				<m.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
					<Button
						className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-lg font-black shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-3 relative z-10"
						onClick={onNavigateToQuiz}
						disabled={isLoading}
					>
						{isLoading ? (
							<HugeiconsIcon icon={Loading03Icon} className="w-6 h-6 animate-spin" />
						) : (
							<>
								Continue Learning
								<HugeiconsIcon icon={ArrowRight02Icon} className="w-6 h-6" />
							</>
						)}
					</Button>
				</m.div>
			</Card>
		</m.div>
	);
});
