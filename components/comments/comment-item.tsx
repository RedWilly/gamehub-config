"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, ThumbsDown, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Type definition for a comment
 */
export interface CommentType {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  user: {
    id: string;
    name: string;
    image: string | null;
    username?: string;
  };
}

/**
 * Props for the CommentItem component
 */
interface CommentItemProps {
  comment: CommentType;
  userVote?: number | null;
  onDelete?: (commentId: string) => void;
  onVote?: (commentId: string, value: number, previousValue?: number | null) => void;
}

/**
 * CommentItem component for displaying an individual comment with voting functionality
 */
export function CommentItem({ 
  comment, 
  userVote = null, 
  onDelete,
  onVote 
}: CommentItemProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentVote, setCurrentVote] = useState<number | null>(userVote);
  const [voteCount, setVoteCount] = useState({
    upvotes: comment.upvotes,
    downvotes: comment.downvotes
  });
  
  /**
   * Gets the initials from a user's name
   */
  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'U';
  };
  
  /**
   * Formats the comment date for display
   */
  const formatCommentDate = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };
  
  /**
   * Handles voting on the comment
   */
  const handleVote = async (value: number) => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote on comments.",
        variant: "destructive",
      });
      return;
    }
    
    // Prevent voting on own comment
    if (session.user.id === comment.user.id) {
      toast({
        title: "Cannot vote on own comment",
        description: "You cannot vote on your own comments.",
        variant: "destructive",
      });
      return;
    }
    
    // Optimistic update
    const previousVote = currentVote;
    let newUpvotes = voteCount.upvotes;
    let newDownvotes = voteCount.downvotes;
    
    // If clicking the same vote button that's already active, remove the vote
    const newVote = currentVote === value ? 0 : value;
    
    // Update vote counts optimistically
    if (previousVote === 1 && newVote !== 1) newUpvotes--;
    if (previousVote === -1 && newVote !== -1) newDownvotes--;
    if (newVote === 1 && previousVote !== 1) newUpvotes++;
    if (newVote === -1 && previousVote !== -1) newDownvotes++;
    
    setCurrentVote(newVote);
    setVoteCount({ upvotes: newUpvotes, downvotes: newDownvotes });
    
    // Call the onVote callback for parent component updates
    if (onVote) {
      onVote(comment.id, newVote, previousVote);
    }
    
    try {
      const response = await fetch(`/api/comments/${comment.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: newVote }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to vote on comment");
      }
      
      // Update with actual server response
      setVoteCount({
        upvotes: data.upvotes,
        downvotes: data.downvotes
      });
    } catch (error) {
      console.error("Error voting on comment:", error);
      
      // Revert optimistic update on error
      setCurrentVote(previousVote);
      setVoteCount({
        upvotes: comment.upvotes,
        downvotes: comment.downvotes
      });
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to vote on comment",
        variant: "destructive",
      });
    }
  };
  
  /**
   * Handles deleting the comment
   */
  const handleDelete = async () => {
    if (!session?.user) return;
    
    const isAuthor = session.user.id === comment.user.id;
    const isAdminOrMod = session.user.role === "ADMIN" || session.user.role === "MODERATOR";
    
    if (!isAuthor && !isAdminOrMod) {
      toast({
        title: "Permission denied",
        description: "You can only delete your own comments.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete comment");
      }
      
      toast({
        title: "Comment deleted",
        description: "The comment has been successfully deleted.",
      });
      
      if (onDelete) {
        onDelete(comment.id);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete comment",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };
  
  const isOwnComment = session?.user?.id === comment.user.id;
  const isAdminOrMod = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
  const canDelete = isOwnComment || isAdminOrMod;
  
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.user.image || ''} alt={comment.user.name} />
            <AvatarFallback>{getUserInitials(comment.user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">
                  {comment.user.username || comment.user.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCommentDate(comment.createdAt)}
                  {comment.updatedAt !== comment.createdAt && " (edited)"}
                </p>
              </div>
              {canDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive"
                      disabled={isDeleting}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting ? "Deleting..." : "Delete"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div className="text-sm">
              {comment.content}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between py-2">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1 h-8 px-2 ${
              currentVote === 1 ? "text-primary" : ""
            }`}
            onClick={() => handleVote(1)}
            disabled={isOwnComment}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{voteCount.upvotes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1 h-8 px-2 ${
              currentVote === -1 ? "text-destructive" : ""
            }`}
            onClick={() => handleVote(-1)}
            disabled={isOwnComment}
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{voteCount.downvotes}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
