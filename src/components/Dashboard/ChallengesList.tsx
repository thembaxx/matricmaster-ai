'use client';

import {
	BookOpen01Icon,
	Chemistry01Icon,
	Clock01Icon,
	MathIcon,
	PlayIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { STAGGER_ITEM } from '@/lib/animation-presets';

interface Challenge {
	title: string;
	time: string;
	difficulty: 'Easy' | 'Medium' | 'Hard';
	icon: React.ReactNode;
	iconBg: string;
}

const defaultChallenges: Challenge[] = [
	{
		title: 'Differentiation Rules',
		time: '10m',
		difficulty: 'Medium',
		icon: <HugeiconsIcon icon={MathIcon} className="w-6 h-6 text-blue-500" />,
		iconBg: 'bg-blue-50 dark:bg-blue-900/20',
	},
	{
		title: "Newton's Second Law",
		time: '20m',
		difficulty: 'Hard',
		icon: <HugeiconsIcon icon={Chemistry01Icon} className="w-6 h-6 text-purple-500" />,
		iconBg: 'bg-purple-50 dark:bg-purple-900/20',
	},
	{
		title: 'Poetry Analysis',
		time: '5m',
		difficulty: 'Easy',
		icon: <HugeiconsIcon icon={BookOpen01Icon} className="w-6 h-6 text-emerald-500" />,
		iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
	},
];

export const ChallengesList = memo(function ChallengesList() {
	const router = useRouter();

	return (
		<m.div variants={STAGGER_ITEM} className="space-y-6">
			<div className="flex justify-between items-center">
				<h3 className="text-xl font-black text-foreground tracking-tighter uppercase">Deep Work</h3>
				<Button
					variant="ghost"
					size="sm"
					className="font-black text-[10px] uppercase tracking-widest text-primary"
				>
					View All
				</Button>
			</div>
			<div className="space-y-4">
				{defaultChallenges.map((challenge) => (
					<m.button
						key={challenge.title}
						variants={STAGGER_ITEM}
						whileHover={{ x: 10 }}
						whileTap={{ scale: 0.98 }}
						type="button"
						className="w-full text-left premium-glass p-5 rounded-[2rem] flex items-center justify-between group transition-all cursor-pointer border-transparent hover:border-primary/20 premium-glass-hover shadow-sm"
						onClick={() => router.push('/quiz')}
					>
						<div className="flex items-center gap-4">
							<m.div
								className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${challenge.iconBg}`}
							>
								{challenge.icon}
							</m.div>
							<div className="space-y-1">
								<h4 className="font-black text-sm text-foreground">{challenge.title}</h4>
								<div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
									<div className="flex items-center gap-1">
										<HugeiconsIcon icon={Clock01Icon} className="w-3 h-3" />
										{challenge.time}
									</div>
									<span className="w-1 h-1 rounded-full bg-border" />
									<div
										className={`${
											challenge.difficulty === 'Hard'
												? 'text-rose-500'
												: challenge.difficulty === 'Medium'
													? 'text-brand-amber'
													: 'text-brand-green'
										}`}
									>
										{challenge.difficulty}
									</div>
								</div>
							</div>
						</div>
						<div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
							<HugeiconsIcon icon={PlayIcon} className="w-4 h-4 fill-current ml-0.5" />
						</div>
					</m.button>
				))}
			</div>
		</m.div>
	);
});
