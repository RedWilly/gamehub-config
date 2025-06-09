/**
 * Server-side comment list component
 * Renders comments with initial state from server
 * Client-side interactivity is handled by a client wrapper
 */

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { format } from "date-fns";
import { MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentForm } from "./comment-form";
import { headers } from "next/headers";

interface CommentListServerProps {
  configId: string;
}

/**
 * Server component that renders comments with initial state
 * Uses a client wrapper for adding new comments
 */
export async function CommentListServer({ configId }: CommentListServerProps) {
  // Get current session
  const session = await auth.api.getSession({
    headers: headers()
  });
  
  // Fetch comments from database
  const comments = await prisma.comment.findMany({
    where: {
      configId,
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  
  return (
    <div className="space-y-6">
      {/* Comment form for logged in users */}
      {session?.user && (
        <CommentForm configId={configId} userId={session.user.id} />
      )}
      
      {/* Display existing comments */}
      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No comments yet</p>
          {session?.user ? (
            <p className="text-sm text-muted-foreground mt-1">
              Be the first to share your thoughts!
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to leave a comment
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={comment.user.image || ""} 
                  alt={comment.user.username || "User"} 
                />
                <AvatarFallback>
                  {(comment.user.username || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">@{comment.user.username}</p>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(comment.createdAt), "PPp")}
                  </span>
                </div>
                <p className="mt-1">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
