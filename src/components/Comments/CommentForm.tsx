'use client';

import { Chat01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentFormProps {
	userImage?: string | null;
	userName?: string | null;
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	isLoading: boolean;
}

export function CommentForm({
	userImage,
	userName,
	value,
	onChange,
	onSubmit,
	isLoading,
}: CommentFormProps) {
	return (
		<div className="flex gap-5">
			<Avatar className="h-12 w-12 border-2 border-primary/10">
				<AvatarImage src={userImage ?? undefined} />
				<AvatarFallback className="bg-primary/5 text-primary font-black">
					{userName?.[0] ?? 'U'}
				</AvatarFallback>
			</Avatar>
			<div className="flex-1 space-y-3">
				<Textarea
					placeholder="Share your thoughts or ask a question..."
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="min-h-[100px] rounded-[1.5rem] border-border/50 focus:ring-primary/20 transition-all resize-none p-4"
				/>
				<div className="flex justify-end">
					<Button
						onClick={onSubmit}
						disabled={!value.trim() || isLoading}
						className="rounded-full px-8 font-black uppercase text-xs tracking-widest h-11"
					>
						{isLoading ? 'Posting...' : 'Post Comment'}
					</Button>
				</div>
			</div>
		</div>
	);
}

export function CommentSignInPrompt() {
	return (
		<div className="text-center py-6 bg-muted/30 rounded-[2rem] border border-dashed border-border/50">
			<p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
				Please sign in to join the discussion
			</p>
		</div>
	);
}

export function CommentEmptyState() {
	return (
		<div className="text-center py-12">
			<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
				<HugeiconsIcon icon={Chat01Icon} className="h-8 w-8" />
			</div>
			<p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
				No comments yet. Be the first to share!
			</p>
		</div>
	);
}

export function CommentLoadingSkeleton() {
	return (
		<div className="space-y-4">
			{[1, 2].map((i) => (
				<div key={`skeleton-${i}`} className="h-32 bg-muted/50 animate-pulse rounded-[2rem]" />
			))}
		</div>
	);
}
