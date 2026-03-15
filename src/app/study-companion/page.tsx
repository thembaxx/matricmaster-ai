'use client';

import { m } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FocusContent } from '@/components/Layout/FocusContent';
import { TimelineSidebar } from '@/components/Layout/TimelineSidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SUBJECTS, type SubjectId } from '@/constants/subjects';
import { authClient } from '@/lib/auth-client';
import {
	getRecentSessionsWithContextAction,
	type RecentSessionWithContext,
} from '@/lib/db/actions';
import { cn } from '@/lib/utils';

interface SuggestionCard {
	id: string;
	emoji: string;
	title: string;
	description: string;
}

interface StudyHelpCard {
	id: string;
	emoji: string;
	title: string;
	subtitle: string;
	subjectId: SubjectId;
}

const SUGGESTION_CARDS: SuggestionCard[] = [
	{
		id: '1',
		emoji: '🎯',
		title: 'Help me prioritize',
		description: 'Figure out what to study first',
	},
	{ id: '2', emoji: '🧘', title: 'Start a routine', description: 'Create a study schedule' },
	{ id: '3', emoji: '📚', title: 'Explain a topic', description: 'Break down any concept' },
	{ id: '4', emoji: '✍️', title: 'Practice questions', description: 'Get exercises to try' },
];

const HELP_CARDS: StudyHelpCard[] = [
	{
		id: '1',
		emoji: SUBJECTS.mathematics.emoji,
		title: 'Mathematics',
		subtitle: 'Algebra, Calculus, Geometry',
		subjectId: 'mathematics',
	},
	{
		id: '2',
		emoji: SUBJECTS.physics.emoji,
		title: 'Physics',
		subtitle: 'Mechanics, Waves, Energy',
		subjectId: 'physics',
	},
	{
		id: '3',
		emoji: SUBJECTS['life-sciences'].emoji,
		title: 'Life Sciences',
		subtitle: 'Cells, Genetics, Ecology',
		subjectId: 'life-sciences',
	},
	{
		id: '4',
		emoji: SUBJECTS.english.emoji,
		title: 'English',
		subtitle: 'Literature, Language, Writing',
		subjectId: 'english',
	},
];

const MOCK_RECENT_SESSIONS = [
	{
		emoji: SUBJECTS.mathematics.emoji,
		title: 'Calculus - Derivatives & Integration',
		time: '2 hours ago',
		subjectId: 'mathematics',
		topic: 'Calculus',
		duration: 45,
	},
	{
		emoji: SUBJECTS.physics.emoji,
		title: 'Electric Circuits',
		time: 'Yesterday',
		subjectId: 'physics',
		topic: 'Circuits',
		duration: 30,
	},
	{
		emoji: SUBJECTS['life-sciences'].emoji,
		title: 'Cell Structure & Function',
		time: '2 days ago',
		subjectId: 'life-sciences',
		topic: 'Cells',
		duration: 60,
	},
	{
		emoji: SUBJECTS.english.emoji,
		title: 'Essay Writing: Argumentative',
		time: '3 days ago',
		subjectId: 'english',
		topic: 'Essay Writing',
		duration: 40,
	},
];

function formatRelativeTime(date: Date | null | undefined): string {
	if (!date) return 'Unknown';

	const now = new Date();
	const diffMs = now.getTime() - new Date(date).getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffMins < 1) return 'Just now';
	if (diffMins < 60) return `${diffMins} min ago`;
	if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
	if (diffDays === 1) return 'Yesterday';
	if (diffDays < 7) return `${diffDays} days ago`;
	return new Date(date).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
}

function getSessionTitle(session: RecentSessionWithContext): string {
	if (session.topic) return session.topic;
	if (session.subjectName) return session.subjectName;
	if (session.sessionType)
		return session.sessionType.charAt(0).toUpperCase() + session.sessionType.slice(1);
	return 'Study Session';
}

function getSessionSubtitle(session: RecentSessionWithContext): string {
	const parts: string[] = [];
	if (session.subjectName) parts.push(session.subjectName);
	if (session.durationMinutes) parts.push(`${session.durationMinutes} min`);
	if (session.questionsAttempted > 0) {
		const accuracy = Math.round((session.correctAnswers / session.questionsAttempted) * 100);
		parts.push(`${accuracy}%`);
	}
	return parts.join(' • ');
}

export default function StudyCompanion() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: session } = authClient.useSession();
	const [showInput, setShowInput] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [selectedCard, setSelectedCard] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [recentSessions, setRecentSessions] = useState<RecentSessionWithContext[]>([]);
	const [isLoadingSessions, setIsLoadingSessions] = useState(true);

	useEffect(() => {
		const question = searchParams.get('question');
		if (question) {
			setInputValue(question);
			setShowInput(true);
		}
	}, [searchParams]);

	useEffect(() => {
		async function loadSessions() {
			setIsLoadingSessions(true);
			try {
				const data = await getRecentSessionsWithContextAction();
				setRecentSessions(data);
			} catch (error) {
				console.error('Error loading recent sessions:', error);
			} finally {
				setIsLoadingSessions(false);
			}
		}
		loadSessions();
	}, []);

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
			console.error('Error starting chat:', error);
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

	const displaySessions = recentSessions.length > 0 ? recentSessions : MOCK_RECENT_SESSIONS;

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
					</div>

					{!showInput ? (
						<>
							{/* Quick Actions */}
							<section>
								<h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
									Quick actions
								</h2>
								<div className="grid grid-cols-2 gap-3">
									{SUGGESTION_CARDS.map((card, index) => (
										<m.button
											key={card.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.08 }}
											onClick={() => handleCardClick(card.id)}
											className={cn(
												'flex flex-col items-start gap-3 p-5 rounded-2xl border-2 transition-all tiimo-press text-left',
												selectedCard === card.id
													? 'bg-primary-soft border-primary'
													: 'bg-card border-border hover:border-primary/50'
											)}
										>
											<span className="text-3xl">{card.emoji}</span>
											<div>
												<h3 className="font-semibold text-foreground">{card.title}</h3>
												<p className="text-xs text-muted-foreground mt-1">{card.description}</p>
											</div>
										</m.button>
									))}
								</div>
							</section>

							{/* Subject Cards */}
							<section>
								<h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
									Or choose a subject
								</h2>
								<div className="grid grid-cols-2 gap-3">
									{HELP_CARDS.map((card, index) => (
										<m.div
											key={card.id}
											initial={{ opacity: 0, scale: 0.95 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ delay: 0.3 + index * 0.08 }}
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											<Link
												href={`/subjects/${card.subjectId}`}
												className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all"
											>
												<span className="text-3xl">{card.emoji}</span>
												<div>
													<h3 className="font-semibold text-foreground">{card.title}</h3>
													<p className="text-xs text-muted-foreground">{card.subtitle}</p>
												</div>
											</Link>
										</m.div>
									))}
								</div>
							</section>
						</>
					) : (
						/* Input Mode */
						<m.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="space-y-4"
						>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setShowInput(false);
									setSelectedCard(null);
								}}
								className="mb-2"
							>
								← Back
							</Button>

							<Card className="p-4 rounded-2xl border border-border">
								<textarea
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									placeholder="Tell me more about what you need..."
									className="w-full h-32 bg-transparent border-none resize-none focus:outline-none text-foreground placeholder:text-muted-foreground"
								/>
							</Card>

							<div className="flex gap-3">
								<Button
									variant="outline"
									size="lg"
									className="flex-1 rounded-2xl"
									onClick={() => {
										setShowInput(false);
										setSelectedCard(null);
									}}
								>
									Cancel
								</Button>
								<Button
									size="lg"
									className="flex-1 rounded-2xl"
									disabled={!inputValue.trim() || isLoading}
									onClick={handleGetHelp}
								>
									{isLoading ? 'Starting...' : 'Get help'}
								</Button>
							</div>
						</m.div>
					)}

					{/* Recent Sessions */}
					<section>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
								Recent sessions
							</h2>
							{session && recentSessions.length > 0 && (
								<span className="text-xs text-primary font-medium">Live data</span>
							)}
						</div>

						{isLoadingSessions ? (
							<div className="space-y-2">
								{[1, 2, 3].map((i) => (
									<div
										key={i}
										className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border animate-pulse"
									>
										<div className="w-10 h-10 rounded-full bg-muted" />
										<div className="flex-1 space-y-2">
											<div className="h-4 w-3/4 bg-muted rounded" />
											<div className="h-3 w-1/2 bg-muted rounded" />
										</div>
									</div>
								))}
							</div>
						) : displaySessions.length === 0 ? (
							<Card className="p-6 rounded-2xl border border-dashed">
								<div className="text-center">
									<div className="text-4xl mb-3">📖</div>
									<h3 className="font-semibold mb-1">No recent sessions</h3>
									<p className="text-sm text-muted-foreground mb-4">
										Start a study session to see your progress here
									</p>
									<Button onClick={() => handleCardClick('3')} variant="outline" size="sm">
										Start learning
									</Button>
								</div>
							</Card>
						) : (
							<div className="space-y-2">
								{displaySessions.map((item, index) => (
									<m.button
										key={'id' in item ? item.id : index}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.5 + index * 0.08 }}
										onClick={() => handleSessionClick(item)}
										className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all text-left group"
									>
										{'id' in item && item.subjectEmoji ? (
											<span className="text-xl">{item.subjectEmoji}</span>
										) : (
											<span className="text-xl">
												{(item as (typeof MOCK_RECENT_SESSIONS)[0]).emoji}
											</span>
										)}
										<div className="flex-1 min-w-0">
											{'id' in item ? (
												<>
													<p className="font-medium text-sm truncate">
														{getSessionTitle(item as RecentSessionWithContext)}
													</p>
													<p className="text-xs text-muted-foreground truncate">
														{getSessionSubtitle(item as RecentSessionWithContext)} •{' '}
														{formatRelativeTime((item as RecentSessionWithContext).completedAt)}
													</p>
												</>
											) : (
												<>
													<p className="font-medium text-sm truncate">
														{(item as (typeof MOCK_RECENT_SESSIONS)[0]).title}
													</p>
													<p className="text-xs text-muted-foreground truncate">
														{(item as (typeof MOCK_RECENT_SESSIONS)[0]).time}
													</p>
												</>
											)}
										</div>
										<Button
											variant="ghost"
											size="sm"
											className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
										>
											Continue →
										</Button>
									</m.button>
								))}
							</div>
						)}
					</section>
				</m.div>
			</FocusContent>
		</div>
	);
}
