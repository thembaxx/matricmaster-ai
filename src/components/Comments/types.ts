export interface Comment {
	id: string;
	userId: string;
	userName: string;
	userAvatar?: string;
	content: string;
	createdAt: string;
	upvotes: number;
	downvotes: number;
	replies: Comment[];
	isFlagged?: boolean;
}

export interface CommentItemProps {
	comment: Comment;
	currentUserId?: string;
	onVote: (commentId: string, voteType: 'up' | 'down') => void;
	onFlag: (commentId: string, reason: string) => void;
	onReply: (parentId: string) => void;
	replyingTo: string | null;
	replyContent: string;
	setReplyContent: (content: string) => void;
	handleReply: (parentId: string) => void;
	setReplyingTo: (id: string | null) => void;
}

export interface CommentAnimated {
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
	replies?: CommentAnimated[];
}

export interface CommentItemAnimatedProps {
	comment: CommentAnimated;
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

export interface CommentsProps {
	resourceType: string;
	resourceId: string;
	title?: string;
	className?: string;
}
