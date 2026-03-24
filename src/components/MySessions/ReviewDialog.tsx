'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';

interface ReviewDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	sessionId: string;
	onSubmit: (
		sessionId: string,
		rating: number,
		comment: string
	) => Promise<{ success: boolean; error?: string }>;
}

export function ReviewDialog({ isOpen, onOpenChange, sessionId, onSubmit }: ReviewDialogProps) {
	const [rating, setRating] = useState(5);
	const [comment, setComment] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async () => {
		setIsSubmitting(true);
		try {
			const result = await onSubmit(sessionId, rating, comment);
			if (result.success) {
				onOpenChange(false);
				setComment('');
				setRating(5);
			} else {
				alert(result.error || 'Failed to submit review');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Leave a Review</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 mt-4">
					<div>
						<Label>Rating</Label>
						<div className="mt-2">
							<StarRating rating={rating} interactive onRate={setRating} />
						</div>
					</div>
					<div>
						<Label>Comment (optional)</Label>
						<Textarea
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							placeholder="Share your experience..."
							className="mt-2"
						/>
					</div>
					<Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
						{isSubmitting ? 'Submitting...' : 'Submit Review'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
