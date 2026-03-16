'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { checkForNudges, dismissNudge, type Nudge } from '@/actions/nudge-system';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AITutorNudgeProps {
	className?: string;
}

export function AITutorNudge(_props: AITutorNudgeProps) {
	const router = useRouter();
	const [nudge, setNudge] = useState<Nudge | null>(null);
	const [loading, setLoading] = useState(true);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		let mounted = true;
		async function loadNudge() {
			try {
				const nudges = await checkForNudges();
				if (mounted && nudges.length > 0) {
					setNudge(nudges[0]);
					setTimeout(() => setIsVisible(true), 100);
				}
			} catch {
				console.error('Failed to load nudge');
			} finally {
				if (mounted) setLoading(false);
			}
		}
		loadNudge();
		return () => {
			mounted = false;
		};
	}, []);

	const handleDismiss = () => {
		setIsVisible(false);
		setTimeout(() => {
			if (nudge) dismissNudge(nudge.id);
			setNudge(null);
		}, 200);
	};

	const handleAction = () => {
		if (nudge?.actionUrl) {
			setIsVisible(false);
			setTimeout(() => {
				dismissNudge(nudge.id);
				router.push(nudge.actionUrl!);
			}, 200);
		}
	};

	if (loading || !nudge) return null;

	return (
		<AnimatePresence mode="wait">
			{isVisible && (
				<m.div
					initial={{ opacity: 0, y: -20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -20, scale: 0.95 }}
					transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
				>
					<Card className="bg-gradient-to-r from-violet-500 via-violet-600 to-purple-600 text-white p-4 shadow-lg border-0 overflow-hidden relative">
						<div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-purple-400/20 animate-pulse" />
						<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
						<div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

						<div className="flex items-start gap-3 relative z-10">
							<m.div
								className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm"
								whileHover={{ scale: 1.05 }}
								transition={{ duration: 0.2 }}
							>
								<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5" />
							</m.div>

							<div className="flex-1 min-w-0">
								<m.h3
									className="font-bold text-base leading-tight"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.1 }}
								>
									{nudge.title}
								</m.h3>
								<m.p
									className="text-sm text-white/85 mt-1.5 leading-relaxed line-clamp-2"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.15 }}
								>
									{nudge.message}
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
											className="bg-white text-violet-700 hover:bg-white/90 font-semibold shadow-sm"
											onClick={handleAction}
										>
											{nudge.actionLabel}
										</Button>
									)}
									<Button
										size="sm"
										variant="ghost"
										className="text-white/80 hover:text-white hover:bg-white/10 font-medium"
										onClick={handleDismiss}
									>
										Got it
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
