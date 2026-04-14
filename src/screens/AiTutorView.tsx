'use client';

import {
	Add01Icon,
	ArrowRight01Icon,
	Bookmark01Icon,
	FlashIcon,
	MicIcon,
	SparklesIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { FlashcardModal } from '@/components/AI/Flashcards/FlashcardModal';
import { PracticeModal } from '@/components/AI/PracticeModal';
import { AiTutorChat } from '@/components/AiTutor/AiTutorChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SUBJECTS_CONTENT } from '@/content';
import type { Flashcard, Message, PracticeProblem } from '@/hooks/useAiTutor';
import { cn } from '@/lib/utils';
import { TutorSubjectSelector } from './TutorSubjectSelector';

interface AiTutorViewProps {
	messages: Message[];
	isLoading: boolean;
	selectedSubject: string | null;
	setSelectedSubject: (subject: string | null) => void;
	input: string;
	setInput: (value: string) => void;
	isGeneratingPractice: boolean;
	isGeneratingFlashcards: boolean;
	practiceProblems: PracticeProblem[];
	flashcards: Flashcard[];
	showPracticeModal: boolean;
	setShowPracticeModal: (show: boolean) => void;
	showFlashcardModal: boolean;
	setShowFlashcardModal: (show: boolean) => void;
	messagesEndRef: React.RefObject<HTMLDivElement | null>;
	handleSend: (message?: string) => Promise<void>;
	handleSave: () => Promise<void>;
	handleGeneratePractice: () => Promise<void>;
	handleGenerateFlashcards: () => Promise<void>;
	handleNewConversation: () => void;
	handleVoiceInput: () => void;
	isListening: boolean;
	voiceSupported: boolean;
}

export function AiTutorView({
	messages,
	isLoading,
	selectedSubject,
	setSelectedSubject,
	input,
	setInput,
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
	handleNewConversation,
	handleVoiceInput,
	isListening,
	voiceSupported,
}: AiTutorViewProps) {
	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			if (!input.trim() || isLoading) return;
			handleSend();
		},
		[input, isLoading, handleSend]
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				handleSubmit(e as unknown as React.FormEvent);
			}
		},
		[handleSubmit]
	);

	const handleQuickSave = () => {
		handleSave();
	};

	const handleQuickNew = () => {
		handleNewConversation();
		toast.info('Started new conversation');
	};

	const handleQuickPractice = () => {
		handleGeneratePractice();
	};

	const handleQuickFlashcards = () => {
		handleGenerateFlashcards();
	};

	const availableSubjects = SUBJECTS_CONTENT.filter((s) => s.isSupported);

	return (
		<div className="flex flex-col h-full min-h-[60vh]">
			{/* Chat Header */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
				<div className="flex items-center gap-2">
					<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-brand-orange" />
					<span className="font-black text-sm text-foreground">ai study tutor</span>
					{selectedSubject && (
						<span className="text-xs text-muted-foreground font-medium">({selectedSubject})</span>
					)}
				</div>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 rounded-xl"
						onClick={handleQuickSave}
						title="Save conversation"
					>
						<HugeiconsIcon icon={Bookmark01Icon} className="w-4 h-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 rounded-xl"
						onClick={handleQuickNew}
						title="New conversation"
					>
						<HugeiconsIcon icon={Add01Icon} className="w-4 h-4" />
					</Button>
				</div>
			</div>

			{/* Chat Messages */}
			<div className="flex-1 min-h-0">
				<AiTutorChat
					messages={messages}
					isLoading={isLoading}
					selectedSubject={selectedSubject}
					showSources={true}
					handleSend={handleSend}
					messagesEndRef={messagesEndRef}
				/>
			</div>

			{/* Input Area */}
			<div className="border-t border-border/50 p-3 shrink-0 bg-background/80 backdrop-blur-sm">
				<form onSubmit={handleSubmit} className="flex flex-col gap-2">
					{/* Subject Selector & Input Row */}
					<div className="flex items-center gap-2">
						<TutorSubjectSelector
							selectedSubject={selectedSubject}
							onSelect={setSelectedSubject}
							subjects={availableSubjects}
						/>

						<div className="relative flex-1">
							<Input
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="Ask any question..."
								className="h-12 pr-12 rounded-2xl bg-muted/50 border-transparent focus:border-primary/50"
								disabled={isLoading}
							/>
							<div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
								{voiceSupported && (
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className={cn(
											'h-10 w-10 rounded-xl',
											isListening && 'bg-red-500/20 text-red-500 animate-pulse'
										)}
										onClick={handleVoiceInput}
										disabled={isLoading}
										title={isListening ? 'Stop listening' : 'Voice input'}
									>
										<HugeiconsIcon icon={MicIcon} className="w-4 h-4" />
									</Button>
								)}
								<Button
									type="submit"
									size="icon"
									className="h-10 w-10 rounded-xl bg-brand-orange hover:bg-brand-orange/90"
									disabled={isLoading || !input.trim()}
								>
									<HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 text-white" />
								</Button>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center justify-center gap-2 pt-1">
						<Button
							type="button"
							variant="outline"
							className="h-9 rounded-xl text-xs font-bold gap-1.5"
							onClick={handleQuickPractice}
							disabled={isLoading || isGeneratingPractice}
						>
							<HugeiconsIcon
								icon={FlashIcon}
								className={cn('w-3.5 h-3.5', isGeneratingPractice && 'animate-spin')}
							/>
							{isGeneratingPractice ? 'generating...' : 'generate practice'}
						</Button>
						<Button
							type="button"
							variant="outline"
							className="h-9 rounded-xl text-xs font-bold gap-1.5"
							onClick={handleQuickFlashcards}
							disabled={isLoading || isGeneratingFlashcards}
						>
							<HugeiconsIcon
								icon={FlashIcon}
								className={cn('w-3.5 h-3.5', isGeneratingFlashcards && 'animate-spin')}
							/>
							{isGeneratingFlashcards ? 'generating...' : 'generate flashcards'}
						</Button>
					</div>
				</form>
			</div>

			{/* Modals */}
			<PracticeModal
				open={showPracticeModal}
				onOpenChange={setShowPracticeModal}
				problems={practiceProblems}
				subject={selectedSubject ?? undefined}
			/>

			<FlashcardModal
				open={showFlashcardModal}
				onOpenChange={setShowFlashcardModal}
				flashcards={flashcards}
				subject={selectedSubject ?? undefined}
			/>
		</div>
	);
}
