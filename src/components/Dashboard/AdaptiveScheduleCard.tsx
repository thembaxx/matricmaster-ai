'use client';

import { Calendar01Icon, Cancel01Icon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ScheduleAdjustmentData {
	type: 'reschedule' | 'extra_practice' | 'reminder';
	originalEventId?: string;
	newDate?: string;
	topic?: string;
	subject?: string;
	reason: string;
}

interface AdaptiveScheduleCardProps {
	adjustments: ScheduleAdjustmentData[];
	onDismiss?: (index: number) => void;
}

export function AdaptiveScheduleCard({ adjustments, onDismiss }: AdaptiveScheduleCardProps) {
	const [dismissed, setDismissed] = useState<Set<number>>(new Set());

	const visibleAdjustments = adjustments.filter((_, i) => !dismissed.has(i));

	if (visibleAdjustments.length === 0) {
		return null;
	}

	const handleDismiss = (index: number) => {
		setDismissed((prev) => new Set(prev).add(index));
		toast.success('Schedule change dismissed');
		onDismiss?.(index);
	};

	const handleAcceptAll = () => {
		const allIndices = adjustments.map((_, i) => i);
		setDismissed(new Set(allIndices));
		toast.success('All schedule changes accepted');
	};

	const getIcon = (type: string) => {
		switch (type) {
			case 'reschedule':
				return Calendar01Icon;
			case 'extra_practice':
				return CheckmarkCircle01Icon;
			default:
				return Calendar01Icon;
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case 'reschedule':
				return 'text-blue-600 bg-blue-50 dark:bg-blue-950';
			case 'extra_practice':
				return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950';
			case 'reminder':
				return 'text-amber-600 bg-amber-50 dark:bg-amber-950';
			default:
				return 'text-muted-foreground bg-muted';
		}
	};

	const getTypeLabel = (type: string) => {
		switch (type) {
			case 'reschedule':
				return 'Rescheduled';
			case 'extra_practice':
				return 'Extra Practice';
			case 'reminder':
				return 'Reminder';
			default:
				return type;
		}
	};

	return (
		<Card className="rounded-[2rem] border-border/50 shadow-tiimo overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/5">
			<CardHeader className="p-6 pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-xs font-semibold  tracking-wider text-blue-600 flex items-center gap-2">
						<HugeiconsIcon icon={Calendar01Icon} className="w-4 h-4" />
						Schedule Adjustments
					</CardTitle>
					{visibleAdjustments.length > 1 && (
						<Button
							variant="ghost"
							size="sm"
							className="text-xs h-7 text-blue-600 hover:text-blue-700"
							onClick={handleAcceptAll}
						>
							Accept All
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent className="p-6 pt-0 space-y-2">
				{visibleAdjustments.map((adjustment, index) => {
					const originalIndex = adjustments.indexOf(adjustment);
					return (
						<m.div
							key={originalIndex}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ delay: index * 0.05 }}
							className="flex items-start gap-3 p-3 rounded-xl bg-background/60 border border-border/50"
						>
							<div
								className={cn(
									'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
									getTypeColor(adjustment.type)
								)}
							>
								<HugeiconsIcon icon={getIcon(adjustment.type)} className="w-4 h-4" />
							</div>
							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2 mb-0.5">
									<span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
										{getTypeLabel(adjustment.type)}
									</span>
								</div>
								<p className="text-sm text-foreground leading-relaxed">{adjustment.reason}</p>
							</div>
							<Button
								variant="ghost"
								size="icon"
								aria-label="Dismiss adjustment"
								className="w-7 h-7 rounded-full flex-shrink-0 text-muted-foreground hover:text-foreground"
								onClick={() => handleDismiss(originalIndex)}
							>
								<HugeiconsIcon icon={Cancel01Icon} className="w-3.5 h-3.5" aria-hidden="true" />
							</Button>
						</m.div>
					);
				})}
			</CardContent>
		</Card>
	);
}
