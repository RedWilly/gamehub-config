/**
 * VoteButtons Component
 * Provides UI for upvoting and downvoting configurations
 */

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

/**
 * VoteButtons props interface
 */
interface VoteButtonsProps {
  configId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote?: number | null;
  className?: string;
}

/**
 * VoteButtons component for upvoting and downvoting configurations
 * 
 * @param props - Component props
 * @returns React component
 */
export function VoteButtons({
  configId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote = null,
  className = "",
}: VoteButtonsProps): JSX.Element {
  const [upvotes, setUpvotes] = useState<number>(initialUpvotes);
  const [downvotes, setDownvotes] = useState<number>(initialDownvotes);
  const [userVote, setUserVote] = useState<number | null>(initialUserVote);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  /**
   * Handle vote action
   * 
   * @param value - Vote value (1 for upvote, -1 for downvote, 0 for removing vote)
   */
  const handleVote = async (value: number): Promise<void> => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to vote");
      return;
    }
    
    // Prevent multiple simultaneous vote requests
    if (isVoting) return;
    
    setIsVoting(true);
    
    try {
      // Optimistically update UI
      const previousVote = userVote;
      
      // If clicking the same button that's already active, remove the vote
      const newVoteValue = previousVote === value ? 0 : value;
      
      // Update local state optimistically
      if (previousVote === 1 && newVoteValue !== 1) {
        setUpvotes(prev => prev - 1);
      } else if (previousVote === -1 && newVoteValue !== -1) {
        setDownvotes(prev => prev - 1);
      }
      
      if (newVoteValue === 1) {
        setUpvotes(prev => prev + 1);
      } else if (newVoteValue === -1) {
        setDownvotes(prev => prev + 1);
      }
      
      setUserVote(newVoteValue === 0 ? null : newVoteValue);
      
      // Send vote to server
      const response = await fetch(`/api/configs/${configId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: newVoteValue }),
      });
      
      if (!response.ok) {
        // Revert optimistic update if request fails
        setUserVote(previousVote);
        
        if (previousVote === 1) {
          setUpvotes(initialUpvotes);
        } else if (previousVote === -1) {
          setDownvotes(initialDownvotes);
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process vote");
      }
      
      // Get updated vote counts from server
      const data = await response.json();
      
      // Update with actual server values
      setUpvotes(data.config.upvotes);
      setDownvotes(data.config.downvotes);
      
      // Show success message
      if (newVoteValue === 1) {
        toast.success("Upvoted configuration");
      } else if (newVoteValue === -1) {
        toast.success("Downvoted configuration");
      } else {
        toast.success("Vote removed");
      }
    } catch (error: any) {
      console.error("Error voting:", error);
      toast.error(error.message || "Failed to process vote");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-1 ${userVote === 1 ? "text-green-500" : ""}`}
          onClick={() => handleVote(1)}
          disabled={isVoting || !isAuthenticated}
          aria-label="Upvote"
          title={isAuthenticated ? "Upvote this configuration" : "Login to vote"}
        >
          <ThumbsUp className={`h-5 w-5 ${userVote === 1 ? "fill-green-500" : ""}`} />
          <span>{upvotes}</span>
        </Button>
      </div>
      
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-1 ${userVote === -1 ? "text-red-500" : ""}`}
          onClick={() => handleVote(-1)}
          disabled={isVoting || !isAuthenticated}
          aria-label="Downvote"
          title={isAuthenticated ? "Downvote this configuration" : "Login to vote"}
        >
          <ThumbsDown className={`h-5 w-5 ${userVote === -1 ? "fill-red-500" : ""}`} />
          <span>{downvotes}</span>
        </Button>
      </div>
    </div>
  );
}
