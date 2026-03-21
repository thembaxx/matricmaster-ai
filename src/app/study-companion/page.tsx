'use client';

import { Mic01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { m } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FocusContent } from '@/components/Layout/FocusContent';
import { TimelineSidebar } from '@/components/Layout/TimelineSidebar';
import {
	getSessionTitle,
	HELP_CARDS,
	type MOCK_RECENT_SESSIONS,
	SUGGESTION_CARDS,
} from '@/components/StudyCompanion/constants';
import { InputMode } from '@/components/StudyCompanion/InputMode';
import { RecentSessions } from '@/components/StudyCompanion/RecentSessions';
import { SubjectCards } from '@/components/StudyCompanion/SubjectCards';
import { SuggestionCards } from '@/components/StudyCompanion/SuggestionCards';
import { authClient } from '@/lib/auth-client';
import {
	getRecentSessionsWithContextAction,
	type RecentSessionWithContext,
} from '@/lib/db/actions';

function StudyCompanionContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: session } = authClient.useSession();
	const [showInput, setShowInput] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [selectedCard, setSelectedCard] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const question = searchParams.get('question');
		if (question) {
			setInputValue(question);
			setShowInput(true);
		}
	}, [searchParams]);

	const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
		queryKey: ['recent-sessions'],
		queryFn: () => getRecentSessionsWithContextAction(),
	});

	const recentSessions = sessionsData ?? [];

	const getPromptForCard = (cardId: string): string => {
		switch (cardId) {
			case '1':
				return 'Help me prioritize my study topics. I want to focus on what will have the biggest impact on my matric exams.';
			case '2':
				return 'Help me create a study routine/schedule. I want to balance all my subjects effectively.';
			case '3':
				return 'Explain this topic in simple terms: ';
			case '4':
				return 'Give me some practice questions for: ';
			default:
				return '';
		}
	};

	const handleGetHelp = async () => {
		if (!inputValue.trim()) return;

		setIsLoading(true);
		try {
			const prompt = selectedCard ? getPromptForCard(selectedCard) + inputValue : inputValue;
			router.push(`/ai-tutor?new=true&prompt=${encodeURIComponent(prompt)}`);
		} catch (error) {
			console.debug('Error starting chat:', error);
			setIsLoading(false);
			toast.error('Failed to start chat. Please try again.');
		}
	};

	const handleCardClick = (cardId: string) => {
		setSelectedCard(cardId);
		setShowInput(true);
		const prompt = getPromptForCard(cardId);
		setInputValue(prompt);
	};

	const handleCancel = () => {
		setShowInput(false);
		setSelectedCard(null);
	};

	const handleSessionClick = (
		sessionItem: RecentSessionWithContext | (typeof MOCK_RECENT_SESSIONS)[0]
	) => {
		const isMock = !('id' in sessionItem);
		let prompt = '';

		if (isMock) {
			const mockItem = sessionItem as (typeof MOCK_RECENT_SESSIONS)[0];
			prompt = `Continue my ${mockItem.topic} study session on ${mockItem.subjectId}`;
		} else {
			const realSession = sessionItem as RecentSessionWithContext;
			prompt = `Continue my study session on ${getSessionTitle(realSession)}`;
		}

		router.push(`/ai-tutor?new=true&prompt=${encodeURIComponent(prompt)}`);
	};

	return (
		<div className="min-h-screen bg-background">
			<TimelineSidebar />

			<FocusContent>
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="space-y-10"
				>
					{/* Header */}
					<div className="text-center">
						<m.div
							initial={{ scale: 0.8 }}
							animate={{ scale: 1 }}
							transition={{ type: 'spring', stiffness: 200, damping: 15 }}
							className="text-6xl mb-4"
						>
							💡
						</m.div>
						<h1 className="text-3xl font-display font-bold mb-2">Study Companion</h1>
						<p className="text-muted-foreground text-lg">What would you like help with?</p>
						<div className="flex justify-center gap-2 mt-4">
							<Link
								href="/voice-tutor"
								className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
							>
								<HugeiconsIcon icon={Mic01Icon} className="w-4 h-4" />
								Voice Tutor
							</Link>
						</div>
					</div>

					{!showInput ? (
						<>
							<SuggestionCards
								cards={SUGGESTION_CARDS}
								selectedCard={selectedCard}
								onCardClick={handleCardClick}
							/>
							<SubjectCards cards={HELP_CARDS} />
						</>
					) : (
						<InputMode
							inputValue={inputValue}
							onInputChange={setInputValue}
							onSubmit={handleGetHelp}
							onCancel={handleCancel}
							isLoading={isLoading}
						/>
					)}

					<RecentSessions
						sessions={recentSessions}
						isLoading={isLoadingSessions}
						isLive={!!session && recentSessions.length > 0}
						onSessionClick={handleSessionClick}
						onEmptyStateClick={() => handleCardClick('3')}
					/>
				</m.div>
			</FocusContent>
		</div>
	);
}

function StudyCompanionSkeleton() {
	return (
		<div className="min-h-screen bg-background">
			<TimelineSidebar />
			<FocusContent>
				<div className="space-y-10 animate-pulse">
					<div className="text-center space-y-4">
						<div className="text-6xl mb-4">💡</div>
						<div className="h-8 bg-muted rounded w-1/3 mx-auto" />
						<div className="h-6 bg-muted rounded w-1/2 mx-auto" />
					</div>
					<div className="grid grid-cols-2 gap-4">
						{[1, 2, 3, 4].map((item) => (
							<div key={`study-companion-skeleton-${item}`} className="h-24 bg-muted rounded-lg" />
						))}
					</div>
				</div>
			</FocusContent>
		</div>
	);
}

export default function StudyCompanion() {
	return (
		<Suspense fallback={<StudyCompanionSkeleton />}>
			<StudyCompanionContent />
		</Suspense>
	);
}
