/**
 * Server-side vote buttons component
 * Renders vote buttons with initial state from server
 * Client-side interactivity is handled by a client wrapper
 */

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoteButtonsClient } from "./VoteButtonsClient";

interface VoteButtonsServerProps {
  configId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote: number | null;
  userId: string | undefined;
}

/**
 * Server component that renders vote buttons with initial state
 * Uses a client wrapper for interactivity
 */
export function VoteButtonsServer({
  configId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
  userId
}: VoteButtonsServerProps) {
  // If user is not logged in, show disabled buttons
  if (!userId) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled>
          <ThumbsUp className="h-4 w-4 mr-2" />
          <span>{initialUpvotes}</span>
        </Button>
        <Button variant="outline" size="sm" disabled>
          <ThumbsDown className="h-4 w-4 mr-2" />
          <span>{initialDownvotes}</span>
        </Button>
        <span className="text-xs text-muted-foreground ml-2">Login to vote</span>
      </div>
    );
  }

  // If user is logged in, use client component for interactivity
  return (
    <VoteButtonsClient
      configId={configId}
      initialUpvotes={initialUpvotes}
      initialDownvotes={initialDownvotes}
      initialUserVote={initialUserVote}
    />
  );
}
