'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FocusModeState {
	isEnabled: boolean;
	autoEnabled: boolean;
	toggle: () => void;
	enable: () => void;
	disable: () => void;
	enableAuto: () => void;
	disableAuto: () => void;
}

interface StudySession {
	id: string;
	title: string;
	startTime: Date;
	endTime: Date;
	topic: string;
}

const STUDY_KEYWORDS = [
	'study',
	'math',
	'physics',
	'chemistry',
	'biology',
	'exam',
	'test',
	'quiz',
	'revision',
	'review',
	'practice',
	'tutoring',
	'tutor',
	'learn',
	'lesson',
	'class',
	'lecture',
];

function isStudyRelated(title: string): boolean {
	const lower = title.toLowerCase();
	return STUDY_KEYWORDS.some((keyword) => lower.includes(keyword));
}

// Check for upcoming study sessions every minute
async function checkUpcomingSessions(): Promise<StudySession | null> {
	try {
		const res = await fetch('/api/calendar/external-events');
		if (!res.ok) return null;

		const data = await res.json();
		const events = data.events || [];

		const now = new Date();
		const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

		// Find study sessions starting within the next 5 minutes
		const upcomingSession = events.find((event: any) => {
			const startTime = new Date(event.startTime);
			return startTime >= now && startTime <= fiveMinutesFromNow && isStudyRelated(event.title);
		});

		if (upcomingSession) {
			return {
				id: upcomingSession.id,
				title: upcomingSession.title,
				startTime: new Date(upcomingSession.startTime),
				endTime: new Date(upcomingSession.endTime),
				topic: upcomingSession.title,
			};
		}
	} catch (error) {
		console.debug('Failed to check upcoming sessions:', error);
	}

	return null;
}

export const useFocusMode = create<FocusModeState>()(
	persist(
		(set, _get) => ({
			isEnabled: false,
			autoEnabled: false,
			toggle: () => set((state) => ({ isEnabled: !state.isEnabled })),
			enable: () => set({ isEnabled: true, autoEnabled: false }),
			disable: () => set({ isEnabled: false, autoEnabled: false }),
			enableAuto: () => set({ isEnabled: true, autoEnabled: true }),
			disableAuto: () => set({ autoEnabled: false }),
		}),
		{ name: 'focus-mode-storage' }
	)
);

// Auto-enable focus mode for upcoming study sessions
export function useFocusModeAuto(onUpcomingSession?: (session: StudySession) => void) {
	const { isEnabled, autoEnabled, enableAuto } = useFocusMode();

	// Check for auto-enable every minute
	useEffect(() => {
		if (!autoEnabled) return;

		const interval = setInterval(async () => {
			const upcomingSession = await checkUpcomingSessions();
			if (upcomingSession && !isEnabled) {
				if (onUpcomingSession) {
					onUpcomingSession(upcomingSession);
				} else {
					enableAuto();
				}
			}
		}, 60000); // Check every minute

		return () => clearInterval(interval);
	}, [autoEnabled, isEnabled, enableAuto, onUpcomingSession]);

	return { autoEnabled };
}
