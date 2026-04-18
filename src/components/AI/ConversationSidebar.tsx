'use client';

import {
	Add01Icon,
	ArchiveIcon,
	Cancel01Icon,
	Chat01Icon,
	Delete02Icon,
	Loading03Icon,
	Search01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion as m } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { deleteConversationAction, getConversationsAction } from '@/lib/db/ai-tutor-actions';
import type { AiConversation } from '@/lib/db/schema';

function formatConversationDate(date: Date | string | null) {
	if (!date) return 'Unknown';
	const d = new Date(date);
	const now = new Date();
	const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
	if (diffDays === 0) return 'Today';
	if (diffDays === 1) return 'Yesterday';
	if (diffDays < 7) return `${diffDays} days ago`;
	return d.toLocaleDateString();
}

interface ConversationListProps {
	conversations: AiConversation[];
	filteredConversations: AiConversation[];
	isLoading: boolean;
	searchQuery: string;
	setSearchQuery: (q: string) => void;
	deletingId: string | null;
	currentConversationId: string | null;
	onSelectConversation: (conversation: AiConversation) => void;
	onNewConversation: () => void;
	onDelete: (e: React.MouseEvent, conversationId: string) => void;
	onSelectAndClose?: () => void;
}

function ConversationList({
	conversations,
	filteredConversations,
	isLoading,
	searchQuery,
	setSearchQuery,
	deletingId,
	currentConversationId,
	onSelectConversation,
	onNewConversation,
	onDelete,
	onSelectAndClose,
}: ConversationListProps) {
	return (
		<div className="flex flex-col h-full">
			<div className="p-4 border-b space-y-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<HugeiconsIcon icon={ArchiveIcon} className="h-5 w-5 text-primary" />
						<h2 className="font-bold">ClockCounterClockwise</h2>
					</div>
					<span className="text-xs text-muted-foreground">{conversations.length} saved</span>
				</div>
				<div className="relative">
					<HugeiconsIcon
						icon={Search01Icon}
						className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
					/>
					<Input
						placeholder="MagnifyingGlass conversations..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9 pr-8"
						aria-label="MagnifyingGlass conversations"
					/>
					<AnimatePresence>
						{searchQuery && (
							<m.button
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								onClick={() => setSearchQuery('')}
								className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
								aria-label="Clear search"
							>
								<HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
							</m.button>
						)}
					</AnimatePresence>
				</div>
				<Button onClick={onNewConversation} className="w-full" size="sm">
					<HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
					New Conversation
				</Button>
			</div>

			<ScrollArea className="flex-1">
				<div className="p-2 space-y-1">
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<HugeiconsIcon
								icon={Loading03Icon}
								className="h-6 w-6 animate-spin text-muted-foreground"
							/>
						</div>
					) : filteredConversations.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<HugeiconsIcon icon={Chat01Icon} className="h-8 w-8 mx-auto mb-2 opacity-50" />
							<p className="text-sm">
								{searchQuery ? 'No matching conversations' : 'No saved conversations yet'}
							</p>
						</div>
					) : (
						filteredConversations.map((conversation) => (
							<Card
								key={conversation.id}
								className={`p-3 cursor-pointer transition-all hover:bg-muted/80 ${
									currentConversationId === conversation.id ? 'bg-primary/10 border-primary/30' : ''
								}`}
								onClick={() => {
									onSelectConversation(conversation);
									onSelectAndClose?.();
								}}
							>
								<div className="flex items-start justify-between gap-2">
									<div className="flex-1 min-w-0">
										<p className="font-medium text-sm truncate">{conversation.title}</p>
										<div className="flex items-center gap-2 mt-1">
											{conversation.subject && (
												<span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
													{conversation.subject}
												</span>
											)}
											<span className="text-xs text-muted-foreground">
												{conversation.messageCount} messages
											</span>
										</div>
										<p className="text-xs text-muted-foreground mt-1">
											{formatConversationDate(conversation.updatedAt ?? conversation.createdAt)}
										</p>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
										onClick={(e) => onDelete(e, conversation.id)}
										disabled={deletingId === conversation.id}
										aria-label="Backspace conversation"
									>
										{deletingId === conversation.id ? (
											<HugeiconsIcon icon={Loading03Icon} className="h-3.5 w-3.5 animate-spin" />
										) : (
											<HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5" />
										)}
									</Button>
								</div>
							</Card>
						))
					)}
				</div>
			</ScrollArea>
		</div>
	);
}

interface ConversationSidebarProps {
	userId: string;
	currentConversationId: string | null;
	onSelectConversation: (conversation: AiConversation) => void;
	onNewConversation: () => void;
}

export function ConversationSidebar({
	userId,
	currentConversationId,
	onSelectConversation,
	onNewConversation,
}: ConversationSidebarProps) {
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState('');
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	const { data: conversations = [], isLoading } = useQuery({
		queryKey: ['conversations', userId],
		queryFn: () => getConversationsAction(userId),
	});

	const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
		e.stopPropagation();
		setDeletingId(conversationId);
		try {
			const result = await deleteConversationAction(conversationId, userId);
			if (result.success) {
				await queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
				toast.success('Conversation deleted');
				if (currentConversationId === conversationId) {
					onNewConversation();
				}
			} else {
				toast.error(result.error || 'Failed to delete');
			}
		} catch (error) {
			console.error('Failed to delete conversation:', error);
			toast.error('Failed to delete conversation');
		} finally {
			setDeletingId(null);
		}
	};

	const filteredConversations = conversations.filter(
		(c) =>
			c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			c.subject?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const listProps = {
		conversations,
		filteredConversations,
		isLoading,
		searchQuery,
		setSearchQuery,
		deletingId,
		currentConversationId,
		onSelectConversation,
		onNewConversation,
		onDelete: handleDelete,
	};

	return (
		<>
			{/* Desktop Sidebar */}
			<aside className="hidden lg:block w-full max-w-80 border-r bg-card/30 shrink-0">
				<ConversationList {...listProps} />
			</aside>

			{/* Mobile Sheet */}
			<Sheet open={isOpen} onOpenChange={setIsOpen}>
				<SheetTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						className="lg:hidden"
						aria-label="Open conversation history"
					>
						<HugeiconsIcon icon={ArchiveIcon} className="h-4 w-4" />
					</Button>
				</SheetTrigger>
				<SheetContent side="left" className="w-full max-w-80 p-0">
					<SheetHeader className="sr-only">
						<SheetTitle>Conversation ClockCounterClockwise</SheetTitle>
					</SheetHeader>
					<ConversationList {...listProps} onSelectAndClose={() => setIsOpen(false)} />
				</SheetContent>
			</Sheet>
		</>
	);
}
