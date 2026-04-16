'use client';

import { Chat01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, m } from 'framer-motion';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import {
	CommentEmptyState,
	CommentForm,
	CommentLoadingSkeleton,
	CommentSignInPrompt,
} from './CommentForm';
import { CommentItemAnimated } from './CommentItemAnimated';
import type { CommentAnimated, CommentsProps } from './types';

export function Comments({
	resourceType,
	resourceId,
	title = 'Discussion',
	className,
}: CommentsProps) {
	const { data: session } = useSession();
	const [newComment, setNewComment] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [replyingTo, setReplyingTo] = useState<string | null>(null);
	const [replyContent, setReplyContent] = useState('');

	const fetchCommentsFn = useCallback(async () => {
		const response = await fetch(
			`/api/comments?resourceType=${resourceType}&resourceId=${resourceId}`
		);
		const result = await response.json();
		if (result.success) {
			const allComments = result.data as CommentAnimated[];
			const rootComments = allComments.filter((c) => !c.parentId);
			const replies = allComments.filter((c) => c.parentId);

			return rootComments.map((root) => ({
				...root,
				replies: replies.filter((r) => r.parentId === root.id).reverse(),
			}));
		}
		return [];
	}, [resourceType, resourceId]);

	const { data: comments = [], refetch: refetchComments } = useQuery({
		queryKey: ['comments', resourceType, resourceId],
		queryFn: fetchCommentsFn,
	});

	const fetchComments = useCallback(() => {
		refetchComments();
	}, [refetchComments]);

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
		} catch (_error) {
			toast.error('Failed to post reply');
		}
	};

	const handleVote = async (commentId: string, voteType: 'up' | 'down') => {
		if (!session?.user) {
			toast.error('Please Sign in to Vote');
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
			console.debug('Failed to vote:', error);
		}
	};

	return (
		<div className={cn('w-full max-w-4xl mx-auto space-y-6', className)}>
			<Card className="rounded-[2.5rem] border-border/50 shadow-tiimo overflow-hidden">
				<CardHeader className="border-b border-border/50 bg-muted/20 px-8 py-6">
					<CardTitle className="flex items-center gap-3 text-xl font-black  tracking-tight">
						<HugeiconsIcon icon={Chat01Icon} className="h-6 w-6 text-primary" />
						{title}
						<span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg ml-2">
							{comments.length}
						</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="p-8 space-y-8">
					{session?.user ? (
						<CommentForm
							userImage={session.user.image}
							userName={session.user.name}
							value={newComment}
							onChange={setNewComment}
							onSubmit={handleSubmitComment}
							isLoading={isLoading}
						/>
					) : (
						<CommentSignInPrompt />
					)}

					<div className="space-y-6">
						<AnimatePresence mode="popLayout">
							{isLoading ? (
								<CommentLoadingSkeleton />
							) : comments.length === 0 ? (
								<m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
									<CommentEmptyState />
								</m.div>
							) : (
								comments.map((comment) => (
									<CommentItemAnimated
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
