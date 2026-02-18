"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, ThumbsUp, ThumbsDown, Flag, Reply } from "lucide-react";
import { cn } from "@/lib/utils";

interface Comment {
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

interface CommentsSectionProps {
  resourceType: string;
  resourceId: string;
}

export default function CommentsPage({ resourceType, resourceId }: CommentsSectionProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          resourceType,
          resourceId,
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (commentId: string, voteType: "up" | "down") => {
    if (!user) return;
    
    try {
      await fetch(`/api/comments/${commentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  const handleFlag = async (commentId: string, reason: string) => {
    if (!user) return;
    
    try {
      await fetch(`/api/comments/${commentId}/flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
    } catch (error) {
      console.error("Failed to flag comment:", error);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim() || !user) return;
    
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent,
          resourceType,
          resourceId,
          parentId,
        }),
      });

      if (response.ok) {
        const reply = await response.json();
        setComments(comments.map(c => 
          c.id === parentId 
            ? { ...c, replies: [...(c.replies || []), reply] }
            : c
        ));
        setReplyContent("");
        setReplyingTo(null);
      }
    } catch (error) {
      console.error("Failed to post reply:", error);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Discussion
            <span className="text-sm font-normal text-muted-foreground">
              ({comments.length} comments)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Comment Input */}
          {user ? (
            <div className="flex gap-4">
              <Avatar>
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback>{user.name?.[0] ?? "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Share your thoughts or ask a question..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isLoading}
                  >
                    {isLoading ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p>Please sign in to join the discussion</p>
            </div>
          )}

          {/* Comments List */}
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

          {comments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onVote: (commentId: string, voteType: "up" | "down") => void;
  onFlag: (commentId: string, reason: string) => void;
  onReply: (parentId: string) => void;
  replyingTo: string | null;
  replyContent: string;
  setReplyContent: (content: string) => void;
  handleReply: (parentId: string) => void;
  setReplyingTo: (id: string | null) => void;
}

function CommentItem({
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
    <div className={cn("border rounded-lg p-4", comment.isFlagged && "opacity-60")}>
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
                onClick={() => onVote(comment.id, "up")}
                className="p-1 hover:bg-accent rounded"
              >
                <ThumbsUp className="h-4 w-4" />
              </button>
              <span className="text-xs">{comment.upvotes}</span>
              <button
                onClick={() => onVote(comment.id, "down")}
                className="p-1 hover:bg-accent rounded"
              >
                <ThumbsDown className="h-4 w-4" />
              </button>
              <span className="text-xs">{comment.downvotes}</span>
            </div>
            
            <button
              onClick={() => onReply(comment.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Reply className="h-3 w-3" />
              Reply
            </button>
            
            <button
              onClick={() => setShowFlagDialog(!showFlagDialog)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Flag className="h-3 w-3" />
              Report
            </button>
          </div>

          {/* Flag Dialog */}
          {showFlagDialog && (
            <div className="mt-2 p-2 bg-muted rounded text-xs">
              <p className="mb-2">Why are you reporting this?</p>
              <div className="flex gap-2">
                {["Spam", "Inappropriate", "Incorrect", "Other"].map((reason) => (
                  <button
                    key={reason}
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

          {/* Reply Input */}
          {replyingTo === comment.id && (
            <div className="mt-3 pl-4 border-l-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => handleReply(comment.id)}>
                  Reply
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
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
