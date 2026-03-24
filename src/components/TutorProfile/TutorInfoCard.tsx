'use client';

import { BookOpen, Calendar, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StarRating } from './StarRating';
import type { TutorProfileData } from './useTutorProfileData';

interface TutorInfoCardProps {
	tutor: TutorProfileData;
}

export function TutorInfoCard({ tutor }: TutorInfoCardProps) {
	const initials =
		tutor.userName
			?.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase() || 'T';

	return (
		<div className="flex flex-col sm:flex-row gap-6">
			<Avatar className="size-20 border-2 border-border mx-auto sm:mx-0">
				<AvatarImage src={tutor.userImage || undefined} alt={tutor.userName || 'Tutor'} />
				<AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
					{initials}
				</AvatarFallback>
			</Avatar>

			<div className="flex-1 text-center sm:text-left">
				<h1 className="text-2xl font-black">{tutor.userName || 'Anonymous Tutor'}</h1>

				<div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
					<StarRating rating={tutor.rating} size="md" />
					<span className="text-sm text-muted-foreground font-mono">
						{tutor.rating.toFixed(1)} ({tutor.totalRatings} reviews)
					</span>
				</div>

				<div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-sm text-muted-foreground font-mono">
					<Clock className="size-4" />
					{tutor.totalSessions} sessions completed
				</div>

				<div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
					{tutor.subjects.map((subject) => (
						<Badge key={subject} variant="secondary" className="font-normal">
							<BookOpen className="size-3 mr-1" />
							{subject}
						</Badge>
					))}
				</div>

				<div className="mt-4 flex items-center justify-center sm:justify-start gap-2">
					<Badge variant="outline" className="font-mono text-base px-3 py-1">
						{tutor.hourlyRateXP} XP / hour
					</Badge>
					{tutor.isAvailable ? (
						<Badge className="bg-green-500/10 text-green-600">Available</Badge>
					) : (
						<Badge variant="destructive">Unavailable</Badge>
					)}
				</div>
			</div>

			{tutor.bio && (
				<div className="mt-6 pt-6 border-t">
					<h3 className="font-bold mb-2">About</h3>
					<p className="text-sm text-muted-foreground">{tutor.bio}</p>
				</div>
			)}

			{tutor.teachingStyle && (
				<div className="mt-6 pt-6 border-t">
					<h3 className="font-bold mb-2">Teaching Style</h3>
					<p className="text-sm text-muted-foreground">{tutor.teachingStyle}</p>
				</div>
			)}

			{tutor.availabilitySchedule && (
				<div className="mt-6 pt-6 border-t">
					<h3 className="font-bold mb-2 flex items-center gap-2">
						<Calendar className="size-4" />
						Availability
					</h3>
					<p className="text-sm text-muted-foreground whitespace-pre-line">
						{tutor.availabilitySchedule}
					</p>
				</div>
			)}
		</div>
	);
}
