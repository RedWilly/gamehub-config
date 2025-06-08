"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { CommentForm } from "./comment-form";
import { CommentItem, CommentType } from "./comment-item";

/**
 * Interface for pagination data
 */
interface PaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

/**
 * Props for the CommentList component
 */
interface CommentListProps {
  configId: string;
}

/**
 * CommentList component for displaying all comments for a config with pagination
 * 
 * @param configId - The ID of the config to show comments for
 */
export function CommentList({ configId }: CommentListProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, number | null>>({});
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  /**
   * Fetches comments for the config
   */
  const fetchComments = async (page = 1) => {
    try {
      const isInitialLoad = page === 1;
      
      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const response = await fetch(
        `/api/configs/${configId}/comments?page=${page}&limit=${pagination.limit}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      
      const data = await response.json();
      
      if (isInitialLoad) {
        setComments(data.comments);
      } else {
        setComments((prev) => [...prev, ...data.comments]);
      }
      
      setPagination(data.pagination);
      setUserVotes(data.userVotes || {});
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };
  
  /**
   * Handles adding a new comment to the list
   */
  const handleCommentAdded = (newComment: CommentType) => {
    setComments((prev) => [newComment, ...prev]);
    setPagination((prev) => ({
      ...prev,
      total: prev.total + 1,
      pages: Math.ceil((prev.total + 1) / prev.limit),
    }));
  };
  
  /**
   * Handles deleting a comment from the list
   */
  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    setPagination((prev) => ({
      ...prev,
      total: prev.total - 1,
      pages: Math.ceil((prev.total - 1) / prev.limit),
    }));
  };
  
  /**
   * Handles voting on a comment
   */
  const handleVote = (commentId: string, value: number, previousValue?: number | null) => {
    // Update the userVotes state
    setUserVotes((prev) => ({
      ...prev,
      [commentId]: value === 0 ? null : value,
    }));
  };
  
  /**
   * Loads more comments when clicking the "Load More" button
   */
  const loadMoreComments = () => {
    if (pagination.page < pagination.pages) {
      fetchComments(pagination.page + 1);
    }
  };
  
  // Fetch comments on initial load
  useEffect(() => {
    fetchComments();
  }, [configId]);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Comments</h2>
      
      <CommentForm configId={configId} onCommentAdded={handleCommentAdded} />
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                userVote={userVotes[comment.id] || null}
                onDelete={handleCommentDeleted}
                onVote={handleVote}
              />
            ))}
            
            {pagination.page < pagination.pages && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={loadMoreComments}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    `Load More (${comments.length}/${pagination.total})`
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
