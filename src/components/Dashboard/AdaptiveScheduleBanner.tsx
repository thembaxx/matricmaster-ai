'use client';

import { Calendar01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface AdaptiveScheduleBannerProps {
	changes: {
		rescheduledGoals: number;
		extraPracticeAdded: number;
	};
}

export function AdaptiveScheduleBanner({ changes }: AdaptiveScheduleBannerProps) {
	if (changes.rescheduledGoals === 0 && changes.extraPracticeAdded === 0) {
		return null;
	}

	return (
		<div className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800 rounded-lg p-4">
			<div className="flex items-start gap-3">
				<HugeiconsIcon icon={Calendar01Icon} className="w-5 h-5 text-blue-600 mt-0.5" />
				<div>
					<p className="font-medium text-blue-900 dark:text-blue-100">
						Your study plan has been adjusted
					</p>
					<p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
						{changes.rescheduledGoals > 0 && (
							<span>{changes.rescheduledGoals} missed goal(s) rescheduled. </span>
						)}
						{changes.extraPracticeAdded > 0 && (
							<span>{changes.extraPracticeAdded} extra practice session(s) added.</span>
						)}
					</p>
				</div>
			</div>
		</div>
	);
}
