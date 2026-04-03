'use client';

import { Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { TutorProfileData } from './useTutorProfileData';

interface BookingDialogProps {
	tutor: TutorProfileData;
	userXP: number;
	selectedSubject: string;
	onSubjectChange: (subject: string) => void;
	onBook: (params: {
		selectedDate: string;
		selectedTime: string;
		duration: string;
	}) => Promise<{ success: boolean; error?: string }>;
	xpCost: (duration: string) => number;
	canAfford: (duration: string) => boolean;
}

export function BookingDialog({
	tutor,
	userXP,
	selectedSubject,
	onSubjectChange,
	onBook,
	xpCost,
	canAfford,
}: BookingDialogProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState('');
	const [selectedTime, setSelectedTime] = useState('');
	const [duration, setDuration] = useState('60');
	const [isBooking, setIsBooking] = useState(false);

	const cost = xpCost(duration);
	const affordable = canAfford(duration);

	const handleBook = async () => {
		setIsBooking(true);
		try {
			const result = await onBook({ selectedDate, selectedTime, duration });
			if (result.success) {
				setIsOpen(false);
				router.push('/my-sessions');
			} else {
				alert(result.error || 'Failed to book session');
			}
		} catch {
			alert('Failed to book session');
		} finally {
			setIsBooking(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button className="w-full gap-2" size="lg" disabled={!tutor.isAvailable}>
					<Calendar className="size-4" />
					Book Session
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Book a Session</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 mt-4">
					<div>
						<Label>Subject</Label>
						<Select value={selectedSubject} onValueChange={onSubjectChange}>
							<SelectTrigger>
								<SelectValue placeholder="Select subject" />
							</SelectTrigger>
							<SelectContent>
								{tutor.subjects.map((subject) => (
									<SelectItem key={subject} value={subject}>
										{subject}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label>Duration</Label>
						<Select value={duration} onValueChange={setDuration}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="30">30 minutes</SelectItem>
								<SelectItem value="60">1 hour</SelectItem>
								<SelectItem value="90">1.5 hours</SelectItem>
								<SelectItem value="120">2 hours</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<Label>Date</Label>
							<Input
								type="date"
								value={selectedDate}
								onChange={(e) => setSelectedDate(e.target.value)}
								min={new Date().toISOString().split('T')[0]}
							/>
						</div>
						<div>
							<Label>Time</Label>
							<Input
								type="time"
								value={selectedTime}
								onChange={(e) => setSelectedTime(e.target.value)}
							/>
						</div>
					</div>

					<div className="p-4 bg-muted rounded-xl">
						<div className="flex justify-between text-sm">
							<span>Session cost:</span>
							<span className="font-mono font-bold">{cost} XP</span>
						</div>
						<div className="flex justify-between text-sm mt-1">
							<span>Your balance:</span>
							<span className="font-mono font-bold">{userXP} XP</span>
						</div>
						{!affordable && (
							<p className="text-xs text-destructive mt-2">
								Insufficient XP. You need {cost - userXP} more XP.
							</p>
						)}
					</div>

					<Button
						className="w-full"
						onClick={handleBook}
						disabled={
							!selectedDate || !selectedTime || !selectedSubject || isBooking || !affordable
						}
					>
						{isBooking ? 'Booking...' : `Book for ${cost} XP`}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
