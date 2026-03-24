'use client';

import { Cancel01Icon, ThumbsDownIcon, ThumbsUpIcon, Tick01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import type { Rating } from '@/lib/spaced-repetition';

interface RatingButton {
	rating: Rating;
	icon: typeof Cancel01Icon;
	label: string;
	shortcut: string;
}

const RATING_BUTTONS: RatingButton[] = [
	{ rating: 1, icon: Cancel01Icon, label: 'Again', shortcut: '1' },
	{ rating: 2, icon: ThumbsDownIcon, label: 'Hard', shortcut: '2' },
	{ rating: 3, icon: Tick01Icon, label: 'Good', shortcut: '3' },
	{ rating: 4, icon: ThumbsUpIcon, label: 'Easy', shortcut: '4' },
];

interface FlashcardRatingButtonsProps {
	onRate: (rating: Rating) => void;
	isDisabled?: boolean;
}

export function FlashcardRatingButtons({ onRate, isDisabled }: FlashcardRatingButtonsProps) {
	return (
		<div className="space-y-2">
			<p className="text-sm text-center text-muted-foreground">How well did you remember?</p>
			<div className="grid grid-cols-4 gap-2">
				{RATING_BUTTONS.map(({ rating, icon, label, shortcut }) => (
					<Button
						key={rating}
						variant="outline"
						size="sm"
						className="flex-col h-auto py-2"
						onClick={() => onRate(rating)}
						disabled={isDisabled}
					>
						<HugeiconsIcon icon={icon} className="h-4 w-4 mb-1" />
						<span className="text-xs">{label}</span>
						<span className="text-[10px] opacity-50">{shortcut}</span>
					</Button>
				))}
			</div>
		</div>
	);
}
