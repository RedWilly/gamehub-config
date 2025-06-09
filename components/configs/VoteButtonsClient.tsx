/**
 * Client-side vote buttons component
 * Handles interactive voting functionality
 */

"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VoteButtonsClientProps {
  configId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote: number | null;
}

/**
 * Client component that handles vote button interactions
 * Uses local state to provide immediate feedback while API calls happen
 */
export function VoteButtonsClient({
  configId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
}: VoteButtonsClientProps) {
  const [upvotes, setUpvotes] = useState<number>(initialUpvotes);
  const [downvotes, setDownvotes] = useState<number>(initialDownvotes);
  const [userVote, setUserVote] = useState<number | null>(initialUserVote);
  const [isVoting, setIsVoting] = useState<boolean>(false);

  /**
   * Handle vote submission
   * @param value Vote value (1 for upvote, -1 for downvote)
   */
  const handleVote = async (value: number): Promise<void> => {
    if (isVoting) return;
    
    setIsVoting(true);
    
    try {
      // Optimistic UI update
      if (userVote === value) {
        // Remove vote if clicking the same button again
        if (value === 1) setUpvotes(prev => prev - 1);
        else setDownvotes(prev => prev - 1);
        setUserVote(null);
      } else {
        // If changing vote
        if (userVote === 1) setUpvotes(prev => prev - 1);
        if (userVote === -1) setDownvotes(prev => prev - 1);
        
        // Add new vote
        if (value === 1) setUpvotes(prev => prev + 1);
        else setDownvotes(prev => prev + 1);
        
        setUserVote(value);
      }
      
      // Submit vote to API
      const response = await fetch(`/api/configs/${configId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: userVote === value ? 0 : value }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit vote");
      }
      
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast.error("Failed to submit vote. Please try again.");
      
      // Revert optimistic update on error
      setUpvotes(initialUpvotes);
      setDownvotes(initialDownvotes);
      setUserVote(initialUserVote);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={userVote === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => handleVote(1)}
        disabled={isVoting}
      >
        <ThumbsUp className="h-4 w-4 mr-2" />
        <span>{upvotes}</span>
      </Button>
      <Button
        variant={userVote === -1 ? "default" : "outline"}
        size="sm"
        onClick={() => handleVote(-1)}
        disabled={isVoting}
      >
        <ThumbsDown className="h-4 w-4 mr-2" />
        <span>{downvotes}</span>
      </Button>
    </div>
  );
}
