'use client';

import { Calendar, CheckCircle, Clock, Video, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import type { TutoringSession } from './useMySessionsData';

interface SessionCardProps {
	session: TutoringSession;
	isTutor: boolean;
	userId: string | null;
	formatDate: (dateStr: string) => string;
	formatTime: (dateStr: string) => string;
	onConfirm: (sessionId: string, confirmed: boolean) => void;
	onCancel: (sessionId: string) => void;
	onLeaveReview: (sessionId: string) => void;
}

export function SessionCard({
	session,
	isTutor,
	userId,
	formatDate,
	formatTime,
	onConfirm,
	onCancel,
	onLeaveReview,
}: SessionCardProps) {
	const isPast = new Date(session.scheduledAt) < new Date();
	const isCompleted = session.status === 'completed';
	const isCancelled = session.status === 'cancelled';

	const otherPartyName = isTutor ? session.studentName : session.tutorName;
	const otherPartyImage = isTutor ? session.studentImage : session.tutorImage;
	const initials =
		otherPartyName
			?.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase() || (isTutor ? 'S' : 'T');

	return (
		<Card className="p-4 rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm">
			<div className="flex items-start gap-3">
				<Avatar className="size-12">
					<AvatarImage src={otherPartyImage || undefined} />
					<AvatarFallback className="bg-primary/10 text-primary font-bold">
						{initials}
					</AvatarFallback>
				</Avatar>

				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between gap-2">
						<h3 className="font-bold text-sm truncate">
							{otherPartyName || (isTutor ? 'Student' : 'Tutor')}
						</h3>
						<Badge
							variant={isCompleted ? 'default' : isCancelled ? 'destructive' : 'secondary'}
							className="text-xs shrink-0"
						>
							{isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : 'Upcoming'}
						</Badge>
					</div>

					<p className="text-sm text-muted-foreground">{session.subject}</p>

					<div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground font-mono">
						<span className="flex items-center gap-1">
							<Calendar className="size-3" />
							{formatDate(session.scheduledAt)}
						</span>
						<span className="flex items-center gap-1">
							<Clock className="size-3" />
							{formatTime(session.scheduledAt)}
						</span>
						<span>{session.durationMinutes} min</span>
					</div>

					{isCompleted && (
						<div className="flex items-center gap-2 mt-2 text-xs">
							<span className="text-green-600 font-mono">+{session.xpEarned} XP earned</span>
						</div>
					)}

					{!isPast && !isCancelled && (
						<div className="flex items-center gap-2 mt-3">
							<Dialog>
								<DialogTrigger asChild>
									<Button size="sm" variant="outline" className="gap-1">
										<Video className="size-3" />
										Join
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Join Video Session</DialogTitle>
									</DialogHeader>
									<div className="mt-4 space-y-4">
										<p className="text-sm text-muted-foreground">
											Video call functionality will be integrated with Daily.co here.
										</p>
										<Button className="w-full gap-2">
											<Video className="size-4" />
											Start Call
										</Button>
									</div>
								</DialogContent>
							</Dialog>

							{!isTutor && (
								<Button
									size="sm"
									variant="outline"
									onClick={() => onConfirm(session.id, true)}
									disabled={session.studentConfirmed}
									className="gap-1"
								>
									<CheckCircle className="size-3" />
									{session.studentConfirmed ? 'Confirmed' : 'Confirm'}
								</Button>
							)}

							{isTutor && (
								<Button
									size="sm"
									variant="outline"
									onClick={() => onConfirm(session.id, true)}
									disabled={session.tutorConfirmed}
									className="gap-1"
								>
									<CheckCircle className="size-3" />
									{session.tutorConfirmed ? 'Confirmed' : 'Confirm'}
								</Button>
							)}

							<Button
								size="sm"
								variant="ghost"
								className="text-destructive gap-1"
								onClick={() => onCancel(session.id)}
							>
								<X className="size-3" />
								Cancel
							</Button>
						</div>
					)}

					{isCompleted && session.studentId === userId && (
						<Button
							size="sm"
							variant="outline"
							className="mt-3 gap-1"
							onClick={() => onLeaveReview(session.id)}
						>
							Leave Review
						</Button>
					)}
				</div>
			</div>
		</Card>
	);
}
