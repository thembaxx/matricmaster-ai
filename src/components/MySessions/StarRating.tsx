'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
	rating: number;
	interactive?: boolean;
	onRate?: (rating: number) => void;
	size?: 'sm' | 'md';
}

export function StarRating({ rating, interactive = false, onRate, size = 'sm' }: StarRatingProps) {
	const starSize = size === 'sm' ? 'size-5' : 'size-6';

	return (
		<div className="flex gap-1">
			{[1, 2, 3, 4, 5].map((star) => (
				<button
					key={star}
					type="button"
					className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
					onClick={() => interactive && onRate?.(star)}
					disabled={!interactive}
				>
					<Star
						className={`${starSize} ${
							star <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted'
						}`}
					/>
				</button>
			))}
		</div>
	);
}
