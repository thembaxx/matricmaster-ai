'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, ViewTransition } from 'react';
import { AIErrorBoundary } from '@/components/AI/AIErrorBoundary';
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
const QuickFlashcardSave = dynamic(
	() =>
		import('@/components/AI/QuickFlashcardSave').then((mod) => ({
			default: mod.QuickFlashcardSave,
		})),
	{ ssr: false, loading: () => null }
);
const PracticeModal = dynamic(
	() => import('@/components/AI/PracticeModal').then((mod) => ({ default: mod.PracticeModal })),
	{ ssr: false, loading: () => null }
);

function AITutorPageContent() {
	const searchParams = useSearchParams();
	const contextParam = searchParams.get('context');
	const topicParam = searchParams.get('topic');
	const subjectParam = searchParams.get('subject');
	const practiceParam = searchParams.get('practice');

	const {
		session,
		isLoading: isSessionLoading,
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
		showQuickSaveModal,
		setShowQuickSaveModal,
		quickSaveTerm,
		quickSaveDefinition,
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

	const initialEffectRun = useRef(false);

	useEffect(() => {
		if (initialEffectRun.current) return;

		if (contextParam) {
			const decodedContext = decodeURIComponent(contextParam);
			handleSend(undefined, decodedContext);
			initialEffectRun.current = true;
		} else if (topicParam) {
			const decodedTopic = decodeURIComponent(topicParam);
			const decodedSubject = subjectParam ? decodeURIComponent(subjectParam) : '';
			handleSend(`explain ${decodedTopic} in ${decodedSubject} to me like i am in grade 12.`);
			initialEffectRun.current = true;
		}
	}, [contextParam, topicParam, subjectParam, handleSend]);

	// Auto-generate practice when practice=true param is present
	const practiceEffectRan = useRef(false);
	useEffect(() => {
		if (practiceEffectRan.current) return;
		if (practiceParam !== 'true') return;
		if (messages.length <= 1) return;

		practiceEffectRan.current = true;
		const timer = setTimeout(() => {
			handleGeneratePractice();
		}, 2500);

		return () => clearTimeout(timer);
	}, [practiceParam, messages.length, handleGeneratePractice]);

	if (isSessionLoading) {
		return <AITutorPageSkeleton />;
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
							<Link href="/sign-in">sign in</Link>
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

			<div className="flex-1 flex flex-col min-w-0 bg-muted dark:bg-background">
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

				<AIErrorBoundary componentName="AI Tutor Chat">
					<AiTutorChat
						messages={messages}
						isLoading={isLoading}
						selectedSubject={selectedSubject}
						showSources={showSources}
						handleSend={handleSend}
						messagesEndRef={messagesEndRef}
					/>
				</AIErrorBoundary>

				<div className="border-t bg-surface-base/80 backdrop-blur-xl p-3 md:p-6">
					<div className="max-w-4xl mx-auto space-y-3 md:space-y-4">
						<QuickPrompts
							onSelectPrompt={(prompt) => handleSend(prompt)}
							selectedSubject={selectedSubject}
						/>
						<AIPrompt
							onSend={(msg) => handleSend(msg)}
							isLoading={isLoading}
							placeholder="ask me anything about your studies..."
						/>
						<p className="text-xs font-bold text-muted-foreground/60 text-center tracking-widest uppercase">
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

			<QuickFlashcardSave
				open={showQuickSaveModal}
				onOpenChange={setShowQuickSaveModal}
				initialTerm={quickSaveTerm}
				initialDefinition={quickSaveDefinition}
				subject={selectedSubject || undefined}
			/>
		</div>
	);
}

function AITutorPageSkeleton() {
	return (
		<div className="min-h-screen bg-background flex pb-40">
			<div className="flex-1 flex flex-col min-w-0 bg-muted dark:bg-background">
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
		<ViewTransition default="none" enter="vt-blur-reveal">
			<Suspense fallback={<AITutorPageSkeleton />}>
				<AITutorPageContent />
			</Suspense>
		</ViewTransition>
	);
}
