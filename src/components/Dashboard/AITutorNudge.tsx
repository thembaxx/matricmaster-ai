'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion as m } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { checkForNudges, dismissNudge } from '@/actions/nudge-system';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DURATION, EASING } from '@/lib/animation-presets';

interface AITutorNudgeProps {
	className?: string;
}

export function AITutorNudge(_props: AITutorNudgeProps) {
	const router = useRouter();
	const [isVisible, setIsVisible] = useState(false);

	const { data: nudges = [], isPending } = useQuery({
		queryKey: ['nudges'],
		queryFn: checkForNudges,
		staleTime: 5 * 60 * 1000,
	});

	const nudge = nudges[0] ?? null;

	const dismissMutation = useMutation({
		mutationFn: (id: string) => dismissNudge(id),
	});

	useEffect(() => {
		if (!isPending && nudge) {
			const timer = setTimeout(() => setIsVisible(true), 100);
			return () => clearTimeout(timer);
		}
	}, [isPending, nudge]);

	const handleDismiss = () => {
		setIsVisible(false);
		setTimeout(() => {
			if (nudge) dismissMutation.mutate(nudge.id);
		}, 200);
	};

	const handleAction = () => {
		if (nudge?.actionUrl) {
			setIsVisible(false);
			setTimeout(() => {
				dismissMutation.mutate(nudge.id);
				router.push(nudge.actionUrl!);
			}, 200);
		}
	};

	if (isPending || !nudge) return null;

	return (
		<AnimatePresence mode="wait" initial={false}>
			{isVisible && (
				<m.div
					initial={{ opacity: 0, y: -20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -20, scale: 0.95 }}
					transition={{ duration: DURATION.normal, ease: EASING.easeOut }}
				>
					<Card className="bg-gradient-to-r from-violet-500 via-violet-600 to-purple-600 text-white p-4 shadow-lg border-0 overflow-hidden relative">
						<div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-purple-400/20 animate-[pulse_3s_ease-in-out_infinite]" />
						<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
						<div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

						<div className="flex items-start gap-3 relative z-10">
							<m.div
								className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm"
								whileHover={{ scale: 1.05 }}
								transition={{ duration: DURATION.quick, ease: EASING.easeOut }}
							>
								<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5" />
							</m.div>

							<div className="flex-1 min-w-0">
								<m.h3
									className="font-bold text-base leading-tight font-display"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.1 }}
								>
									{nudge.title.toLowerCase()}
								</m.h3>
								<m.p
									className="text-sm text-white/85 mt-1.5 leading-relaxed line-clamp-2 italic"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.15 }}
								>
									{nudge.message.toLowerCase()}
								</m.p>

								<m.div
									className="flex gap-2 mt-3"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2 }}
								>
									{nudge.actionUrl && (
										<Button
											size="sm"
											variant="secondary"
											className="bg-white text-violet-700 hover:bg-white/90 font-semibold shadow-sm italic"
											onClick={handleAction}
										>
											{nudge.actionLabel}
										</Button>
									)}
									<Button
										size="sm"
										variant="ghost"
										className="text-white/80 hover:text-white hover:bg-white/10 font-medium italic"
										onClick={handleDismiss}
									>
										got it
									</Button>
								</m.div>
							</div>
						</div>
					</Card>
				</m.div>
			)}
		</AnimatePresence>
	);
}
