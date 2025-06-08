"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

/**
 * Props for the CommentForm component
 */
interface CommentFormProps {
  configId: string;
  onCommentAdded?: (comment: any) => void;
}

/**
 * CommentForm component for submitting new comments on a config
 * 
 * @param configId - The ID of the config to comment on
 * @param onCommentAdded - Optional callback when a comment is successfully added
 */
export function CommentForm({ configId, onCommentAdded }: CommentFormProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  /**
   * Handles the submission of a new comment
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment on this configuration.",
        variant: "destructive",
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Comment required",
        description: "Please enter a comment before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/configs/${configId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit comment");
      }
      
      setContent("");
      toast({
        title: "Comment submitted",
        description: "Your comment has been successfully posted.",
      });
      
      if (onCommentAdded) {
        onCommentAdded(data);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!session?.user) {
    return (
      <div className="bg-muted/50 rounded-md p-4 text-center text-muted-foreground">
        Please sign in to leave a comment.
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Share your thoughts on this configuration..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px] resize-y"
        maxLength={1000}
        disabled={isSubmitting}
      />
      <div className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          {content.length}/1000 characters
        </div>
        <Button type="submit" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Comment"
          )}
        </Button>
      </div>
    </form>
  );
}
