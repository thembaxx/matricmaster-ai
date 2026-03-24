import { useCallback, useEffect, useState } from 'react';

export interface TutoringSession {
	id: string;
	tutorId: string;
	studentId: string;
	tutorName: string | null;
	tutorImage: string | null;
	studentName: string | null;
	studentImage: string | null;
	subject: string;
	scheduledAt: string;
	durationMinutes: number;
	status: string;
	xpPaid: number;
	xpEarned: number;
	roomUrl: string | null;
	studentConfirmed: boolean;
	tutorConfirmed: boolean;
	completedAt: string | null;
}

interface UseMySessionsDataReturn {
	sessions: TutoringSession[];
	isLoading: boolean;
	userId: string | null;
	upcomingAsStudent: TutoringSession[];
	upcomingAsTutor: TutoringSession[];
	pastSessions: TutoringSession[];
	handleConfirmSession: (sessionId: string, confirmed: boolean) => Promise<void>;
	handleCancelSession: (sessionId: string, reason?: string) => Promise<void>;
	handleSubmitReview: (
		sessionId: string,
		rating: number,
		comment: string
	) => Promise<{ success: boolean; error?: string }>;
	formatDate: (dateStr: string) => string;
	formatTime: (dateStr: string) => string;
}

export function useMySessionsData(): UseMySessionsDataReturn {
	const [sessions, setSessions] = useState<TutoringSession[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [userId, _setUserId] = useState<string | null>(null);

	useEffect(() => {
		const fetchSessions = async () => {
			setIsLoading(true);
			try {
				const response = await fetch('/api/marketplace?action=my-sessions&asRole=both');
				const data = await response.json();

				if (data.success) {
					setSessions(data.data);
				}
			} catch (error) {
				console.error('Error fetching sessions:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSessions();
	}, []);

	const upcomingAsStudent = sessions.filter(
		(s) =>
			s.studentId === userId &&
			['pending', 'confirmed'].includes(s.status) &&
			new Date(s.scheduledAt) > new Date()
	);

	const upcomingAsTutor = sessions.filter(
		(s) =>
			s.tutorId === userId &&
			['pending', 'confirmed'].includes(s.status) &&
			new Date(s.scheduledAt) > new Date()
	);

	const pastSessions = sessions.filter(
		(s) => s.status === 'completed' || new Date(s.scheduledAt) < new Date()
	);

	const handleConfirmSession = useCallback(
		async (sessionId: string, confirmed: boolean) => {
			try {
				const response = await fetch('/api/marketplace', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'confirm',
						sessionId,
						confirmed,
					}),
				});

				const data = await response.json();
				if (data.success) {
					setSessions((prev) =>
						prev.map((s) =>
							s.id === sessionId
								? {
										...s,
										studentConfirmed: userId === s.studentId ? confirmed : s.studentConfirmed,
										tutorConfirmed: userId === s.tutorId ? confirmed : s.tutorConfirmed,
									}
								: s
						)
					);
				}
			} catch (error) {
				console.error('Error confirming session:', error);
			}
		},
		[userId]
	);

	const handleCancelSession = useCallback(async (sessionId: string, reason?: string) => {
		try {
			const response = await fetch('/api/marketplace', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'cancel',
					sessionId,
					reason,
				}),
			});

			const data = await response.json();
			if (data.success) {
				setSessions((prev) =>
					prev.map((s) => (s.id === sessionId ? { ...s, status: 'cancelled' } : s))
				);
			}
		} catch (error) {
			console.error('Error cancelling session:', error);
		}
	}, []);

	const handleSubmitReview = useCallback(
		async (sessionId: string, rating: number, comment: string) => {
			try {
				const response = await fetch('/api/marketplace', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'review',
						sessionId,
						rating,
						comment,
					}),
				});

				const data = await response.json();
				if (data.success) {
					return { success: true };
				}
				return { success: false, error: data.error || 'Failed to submit review' };
			} catch (error) {
				console.error('Error submitting review:', error);
				return { success: false, error: 'Failed to submit review' };
			}
		},
		[]
	);

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-ZA', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
		});
	};

	const formatTime = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleTimeString('en-ZA', {
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return {
		sessions,
		isLoading,
		userId,
		upcomingAsStudent,
		upcomingAsTutor,
		pastSessions,
		handleConfirmSession,
		handleCancelSession,
		handleSubmitReview,
		formatDate,
		formatTime,
	};
}
