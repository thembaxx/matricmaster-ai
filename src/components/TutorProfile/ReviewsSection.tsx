'use client';

import { MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { StarRating } from './StarRating';
import type { Review } from './useTutorProfileData';

interface ReviewsSectionProps {
	reviews: Review[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
	return (
		<Card className="p-6 rounded-3xl border-border/50 bg-card/60 backdrop-blur-sm">
			<h2 className="text-lg font-bold flex items-center gap-2">
				<MessageSquare className="size-5" />
				Reviews ({reviews.length})
			</h2>

			{reviews.length === 0 ? (
				<p className="text-sm text-muted-foreground mt-4">No reviews yet.</p>
			) : (
				<div className="mt-4 space-y-4">
					{reviews.map((review) => (
						<div key={review.id} className="pb-4 border-b last:border-0">
							<div className="flex items-center gap-2">
								<Avatar className="size-8">
									<AvatarImage src={review.studentImage || undefined} />
									<AvatarFallback className="text-xs">
										{review.studentName?.[0] || 'S'}
									</AvatarFallback>
								</Avatar>
								<div>
									<span className="font-medium text-sm">{review.studentName || 'Student'}</span>
									<StarRating rating={review.rating} />
								</div>
							</div>
							{review.comment && (
								<p className="text-sm text-muted-foreground mt-2 ml-10">{review.comment}</p>
							)}
						</div>
					))}
				</div>
			)}
		</Card>
	);
}
