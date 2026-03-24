'use client';

interface StarRatingProps {
	rating: number;
	size?: 'sm' | 'md';
}

export function StarRating({ rating, size = 'sm' }: StarRatingProps) {
	const fullStars = Math.floor(rating);
	const hasHalfStar = rating % 1 >= 0.5;
	const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
	const starSize = size === 'sm' ? 'size-3' : 'size-4';

	return (
		<div
			className="flex items-center gap-0.5"
			role="img"
			aria-label={`Rating: ${rating} out of 5 stars`}
		>
			{[...Array(fullStars)].map((_, i) => (
				<svg
					key={`full-${i}`}
					className={`${starSize} fill-amber-400 text-amber-400`}
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
				</svg>
			))}
			{hasHalfStar && (
				<div className={`relative ${starSize}`}>
					<svg
						className={`absolute ${starSize} text-muted`}
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
					</svg>
					<div className="absolute overflow-hidden w-1/2">
						<svg
							className={`${starSize} fill-amber-400 text-amber-400`}
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
						</svg>
					</div>
				</div>
			)}
			{[...Array(emptyStars)].map((_, i) => (
				<svg
					key={`empty-${i}`}
					className={`${starSize} text-muted`}
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
				</svg>
			))}
		</div>
	);
}
