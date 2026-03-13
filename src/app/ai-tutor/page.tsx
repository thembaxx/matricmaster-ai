'use client';

import {
	BookOpen01Icon,
	Loading03Icon,
	SaveIcon,
	SparklesIcon,
	WorkoutSportIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AIPrompt } from '@/components/AI/AIPrompt';
import { BookmarkButton } from '@/components/AI/BookmarkButton';
import { ConversationSidebar } from '@/components/AI/ConversationSidebar';
import { FlashcardModal } from '@/components/AI/FlashcardModal';
import { MarkdownRenderer } from '@/components/AI/MarkdownRenderer';
import { PracticeModal } from '@/components/AI/PracticeModal';
import { QuickPrompts } from '@/components/AI/QuickPrompts';
import { SuggestedFollowUps } from '@/components/AI/SuggestedFollowUps';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { authClient } from '@/lib/auth-client';
import { saveConversationAction } from '@/lib/db/ai-tutor-actions';
import type { AiConversation } from '@/lib/db/schema';
import { cn } from '@/lib/utils';

interface Message {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: Date;
	suggestions?: string[];
}

interface PracticeProblem {
	id: string;
	question: string;
	type: 'multiple-choice' | 'short-answer' | 'step-by-step';
	options?: string[];
	answer: string;
	explanation: string;
}

interface Flashcard {
	id: string;
	front: string;
	back: string;
	tags: string[];
}

export default function AITutorPage() {
	const { data: session } = authClient.useSession();
	const [messages, setMessages] = useState<Message[]>([
		{
			id: '1',
			role: 'assistant',
			content:
				"Hey! I'm your Study Buddy. I can help you understand any NSC topic, answer exam questions, or explain tricky concepts. What do you need help with today?",
			timestamp: new Date(),
		},
	]);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
	const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
	const [isGeneratingPractice, setIsGeneratingPractice] = useState(false);
	const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
	const [practiceProblems, setPracticeProblems] = useState<PracticeProblem[]>([]);
	const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
	const [showPracticeModal, setShowPracticeModal] = useState(false);
	const [showFlashcardModal, setShowFlashcardModal] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, []);

	const handleSend = async (messageText?: string) => {
		const textToSend = messageText || input;
		if (!textToSend.trim() || isLoading) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			role: 'user',
			content: textToSend,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		scrollToBottom();
		setInput('');
		setIsLoading(true);

		try {
			const response = await fetch('/api/ai-tutor', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: textToSend,
					subject: selectedSubject,
					history: messages.map((m) => ({ role: m.role, content: m.content })),
					includeSuggestions: true,
				}),
			});

			const data = await response.json();

			const assistantMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: data.response || 'I apologize, but I encountered an error. Please try again.',
				timestamp: new Date(),
				suggestions: data.suggestions || [],
			};

			setMessages((prev) => [...prev, assistantMessage]);
			scrollToBottom();
		} catch {
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: 'I apologize, but I encountered an error. Please try again.',
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
			scrollToBottom();
		} finally {
			setIsLoading(false);
		}
	};

	const handleSave = async () => {
		if (!session?.user?.id) {
			toast.error('You must be logged in to save conversations');
			return;
		}

		if (messages.length <= 1) {
			toast.info('Start a conversation first');
			return;
		}

		const firstUserMessage = messages.find((m) => m.role === 'user');
		const title = firstUserMessage
			? `${firstUserMessage.content.slice(0, 50)}...`
			: 'Untitled Conversation';

		const result = await saveConversationAction(
			session.user.id,
			title,
			messages.map((m) => ({
				role: m.role,
				content: m.content,
				timestamp: m.timestamp,
			})),
			selectedSubject ?? undefined
		);

		if (result.success) {
			toast.success('Conversation saved');
			if (result.conversationId) {
				setCurrentConversationId(result.conversationId);
			}
		} else {
			toast.error(result.error || 'Failed to save');
		}
	};

	const handleGeneratePractice = async () => {
		if (messages.length <= 1) {
			toast.info('Have a conversation first to generate practice problems');
			return;
		}

		setIsGeneratingPractice(true);
		try {
			const recentMessages = messages.slice(-6);
			const context = recentMessages.map((m) => `${m.role}: ${m.content}`).join('\n\n');

			const response = await fetch('/api/ai-tutor/practice', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					context,
					subject: selectedSubject,
					difficulty: 'medium',
					count: 3,
				}),
			});

			const data = await response.json();
			if (data.problems) {
				setPracticeProblems(data.problems);
				setShowPracticeModal(true);
				toast.success(`Generated ${data.problems.length} practice problems!`);
			}
		} catch {
			toast.error('Failed to generate practice problems');
		} finally {
			setIsGeneratingPractice(false);
		}
	};

	const handleGenerateFlashcards = async () => {
		if (messages.length <= 1) {
			toast.info('Have a conversation first to generate flashcards');
			return;
		}

		setIsGeneratingFlashcards(true);
		try {
			const recentMessages = messages.slice(-6);
			const context = recentMessages.map((m) => `${m.role}: ${m.content}`).join('\n\n');

			const response = await fetch('/api/ai-tutor/flashcards', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					context,
					subject: selectedSubject,
					count: 5,
				}),
			});

			const data = await response.json();
			if (data.flashcards) {
				setFlashcards(data.flashcards);
				setShowFlashcardModal(true);
				toast.success(`Generated ${data.flashcards.length} flashcards!`);
			}
		} catch {
			toast.error('Failed to generate flashcards');
		} finally {
			setIsGeneratingFlashcards(false);
		}
	};

	const handleLoadConversation = (conversation: AiConversation) => {
		try {
			const parsedMessages = JSON.parse(conversation.messages);
			const loadedMessages: Message[] = parsedMessages.map(
				(m: { role: string; content: string; timestamp: string }, index: number) => ({
					id: `loaded-${index}`,
					role: m.role as 'user' | 'assistant',
					content: m.content,
					timestamp: new Date(m.timestamp),
				})
			);
			setMessages(loadedMessages);
			setCurrentConversationId(conversation.id);
			setSelectedSubject(conversation.subject || null);
		} catch {
			toast.error('Failed to load conversation');
		}
	};

	const handleNewConversation = () => {
		setMessages([
			{
				id: '1',
				role: 'assistant',
				content: "Hey! I'm your Study Buddy. What do you need help with today?",
				timestamp: new Date(),
			},
		]);
		setCurrentConversationId(null);
		setSelectedSubject(null);
		setPracticeProblems([]);
		setFlashcards([]);
	};

	const subjects = [
		{ id: 'mathematics', name: 'Mathematics', color: 'bg-math', icon: 'Σ' },
		{ id: 'physics', name: 'Physics', color: 'bg-physics', icon: '⚛' },
		{ id: 'chemistry', name: 'Chemistry', color: 'bg-brand-amber', icon: '🧪' },
		{ id: 'life sciences', name: 'Life Sciences', color: 'bg-life-sci', icon: '🧬' },
	];

	useEffect(() => {
		if (messages.length > 0) {
			scrollToBottom();
		}
	}, [messages, scrollToBottom]);

	if (!session) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background p-4">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Study Helper</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-muted-foreground">Sign in to get help with your studies.</p>
						<Button asChild className="w-full">
							<Link href="/sign-in">Sign In</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background flex pb-40">
			{session.user && (
				<ConversationSidebar
					userId={session.user.id}
					currentConversationId={currentConversationId}
					onSelectConversation={handleLoadConversation}
					onNewConversation={handleNewConversation}
				/>
			)}

			<div className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-zinc-950">
				<header className="border-b bg-card/50 backdrop-blur-xl sticky top-0 z-10 px-4 py-3 md:px-6 md:py-4">
					<div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
						<div className="flex items-center gap-3 md:gap-4">
							<div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
								<HugeiconsIcon
									icon={SparklesIcon}
									className="h-5 w-5 md:h-6 md:w-6 text-primary animate-pulse-soft"
								/>
							</div>
							<div>
								<h1 className="text-lg md:text-xl font-black font-lexend tracking-tight">
									Study Helper
								</h1>
								<div className="flex items-center gap-2">
									<span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
									<p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
										Online
									</p>
								</div>
							</div>
						</div>
						<div className="flex items-center gap-1 md:gap-2">
							<Button
								variant="outline"
								size="sm"
								className="rounded-xl border-border/50 bg-surface-elevated/50 px-2 md:px-3"
								onClick={handleGenerateFlashcards}
								disabled={isGeneratingFlashcards || messages.length <= 1}
							>
								{isGeneratingFlashcards ? (
									<HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
								) : (
									<HugeiconsIcon icon={BookOpen01Icon} className="h-4 w-4" />
								)}
								<span className="hidden md:inline ml-2">Flashcards</span>
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="rounded-xl border-border/50 bg-surface-elevated/50 px-2 md:px-3"
								onClick={handleGeneratePractice}
								disabled={isGeneratingPractice || messages.length <= 1}
							>
								{isGeneratingPractice ? (
									<HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
								) : (
									<HugeiconsIcon icon={WorkoutSportIcon} className="h-4 w-4" />
								)}
								<span className="hidden md:inline ml-2">Practice</span>
							</Button>
							<Button variant="ios" size="sm" className="rounded-xl" onClick={handleSave}>
								<HugeiconsIcon icon={SaveIcon} className="h-4 w-4" />
								<span className="hidden md:inline ml-2">FloppyDisk</span>
							</Button>
						</div>
					</div>
				</header>

				<div className="border-b bg-surface-base/50 backdrop-blur-md px-4 md:px-6 py-3">
					<div className="max-w-4xl mx-auto">
						<div className="flex flex-wrap gap-2">
							{subjects.map((subject) => (
								<Button
									key={subject.id}
									variant={selectedSubject === subject.id ? 'default' : 'outline'}
									size="sm"
									onClick={() =>
										setSelectedSubject(selectedSubject === subject.id ? null : subject.id)
									}
									className={cn(
										'gap-1.5 md:gap-2 rounded-xl md:rounded-2xl border-border/50 transition-all duration-300 text-xs md:text-sm',
										selectedSubject === subject.id
											? 'shadow-lg scale-105'
											: 'bg-surface-elevated/30 hover:bg-surface-elevated'
									)}
								>
									<span className="text-sm">{subject.icon}</span>
									<span className="font-bold hidden sm:inline">{subject.name}</span>
								</Button>
							))}
						</div>
					</div>
				</div>

				<ScrollArea className="flex-1 px-3 md:px-6">
					<div className="max-w-4xl mx-auto py-6 md:py-8 space-y-6 md:space-y-8">
						{messages.map((message) => (
							<div
								key={message.id}
								className={cn(
									'flex gap-2 md:gap-4 group transition-all duration-300 animate-in fade-in slide-in-from-bottom-2',
									message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
								)}
							>
								<Avatar
									className={cn(
										'h-8 w-8 md:h-10 md:w-10 shrink-0 rounded-xl md:rounded-2xl border-2',
										message.role === 'user'
											? 'border-primary/20 shadow-primary/10'
											: 'border-border/50 shadow-sm'
									)}
								>
									<AvatarFallback
										className={cn(
											'font-black text-xs md:text-base',
											message.role === 'user'
												? 'bg-primary text-primary-foreground'
												: 'bg-surface-elevated text-primary'
										)}
									>
										{message.role === 'user' ? 'U' : 'MM'}
									</AvatarFallback>
								</Avatar>
								<div
									className={cn(
										'flex-1 max-w-[80%] md:max-w-[85%] relative',
										message.role === 'user' ? 'items-end' : 'items-start'
									)}
								>
									<div
										className={cn(
											'rounded-2xl md:rounded-[2rem] px-3 md:px-6 py-3 md:py-4 shadow-sm relative group/bubble transition-all duration-300',
											message.role === 'user'
												? 'bg-primary text-primary-foreground rounded-tr-sm'
												: 'bg-card border border-border/50 rounded-tl-sm hover:shadow-md'
										)}
									>
										<div
											className={cn(
												'absolute top-2 md:top-4',
												message.role === 'user' ? '-left-8 md:-left-10' : '-right-8 md:-right-10'
											)}
										>
											<BookmarkButton
												messageId={message.id}
												content={message.content}
												role={message.role}
												subject={selectedSubject}
											/>
										</div>
										<div className="prose prose-sm dark:prose-invert max-w-none">
											{message.role === 'assistant' ? (
												<MarkdownRenderer content={message.content} />
											) : (
												<p className="whitespace-pre-wrap font-medium leading-relaxed">
													{message.content}
												</p>
											)}
										</div>
										<div
											className={cn(
												'flex items-center gap-2 mt-3',
												message.role === 'user' ? 'justify-end' : 'justify-start'
											)}
										>
											<p
												className={cn(
													'text-[10px] font-bold uppercase tracking-widest',
													message.role === 'user'
														? 'text-primary-foreground/60'
														: 'text-muted-foreground/60'
												)}
											>
												{message.timestamp.toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit',
												})}
											</p>
										</div>
									</div>
									{message.role === 'assistant' && message.suggestions && (
										<SuggestedFollowUps
											suggestions={message.suggestions}
											onSelectSuggestion={(suggestion) => handleSend(suggestion)}
										/>
									)}
								</div>
							</div>
						))}
						{isLoading && (
							<div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
								<Avatar className="h-10 w-10 shrink-0 rounded-2xl border-2 border-border/50 bg-surface-elevated animate-pulse" />
								<div className="bg-card border border-border/50 rounded-[2rem] rounded-tl-sm px-6 py-4 flex items-center gap-3 shadow-sm">
									<div className="flex gap-1">
										<span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse" />
										<span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse [animation-delay:0.2s]" />
										<span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-pulse [animation-delay:0.4s]" />
									</div>
									<span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
										Thinking
									</span>
								</div>
							</div>
						)}
						<div ref={messagesEndRef} className="h-20" />
					</div>
				</ScrollArea>

				<div className="border-t bg-surface-base/80 backdrop-blur-xl p-3 md:p-6">
					<div className="max-w-4xl mx-auto space-y-3 md:space-y-4">
						<QuickPrompts
							onSelectPrompt={(prompt) => handleSend(prompt)}
							selectedSubject={selectedSubject}
						/>
						<AIPrompt
							onSend={(msg) => handleSend(msg)}
							isLoading={isLoading}
							placeholder="Ask me anything about your studies..."
						/>
						<p className="text-[10px] font-bold text-muted-foreground/60 text-center uppercase tracking-[0.2em]">
							Help from Google Gemini • Check important info
						</p>
					</div>
				</div>
			</div>

			<PracticeModal
				open={showPracticeModal}
				onOpenChange={setShowPracticeModal}
				problems={practiceProblems}
				subject={selectedSubject || undefined}
			/>

			<FlashcardModal
				open={showFlashcardModal}
				onOpenChange={setShowFlashcardModal}
				flashcards={flashcards}
				subject={selectedSubject || undefined}
			/>
		</div>
	);
}
