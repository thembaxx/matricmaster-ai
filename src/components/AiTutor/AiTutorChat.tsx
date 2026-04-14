'use client';

import { AddToStudyPlanButton } from '@/components/AI/AddToStudyPlanButton';
import { BookmarkButton } from '@/components/AI/BookmarkButton';
import { CitationDisplay } from '@/components/AI/CitationDisplay';
import { MarkdownRenderer } from '@/components/AI/MarkdownRenderer';
import { ReportIncorrectAnswerButton } from '@/components/AI/ReportIncorrectAnswerButton';
import { SaveAsFlashcardButton } from '@/components/AI/SaveAsFlashcardButton';
import { SuggestedFollowUps } from '@/components/AI/SuggestedFollowUps';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Message } from '@/hooks/useAiTutor';
import { cn } from '@/lib/utils';

interface AiTutorChatProps {
	messages: Message[];
	isLoading: boolean;
	selectedSubject: string | null;
	showSources?: boolean;
	handleSend: (message: string) => void;
	messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function AiTutorChat({
	messages,
	isLoading,
	selectedSubject,
	showSources = true,
	handleSend,
	messagesEndRef,
}: AiTutorChatProps) {
	return (
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
										'absolute top-2 md:top-4 flex items-center gap-1',
										message.role === 'user'
											? '-left-8 md:-left-10 flex-row'
											: '-right-8 md:-right-10 flex-row-reverse'
									)}
								>
									<BookmarkButton
										messageId={message.id}
										content={message.content}
										role={message.role}
										subject={selectedSubject}
									/>
									{message.role === 'assistant' && message.content.length > 100 && (
										<SaveAsFlashcardButton
											content={message.content}
											subject={selectedSubject || undefined}
											variant="ghost"
											size="icon"
										/>
									)}
									{message.role === 'assistant' && message.content.length > 50 && (
										<ReportIncorrectAnswerButton
											content={message.content}
											subject={selectedSubject || undefined}
											variant="ghost"
											size="icon"
										/>
									)}
									{message.role === 'assistant' && message.content.length > 50 && (
										<AddToStudyPlanButton
											content={message.content}
											subject={selectedSubject}
											variant="ghost"
											size="icon"
										/>
									)}
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
											'text-[10px] font-bold  tracking-widest',
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
							{message.role === 'assistant' &&
								message.citations &&
								message.citations.length > 0 && (
									<CitationDisplay citations={message.citations} showSources={showSources} />
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
							<span className="text-xs font-medium text-muted-foreground" />
						</div>
					</div>
				)}
				<div ref={messagesEndRef} className="h-20" />
			</div>
		</ScrollArea>
	);
}
