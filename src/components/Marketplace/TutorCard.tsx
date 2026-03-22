'use client';

import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface TutorCardData {
	id: string;
	userId: string;
	userName: string | null;
	userImage: string | null;
	bio: string | null;
	subjects: string[];
	hourlyRateXP: number;
	rating: number;
	totalRatings: number;
	totalSessions: number;
	isAvailable: boolean;
}

interface TutorCardProps {
	tutor: TutorCardData;
	onBook?: (tutor: TutorCardData) => void;
	onClick?: (tutor: TutorCardData) => void;
}

export function TutorCard({ tutor, onBook, onClick }: TutorCardProps) {
	const initials =
		tutor.userName
			?.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase() || 'T';

	const renderStars = (rating: number) => {
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 >= 0.5;
		const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

		return (
			<div className="flex items-center gap-0.5">
				{[...Array(fullStars)].map((_, i) => (
					<Star key={`full-${i}`} className="size-3 fill-amber-400 text-amber-400" />
				))}
				{hasHalfStar && (
					<div className="relative size-3">
						<Star className="absolute size-3 text-muted" />
						<div className="absolute overflow-hidden w-1/2">
							<Star className="size-3 fill-amber-400 text-amber-400" />
						</div>
					</div>
				)}
				{[...Array(emptyStars)].map((_, i) => (
					<Star key={`empty-${i}`} className="size-3 text-muted" />
				))}
				<span className="ml-1 text-xs text-muted-foreground font-mono">
					{rating.toFixed(1)} ({tutor.totalRatings})
				</span>
			</div>
		);
	};

	return (
		<Card
			className="p-4 rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-colors cursor-pointer"
			onClick={() => onClick?.(tutor)}
		>
			<div className="flex items-start gap-3">
				<Avatar className="size-14 border-2 border-border">
					<AvatarImage src={tutor.userImage || undefined} alt={tutor.userName || 'Tutor'} />
					<AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
						{initials}
					</AvatarFallback>
				</Avatar>

				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between gap-2">
						<h3 className="font-bold text-sm truncate">{tutor.userName || 'Anonymous Tutor'}</h3>
						<Badge
							variant="secondary"
							className="bg-primary/10 text-primary font-mono text-xs shrink-0"
						>
							{tutor.hourlyRateXP} XP/hr
						</Badge>
					</div>

					<div className="mt-1">{renderStars(tutor.rating)}</div>

					<div className="flex flex-wrap gap-1 mt-2">
						{tutor.subjects.slice(0, 3).map((subject) => (
							<Badge
								key={subject}
								variant="outline"
								className="text-xs px-1.5 py-0 h-5 font-normal"
							>
								{subject}
							</Badge>
						))}
						{tutor.subjects.length > 3 && (
							<Badge variant="outline" className="text-xs px-1.5 py-0 h-5 font-normal">
								+{tutor.subjects.length - 3}
							</Badge>
						)}
					</div>

					{tutor.bio && (
						<p className="text-xs text-muted-foreground mt-2 line-clamp-2">{tutor.bio}</p>
					)}

					<div className="flex items-center justify-between mt-3">
						<span className="text-xs text-muted-foreground font-mono">
							{tutor.totalSessions} sessions
						</span>
						<div className="flex gap-2">
							<Button
								size="sm"
								variant="outline"
								className="h-7 text-xs"
								onClick={(e) => {
									e.stopPropagation();
									onClick?.(tutor);
								}}
							>
								View Profile
							</Button>
							{onBook && tutor.isAvailable && (
								<Button
									size="sm"
									className="h-7 text-xs"
									onClick={(e) => {
										e.stopPropagation();
										onBook(tutor);
									}}
								>
									Book
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>
		</Card>
	);
}
