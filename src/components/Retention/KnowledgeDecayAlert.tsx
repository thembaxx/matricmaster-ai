'use client';

import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DURATION, EASING } from '@/lib/animation-presets';
import type { DecayAlert } from '@/stores/useKnowledgeDecayStore';

interface KnowledgeDecayAlertProps {
	decayedTopics: DecayAlert[];
	onStartRefresher: (topic: string) => void;
	onDismiss?: (topic: string) => void;
}

export function KnowledgeDecayAlert({
	decayedTopics,
	onStartRefresher,
	onDismiss,
}: KnowledgeDecayAlertProps) {
	if (decayedTopics.length === 0) return null;

	return (
		<div className="space-y-3">
			{decayedTopics.slice(0, 3).map((alert) => (
				<motion.div
					key={alert.topic}
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: DURATION.normal, ease: EASING.easeOut }}
				>
					<Card className="border-amber-500/30 bg-amber-500/5">
						<CardContent className="flex items-center justify-between gap-4 pt-5">
							<div className="flex-1 space-y-1">
								<div className="flex items-center gap-2">
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										className="text-amber-500"
									>
										<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
										<line x1="12" y1="9" x2="12" y2="13" />
										<line x1="12" y1="17" x2="12.01" y2="17" />
									</svg>
									<p className="text-xs font-medium text-amber-700 dark:text-amber-400">
										your knowledge of {alert.topic.toLowerCase()} is fading
									</p>
								</div>
								<p className="text-[11px] text-muted-foreground">
									retention at {Math.round(alert.retention * 100)}% - quick 2-minute refresher?
								</p>
							</div>
							<div className="flex items-center gap-2">
								<Button
									size="xs"
									variant="outline"
									className="border-amber-500/40 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
									onClick={() => onStartRefresher(alert.topic)}
								>
									refresher
								</Button>
								{onDismiss && (
									<Button
										size="icon-xs"
										variant="ghost"
										className="text-muted-foreground"
										onClick={() => onDismiss(alert.topic)}
									>
										<svg
											width="12"
											height="12"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										>
											<line x1="18" y1="6" x2="6" y2="18" />
											<line x1="6" y1="6" x2="18" y2="18" />
										</svg>
									</Button>
								)}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			))}
		</div>
	);
}
