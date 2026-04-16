'use client';

import { Chat01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { CommentItem } from '@/components/Comments/CommentItem';
import type { Comment } from '@/components/Comments/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/lib/auth-client';

function CommentsContent() {
	const searchParams = useSearchParams();
	const resourceType = searchParams.get('resourceType') || 'post';
	const resourceId = searchParams.get('resourceId') || undefined;
	const { data: session } = useSession();

	const [comments, setComments] = useState<Comment[]>([]);
	const [isLoadingComments, setIsLoadingComments] = useState(true);
	const [newComment, setNewComment] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [replyingTo, setReplyingTo] = useState<string | null>(null);
	const [replyContent, setReplyContent] = useState('');

	// Fetch existing comments on mount
	useEffect(() => {
		if (!resourceId) return;
		setIsLoadingComments(true);
		fetch(`/api/comments?resourceType=${resourceType}&resourceId=${resourceId}`)
			.then((r) => r.json())
			.then((res) => {
				if (res.success && Array.isArray(res.data)) {
					setComments(res.data);
				}
			})
			.catch(() => {
				// Silently fail — empty state is shown
			})
			.finally(() => setIsLoadingComments(false));
	}, [resourceId, resourceType]);

	if (!resourceId) {
		return (
			<div className="min-h-screen bg-background p-4 md:p-8">
				<Card className="w-full max-w-2xl">
					<CardContent className="pt-6">
						<p className="text-muted-foreground">
							No resource selected. Please provide a valid resourceId.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}
	const user = session?.user;

	const handleSubmitComment = async () => {
		if (!newComment.trim() || !user) return;

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
				const comment = await response.json();
				setComments([comment, ...comments]);
				setNewComment('');
			}
		} catch (error) {
			console.debug('Failed to post comment:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleVote = async (commentId: string, voteType: 'up' | 'down') => {
		if (!user) return;

		try {
			await fetch(`/api/comments/${commentId}/vote`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ voteType }),
			});
		} catch (error) {
			console.debug('Failed to vote:', error);
		}
	};

	const handleFlag = async (commentId: string, reason: string) => {
		if (!user) return;

		try {
			await fetch(`/api/comments/${commentId}/flag`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ reason }),
			});
		} catch (error) {
			console.debug('Failed to flag comment:', error);
		}
	};

	const handleReply = async (parentId: string) => {
		if (!replyContent.trim() || !user) return;

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
				const reply = await response.json();
				setComments(
					comments.map((c) =>
						c.id === parentId ? { ...c, replies: [...(c.replies || []), reply] } : c
					)
				);
				setReplyContent('');
				setReplyingTo(null);
			}
		} catch (error) {
			console.debug('Failed to post reply:', error);
		}
	};

	return (
		<div className="container mx-auto py-8 max-w-4xl">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<HugeiconsIcon icon={Chat01Icon} className="h-5 w-5" />
						Discussion
						<span className="text-sm font-normal text-muted-foreground">
							({comments.length} comments)
						</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{user ? (
						<div className="flex gap-4">
							<Avatar>
								<AvatarImage src={user.image ?? undefined} />
								<AvatarFallback>{user.name?.[0] ?? 'U'}</AvatarFallback>
							</Avatar>
							<div className="flex-1 space-y-2">
								<Textarea
									placeholder="Share your thoughts or ask a question..."
									value={newComment}
									onChange={(e) => setNewComment(e.target.value)}
									className="min-h-25"
								/>
								<div className="flex justify-end">
									<Button onClick={handleSubmitComment} disabled={!newComment.trim() || isLoading}>
										{isLoading ? 'Posting...' : 'Post Comment'}
									</Button>
								</div>
							</div>
						</div>
					) : (
						<div className="text-center py-4 text-muted-foreground">
							<p>Please Sign in to Join the Discussion</p>
						</div>
					)}

					<div className="space-y-4">
						{comments.map((comment) => (
							<CommentItem
								key={comment.id}
								comment={comment}
								currentUserId={user?.id}
								onVote={handleVote}
								onFlag={handleFlag}
								onReply={(parentId) => setReplyingTo(parentId)}
								replyingTo={replyingTo}
								replyContent={replyContent}
								setReplyContent={setReplyContent}
								handleReply={handleReply}
								setReplyingTo={setReplyingTo}
							/>
						))}
					</div>

					{isLoadingComments ? (
						<div className="text-center py-8 text-muted-foreground">
							<p>Loading comments...</p>
						</div>
					) : comments.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<HugeiconsIcon icon={Chat01Icon} className="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p>No comments yet. Be the first to share your thoughts!</p>
						</div>
					) : null}
				</CardContent>
			</Card>
		</div>
	);
}

export default function CommentsPage() {
	return (
		<Suspense
			fallback={<div className="flex h-96 items-center justify-center">Loading comments...</div>}
		>
			<CommentsContent />
		</Suspense>
	);
}
