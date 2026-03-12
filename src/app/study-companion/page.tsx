'use client';

import { m } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FocusContent } from '@/components/Layout/FocusContent';
import { TimelineSidebar } from '@/components/Layout/TimelineSidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
	{ id: '1', emoji: '🧮', title: 'Mathematics', subtitle: 'Algebra, Calculus, Geometry' },
	{ id: '2', emoji: '⚛️', title: 'Physics', subtitle: 'Mechanics, Waves, Energy' },
	{ id: '3', emoji: '🧬', title: 'Life Sciences', subtitle: 'Cells, Genetics, Ecology' },
	{ id: '4', emoji: '📖', title: 'English', subtitle: 'Literature, Language, Writing' },
];

export default function StudyCompanion() {
	const router = useRouter();
	const searchParams = useSearchParams();
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
		}
	};

	const handleCardClick = (cardId: string) => {
		setSelectedCard(cardId);
		setShowInput(true);
		const prompt = getPromptForCard(cardId);
		setInputValue(prompt);
	};

	return (
		<div className="min-h-screen bg-background">
			<TimelineSidebar />

			<FocusContent>
				<m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
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
						<p className="text-muted-foreground">What would you like help with?</p>
					</div>

					{!showInput ? (
						<>
							{/* Quick Actions */}
							<section>
								<h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
									Quick actions
								</h2>
								<div className="grid grid-cols-2 gap-3">
									{SUGGESTION_CARDS.map((card, index) => (
										<m.button
											key={card.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.1 }}
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
								<h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
									Or choose a subject
								</h2>
								<div className="grid grid-cols-2 gap-3">
									{HELP_CARDS.map((card, index) => (
										<m.div
											key={card.id}
											initial={{ opacity: 0, scale: 0.95 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ delay: 0.4 + index * 0.1 }}
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											<Link
												href={`/subjects/${card.id}`}
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

					{/* Recent Activity */}
					<section>
						<h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
							Recent sessions
						</h2>
						<div className="space-y-2">
							{[
								{ emoji: '🧮', title: 'Calculus derivatives', time: '2 hours ago' },
								{ emoji: '⚛️', title: 'Physics circuits', time: 'Yesterday' },
								{ emoji: '📖', title: 'English essay planning', time: '2 days ago' },
							].map((item, index) => (
								<m.div
									key={index}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.6 + index * 0.1 }}
									className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
								>
									<span className="text-xl">{item.emoji}</span>
									<div className="flex-1">
										<p className="font-medium text-sm">{item.title}</p>
										<p className="text-xs text-muted-foreground">{item.time}</p>
									</div>
									<Button variant="ghost" size="sm" className="rounded-full">
										Continue →
									</Button>
								</m.div>
							))}
						</div>
					</section>
				</m.div>
			</FocusContent>
		</div>
	);
}
