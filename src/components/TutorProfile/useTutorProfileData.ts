import { useEffect, useState } from 'react';

export interface TutorProfileData {
	id: string;
	userId: string;
	userName: string | null;
	userImage: string | null;
	bio: string | null;
	teachingStyle: string | null;
	subjects: string[];
	hourlyRateXP: number;
	isAvailable: boolean;
	totalSessions: number;
	rating: number;
	totalRatings: number;
	availabilitySchedule: string | null;
}

export interface Review {
	id: string;
	studentName: string | null;
	studentImage: string | null;
	rating: number;
	comment: string | null;
	createdAt: string;
}

interface UseTutorProfileDataProps {
	tutorId: string;
}

interface UseTutorProfileDataReturn {
	tutor: TutorProfileData | null;
	reviews: Review[];
	isLoading: boolean;
	userXP: number;
	selectedSubject: string;
	setSelectedSubject: (subject: string) => void;
	handleBookSession: (params: {
		selectedDate: string;
		selectedTime: string;
		duration: string;
	}) => Promise<{ success: boolean; error?: string }>;
	xpCost: (duration: string) => number;
	canAfford: (duration: string) => boolean;
}

export function useTutorProfileData({
	tutorId,
}: UseTutorProfileDataProps): UseTutorProfileDataReturn {
	const [tutor, setTutor] = useState<TutorProfileData | null>(null);
	const [reviews, setReviews] = useState<Review[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [userXP, setUserXP] = useState(0);
	const [selectedSubject, setSelectedSubject] = useState('');

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				const [tutorRes, reviewsRes, xpRes] = await Promise.all([
					fetch(`/api/marketplace?action=tutor&tutorId=${tutorId}`),
					fetch(`/api/marketplace?action=reviews&tutorId=${tutorId}`),
					fetch('/api/marketplace?action=my-xp'),
				]);

				const tutorData = await tutorRes.json();
				const reviewsData = await reviewsRes.json();
				const xpData = await xpRes.json();

				if (tutorData.success) {
					setTutor(tutorData.data);
					if (tutorData.data.subjects.length > 0) {
						setSelectedSubject(tutorData.data.subjects[0]);
					}
				}

				if (reviewsData.success) {
					setReviews(reviewsData.data);
				}

				if (xpData.success) {
					setUserXP(xpData.data.xp);
				}
			} catch (error) {
				console.error('Error fetching tutor data:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [tutorId]);

	const handleBookSession = async (params: {
		selectedDate: string;
		selectedTime: string;
		duration: string;
	}): Promise<{ success: boolean; error?: string }> => {
		const { selectedDate, selectedTime, duration } = params;
		if (!selectedDate || !selectedTime || !selectedSubject) {
			return { success: false, error: 'Please fill in all fields' };
		}

		try {
			const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`);
			const response = await fetch('/api/marketplace', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'book',
					tutorId,
					subject: selectedSubject,
					scheduledAt: scheduledAt.toISOString(),
					durationMinutes: Number.parseInt(duration, 10),
				}),
			});

			const data = await response.json();

			if (data.success) {
				return { success: true };
			}
			return { success: false, error: data.error || 'Failed to book session' };
		} catch (error) {
			console.error('Error booking session:', error);
			return { success: false, error: 'Failed to book session' };
		}
	};

	const xpCost = (duration: string) =>
		tutor ? Math.ceil((tutor.hourlyRateXP * Number.parseInt(duration, 10)) / 60) : 0;

	const canAfford = (duration: string) => userXP >= xpCost(duration);

	return {
		tutor,
		reviews,
		isLoading,
		userXP,
		selectedSubject,
		setSelectedSubject,
		handleBookSession,
		xpCost,
		canAfford,
	};
}
