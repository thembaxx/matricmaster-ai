'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useRef } from 'react';
import { AIPrompt } from '@/components/AI/AIPrompt';
import { ConversationSidebar } from '@/components/AI/ConversationSidebar';
import { QuickPrompts } from '@/components/AI/QuickPrompts';
import { AiTutorChat } from '@/components/AiTutor/AiTutorChat';
import { AiTutorHeader } from '@/components/AiTutor/AiTutorHeader';
import { AiTutorSubjects } from '@/components/AiTutor/AiTutorSubjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAiTutor } from '@/hooks/useAiTutor';

const FlashcardModal = dynamic(
	() => import('@/components/AI/FlashcardModal').then((mod) => ({ default: mod.FlashcardModal })),
	{ ssr: false, loading: () => null }
);
const PracticeModal = dynamic(
	() => import('@/components/AI/PracticeModal').then((mod) => ({ default: mod.PracticeModal })),
	{ ssr: false, loading: () => null }
);

function AITutorPageContent() {
	const searchParams = useSearchParams();
	const contextParam = searchParams.get('context');

	const {
		session,
		messages,
		isLoading,
		selectedSubject,
		setSelectedSubject,
		currentConversationId,
		isGeneratingPractice,
		isGeneratingFlashcards,
		practiceProblems,
		flashcards,
		showPracticeModal,
		setShowPracticeModal,
		showFlashcardModal,
		setShowFlashcardModal,
		messagesEndRef,
		handleSend,
		handleSave,
		handleGeneratePractice,
		handleGenerateFlashcards,
		handleLoadConversation,
		handleNewConversation,
		showSources,
		handleToggleSources,
	} = useAiTutor();

	const prevContextParam = useRef(contextParam);

	if (contextParam && contextParam !== prevContextParam.current) {
		prevContextParam.current = contextParam;
		const decodedContext = decodeURIComponent(contextParam);
		handleSend(undefined, decodedContext);
	}

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
				<AiTutorHeader
					isGeneratingFlashcards={isGeneratingFlashcards}
					isGeneratingPractice={isGeneratingPractice}
					messagesLength={messages.length}
					showSources={showSources}
					handleGenerateFlashcards={handleGenerateFlashcards}
					handleGeneratePractice={handleGeneratePractice}
					handleSave={handleSave}
					handleToggleSources={handleToggleSources}
				/>

				<AiTutorSubjects
					selectedSubject={selectedSubject}
					setSelectedSubject={setSelectedSubject}
				/>

				<AiTutorChat
					messages={messages}
					isLoading={isLoading}
					selectedSubject={selectedSubject}
					showSources={showSources}
					handleSend={handleSend}
					messagesEndRef={messagesEndRef}
				/>

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

function AITutorPageSkeleton() {
	return (
		<div className="min-h-screen bg-background flex pb-40">
			<div className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-zinc-950">
				<div className="flex-1 p-8 animate-pulse space-y-6">
					<div className="h-12 bg-muted rounded w-1/3" />
					<div className="h-8 bg-muted rounded w-1/4" />
					<div className="h-64 bg-muted rounded-lg" />
				</div>
			</div>
		</div>
	);
}

export default function AITutorPage() {
	return (
		<Suspense fallback={<AITutorPageSkeleton />}>
			<AITutorPageContent />
		</Suspense>
	);
}
