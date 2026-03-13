'use client';

import {
	ArrowLeft02Icon,
	Chat01Icon,
	Delete02Icon,
	Edit01Icon,
	Flag,
	MoreHorizontalIcon,
	ThumbsDownIcon,
	ThumbsUpIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

interface Comment {
	id: string;
	userId: string;
	userName: string | null;
	userImage: string | null;
	content: string;
	createdAt: Date | null;
	upvotes: number;
	downvotes: number;
	parentId: string | null;
	isEdited: boolean;
	replies?: Comment[];
}

interface CommentsProps {
	resourceType: string;
	resourceId: string;
	title?: string;
	className?: string;
}

export function Comments({
	resourceType,
	resourceId,
	title = 'Discussion',
	className,
}: CommentsProps) {
	const { data: session } = useSession();
	const [comments, setComments] = useState<Comment[]>([]);
	const [newComment, setNewComment] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(true);
	const [replyingTo, setReplyingTo] = useState<string | null>(null);
	const [replyContent, setReplyContent] = useState('');

	const fetchComments = useCallback(async () => {
		try {
			const response = await fetch(
				`/api/comments?resourceType=${resourceType}&resourceId=${resourceId}`
			);
			const result = await response.json();
			if (result.success) {
				// Organize comments into threads
				const allComments = result.data as Comment[];
				const rootComments = allComments.filter((c) => !c.parentId);
				const replies = allComments.filter((c) => c.parentId);

				const threaded = rootComments.map((root) => ({
					...root,
					replies: replies.filter((r) => r.parentId === root.id).reverse(),
				}));

				setComments(threaded);
			}
		} catch (error) {
			console.error('Failed to fetch comments:', error);
		} finally {
			setIsFetching(false);
		}
	}, [resourceType, resourceId]);

	useEffect(() => {
		fetchComments();
	}, [fetchComments]);

	const handleSubmitComment = async () => {
		if (!newComment.trim() || !session?.user) return;

		setIsLoading(true);
		try {
			const response = await fetch('/api/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					content: newComment,
					resourceType,
					resourceId,
				}),
			});

			if (response.ok) {
				toast.success('Comment posted!');
				setNewComment('');
				fetchComments();
			} else {
				toast.error('Failed to post comment');
			}
		} catch (error) {
			toast.error('An error occurred');
			console.debug('Failed to post comment:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleReply = async (parentId: string) => {
		if (!replyContent.trim() || !session?.user) return;

		try {
			const response = await fetch('/api/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					content: replyContent,
					resourceType,
					resourceId,
					parentId,
				}),
			});

			if (response.ok) {
				toast.success('Reply posted!');
				setReplyContent('');
				setReplyingTo(null);
				fetchComments();
			}
		} catch (error) {
			toast.error('Failed to post reply');
		}
	};

	const handleVote = async (commentId: string, voteType: 'up' | 'down') => {
		if (!session?.user) {
			toast.error('Please sign in to vote');
			return;
		}

		try {
			const response = await fetch(`/api/comments/${commentId}/vote`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ voteType }),
			});

			if (response.ok) {
				fetchComments();
			}
		} catch (error) {
			console.error('Failed to vote:', error);
		}
	};

	return (
		<div className={cn('w-full max-w-4xl mx-auto space-y-6', className)}>
			<Card className="rounded-[2.5rem] border-border/50 shadow-tiimo overflow-hidden">
				<CardHeader className="border-b border-border/50 bg-muted/20 px-8 py-6">
					<CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight">
						<HugeiconsIcon icon={Chat01Icon} className="h-6 w-6 text-primary" />
						{title}
						<span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg ml-2">
							{comments.length}
						</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="p-8 space-y-8">
					{/* New Comment Input */}
					{session?.user ? (
						<div className="flex gap-5">
							<Avatar className="h-12 w-12 border-2 border-primary/10">
								<AvatarImage src={session.user.image ?? undefined} />
								<AvatarFallback className="bg-primary/5 text-primary font-black">
									{session.user.name?.[0] ?? 'U'}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 space-y-3">
								<Textarea
									placeholder="Share your thoughts or ask a question..."
									value={newComment}
									onChange={(e) => setNewComment(e.target.value)}
									className="min-h-[100px] rounded-[1.5rem] border-border/50 focus:ring-primary/20 transition-all resize-none p-4"
								/>
								<div className="flex justify-end">
									<Button
										onClick={handleSubmitComment}
										disabled={!newComment.trim() || isLoading}
										className="rounded-full px-8 font-black uppercase text-xs tracking-widest h-11"
									>
										{isLoading ? 'Posting...' : 'Post Comment'}
									</Button>
								</div>
							</div>
						</div>
					) : (
						<div className="text-center py-6 bg-muted/30 rounded-[2rem] border border-dashed border-border/50">
							<p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
								Please sign in to join the discussion
							</p>
						</div>
					)}

					{/* Comments List */}
					<div className="space-y-6">
						<AnimatePresence mode="popLayout">
							{isFetching ? (
								<div className="space-y-4">
									{[1, 2].map((i) => (
										<div key={i} className="h-32 bg-muted/50 animate-pulse rounded-[2rem]" />
									))}
								</div>
							) : comments.length === 0 ? (
								<m.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="text-center py-12"
								>
									<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
										<HugeiconsIcon icon={Chat01Icon} className="h-8 w-8" />
									</div>
									<p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
										No comments yet. Be the first to share!
									</p>
								</m.div>
							) : (
								comments.map((comment) => (
									<CommentItem
										key={comment.id}
										comment={comment}
										currentUserId={session?.user?.id}
										onVote={handleVote}
										onReply={(id) => setReplyingTo(id)}
										isReplying={replyingTo === comment.id}
										replyContent={replyContent}
										setReplyContent={setReplyContent}
										onCancelReply={() => setReplyingTo(null)}
										onSubmitReply={() => handleReply(comment.id)}
									/>
								))
							)}
						</AnimatePresence>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

interface CommentItemProps {
	comment: Comment;
	currentUserId?: string;
	onVote: (id: string, type: 'up' | 'down') => void;
	onReply: (id: string) => void;
	isReplying: boolean;
	replyContent: string;
	setReplyContent: (val: string) => void;
	onCancelReply: () => void;
	onSubmitReply: () => void;
	isReply?: boolean;
}

function CommentItem({
	comment,
	currentUserId,
	onVote,
	onReply,
	isReplying,
	replyContent,
	setReplyContent,
	onCancelReply,
	onSubmitReply,
	isReply = false,
}: CommentItemProps) {
	return (
		<m.div
			layout
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className={cn('group', !isReply && 'pb-6 border-b border-border/30 last:border-0')}
		>
			<div className="flex gap-4">
				<Avatar className={cn(isReply ? 'h-8 w-8' : 'h-10 w-10', 'border-2 border-primary/5')}>
					<AvatarImage src={comment.userImage ?? undefined} />
					<AvatarFallback className="bg-secondary text-secondary-foreground text-[10px] font-black uppercase">
						{comment.userName?.[0] ?? 'U'}
					</AvatarFallback>
				</Avatar>
				<div className="flex-1 space-y-2">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<span className="font-black text-sm uppercase tracking-tight">
								{comment.userName ?? 'Anonymous'}
							</span>
							<span className="text-[10px] font-bold text-muted-foreground uppercase">
								{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Just now'}
							</span>
							{comment.isEdited && (
								<span className="text-[10px] italic text-muted-foreground">(edited)</span>
							)}
						</div>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
								>
									<HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="end"
								className="rounded-2xl border-border/50 shadow-tiimo"
							>
								<DropdownMenuItem className="gap-2 rounded-xl focus:bg-primary/5 focus:text-primary">
									<HugeiconsIcon icon={Flag} className="h-4 w-4" />
									<span className="font-bold uppercase text-[10px]">Report</span>
								</DropdownMenuItem>
								{currentUserId === comment.userId && (
									<>
										<DropdownMenuItem className="gap-2 rounded-xl focus:bg-primary/5 focus:text-primary">
											<HugeiconsIcon icon={Edit01Icon} className="h-4 w-4" />
											<span className="font-bold uppercase text-[10px]">Edit</span>
										</DropdownMenuItem>
										<DropdownMenuItem className="gap-2 rounded-xl focus:bg-destructive/5 focus:text-destructive">
											<HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
											<span className="font-bold uppercase text-[10px]">Delete</span>
										</DropdownMenuItem>
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					<p className="text-sm font-medium leading-relaxed opacity-90">{comment.content}</p>

					<div className="flex items-center gap-4 pt-1">
						<div className="flex items-center bg-muted/50 rounded-full px-2 py-1">
							<button
								type="button"
								onClick={() => onVote(comment.id, 'up')}
								className="p-1.5 hover:text-primary transition-colors"
							>
								<HugeiconsIcon icon={ThumbsUpIcon} className="h-3.5 w-3.5" />
							</button>
							<span className="text-[10px] font-black min-w-[1.5rem] text-center">
								{comment.upvotes - comment.downvotes}
							</span>
							<button
								type="button"
								onClick={() => onVote(comment.id, 'down')}
								className="p-1.5 hover:text-destructive transition-colors"
							>
								<HugeiconsIcon icon={ThumbsDownIcon} className="h-3.5 w-3.5" />
							</button>
						</div>

						{!isReply && (
							<button
								type="button"
								onClick={() => onReply(comment.id)}
								className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
							>
								<HugeiconsIcon icon={ArrowLeft02Icon} className="h-3 w-3" />
								Reply
							</button>
						)}
					</div>

					{/* Reply Input */}
					{isReplying && (
						<m.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							className="mt-4 space-y-3 pl-4 border-l-2 border-primary/20"
						>
							<Textarea
								placeholder="Write a reply..."
								value={replyContent}
								onChange={(e) => setReplyContent(e.target.value)}
								className="min-h-[80px] rounded-[1.5rem] border-border/50 focus:ring-primary/20 transition-all resize-none text-sm p-4"
							/>
							<div className="flex justify-end gap-2">
								<Button
									size="sm"
									variant="ghost"
									onClick={onCancelReply}
									className="rounded-full font-black uppercase text-[10px]"
								>
									Cancel
								</Button>
								<Button
									size="sm"
									onClick={onSubmitReply}
									className="rounded-full px-6 font-black uppercase text-[10px] h-9"
								>
									Post Reply
								</Button>
							</div>
						</m.div>
					)}

					{/* Nested Replies */}
					{comment.replies && comment.replies.length > 0 && (
						<div className="mt-6 space-y-6 pl-6 border-l border-border/30">
							{comment.replies.map((reply) => (
								<CommentItem
									key={reply.id}
									comment={reply}
									currentUserId={currentUserId}
									onVote={onVote}
									onReply={onReply}
									isReplying={false}
									replyContent=""
									setReplyContent={() => {}}
									onCancelReply={() => {}}
									onSubmitReply={() => {}}
									isReply
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</m.div>
	);
}
