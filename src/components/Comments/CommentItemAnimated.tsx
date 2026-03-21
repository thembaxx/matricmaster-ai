'use client';

import {
	ArrowLeft02Icon,
	Delete02Icon,
	Edit01Icon,
	Flag,
	MoreHorizontalIcon,
	ThumbsDownIcon,
	ThumbsUpIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { CommentItemAnimatedProps } from './types';

export function CommentItemAnimated({
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
}: CommentItemAnimatedProps) {
	return (
		<m.div
			layout
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
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
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={() => onVote(comment.id, 'up')}
								className="p-1.5 h-auto w-auto hover:text-primary"
							>
								<HugeiconsIcon icon={ThumbsUpIcon} className="h-3.5 w-3.5" />
							</Button>
							<span className="text-[10px] font-black min-w-[1.5rem] text-center">
								{comment.upvotes - comment.downvotes}
							</span>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={() => onVote(comment.id, 'down')}
								className="p-1.5 h-auto w-auto hover:text-destructive"
							>
								<HugeiconsIcon icon={ThumbsDownIcon} className="h-3.5 w-3.5" />
							</Button>
						</div>

						{!isReply && (
							<Button
								type="button"
								variant="ghost"
								onClick={() => onReply(comment.id)}
								className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary h-auto p-0"
							>
								<HugeiconsIcon icon={ArrowLeft02Icon} className="h-3 w-3" />
								Reply
							</Button>
						)}
					</div>

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

					{comment.replies && comment.replies.length > 0 && (
						<div className="mt-6 space-y-6 pl-6 border-l border-border/30">
							{comment.replies.map((reply) => (
								<CommentItemAnimated
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
