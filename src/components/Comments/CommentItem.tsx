'use client';

import { ArrowLeft02Icon, Flag, ThumbsDownIcon, ThumbsUpIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { CommentItemProps } from './types';

export function CommentItem({
	comment,
	currentUserId,
	onVote,
	onFlag,
	onReply,
	replyingTo,
	replyContent,
	setReplyContent,
	handleReply,
	setReplyingTo,
}: CommentItemProps) {
	const [showFlagDialog, setShowFlagDialog] = useState(false);

	return (
		<div className={cn('border rounded-lg p-4', comment.isFlagged && 'opacity-60')}>
			<div className="flex gap-3">
				<Avatar className="h-8 w-8">
					<AvatarImage src={comment.userAvatar} />
					<AvatarFallback>{comment.userName[0]}</AvatarFallback>
				</Avatar>
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-1">
						<span className="font-medium">{comment.userName}</span>
						<span className="text-xs text-muted-foreground">
							{new Date(comment.createdAt).toLocaleDateString()}
						</span>
						{comment.isFlagged && (
							<span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
								Flagged
							</span>
						)}
					</div>

					<p className="text-sm mb-3">{comment.content}</p>

					<div className="flex items-center gap-4">
						<div className="flex items-center gap-1">
							<button
								type="button"
								aria-label="Thumbs up"
								onClick={() => onVote(comment.id, 'up')}
								className="p-1 hover:bg-accent rounded"
							>
								<HugeiconsIcon icon={ThumbsUpIcon} className="h-4 w-4" />
							</button>
							<span className="text-xs">{comment.upvotes}</span>
							<button
								type="button"
								aria-label="Thumbs down"
								onClick={() => onVote(comment.id, 'down')}
								className="p-1 hover:bg-accent rounded"
							>
								<HugeiconsIcon icon={ThumbsDownIcon} className="h-4 w-4" />
							</button>
							<span className="text-xs">{comment.downvotes}</span>
						</div>

						<button
							type="button"
							onClick={() => onReply(comment.id)}
							className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
						>
							<HugeiconsIcon icon={ArrowLeft02Icon} className="h-3 w-3" />
							ArrowBendUpLeft
						</button>

						<button
							type="button"
							onClick={() => setShowFlagDialog(!showFlagDialog)}
							className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
						>
							<HugeiconsIcon icon={Flag} className="h-3 w-3" />
							Report
						</button>
					</div>

					{showFlagDialog && (
						<div className="mt-2 p-2 bg-muted rounded text-xs">
							<p className="mb-2">Why are you reporting this?</p>
							<div className="flex gap-2">
								{['Spam', 'Inappropriate', 'Incorrect', 'Other'].map((reason) => (
									<button
										key={reason}
										type="button"
										onClick={() => {
											onFlag(comment.id, reason);
											setShowFlagDialog(false);
										}}
										className="px-2 py-1 bg-background rounded hover:bg-accent"
									>
										{reason}
									</button>
								))}
							</div>
						</div>
					)}

					{replyingTo === comment.id && (
						<div className="mt-3 pl-4 border-l-2">
							<Textarea
								placeholder="Write a reply..."
								value={replyContent}
								onChange={(e) => setReplyContent(e.target.value)}
								className="min-h-15 text-sm"
							/>
							<div className="flex gap-2 mt-2">
								<Button size="sm" onClick={() => handleReply(comment.id)}>
									ArrowBendUpLeft
								</Button>
								<Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
									Cancel
								</Button>
							</div>
						</div>
					)}

					{comment.replies && comment.replies.length > 0 && (
						<div className="mt-4 space-y-3 pl-4 border-l-2">
							{comment.replies.map((reply) => (
								<CommentItem
									key={reply.id}
									comment={reply}
									currentUserId={currentUserId}
									onVote={onVote}
									onFlag={onFlag}
									onReply={onReply}
									replyingTo={replyingTo}
									replyContent={replyContent}
									setReplyContent={setReplyContent}
									handleReply={handleReply}
									setReplyingTo={setReplyingTo}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
