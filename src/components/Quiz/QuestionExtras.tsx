'use client';

import { StruggleAlert } from '@/components/StudyBuddy/StruggleAlert';
import { Card } from '@/components/ui/card';

interface QuestionExtrasProps {
	adaptiveHint: string | null;
	showStruggleAlert: boolean;
	currentStruggleCount: number;
	currentTopic?: string;
	isChecked: boolean;
	onDismissStruggle: () => void;
}

export function QuestionExtras({
	adaptiveHint,
	showStruggleAlert,
	currentStruggleCount,
	currentTopic,
	isChecked,
	onDismissStruggle,
}: QuestionExtrasProps) {
	return (
		<>
			{adaptiveHint && !isChecked && (
				<Card className="p-4 rounded-2xl border-amber-500/30 bg-amber-50 dark:bg-amber-950/30">
					<p className="text-sm text-amber-800 dark:text-amber-200">
						<strong>Hint:</strong> {adaptiveHint}
					</p>
				</Card>
			)}

			{showStruggleAlert && currentTopic && (
				<StruggleAlert
					concept={currentTopic}
					struggleCount={currentStruggleCount}
					onGetHelp={onDismissStruggle}
				/>
			)}
		</>
	);
}
