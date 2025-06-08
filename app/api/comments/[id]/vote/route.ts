import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * POST handler for voting on a comment
 * Handles upvoting, downvoting, and removing votes
 * Updates comment vote counts atomically
 * 
 * @param request - The incoming request object with vote value
 * @param params - Route parameters including the comment id
 * @returns NextResponse with updated vote data or error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is suspended
    if (session.user.suspendedUntil && new Date(session.user.suspendedUntil) > new Date()) {
      return NextResponse.json(
        { error: "Your account is currently suspended" },
        { status: 403 }
      );
    }

    const commentId = params.id;
    const { value } = await request.json();

    // Validate vote value
    if (typeof value !== "number" || ![1, -1, 0].includes(value)) {
      return NextResponse.json(
        { error: "Vote value must be 1 (upvote), -1 (downvote), or 0 (remove vote)" },
        { status: 400 }
      );
    }

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Prevent users from voting on their own comments
    if (comment.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot vote on your own comment" },
        { status: 403 }
      );
    }

    // Check if user has already voted on this comment
    const existingVote = await prisma.commentVote.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    });

    // Use a transaction to ensure vote counts are updated atomically
    const result = await prisma.$transaction(async (tx) => {
      // If removing vote (value = 0)
      if (value === 0) {
        // Only proceed if there's an existing vote to remove
        if (!existingVote) {
          return { success: false, message: "No vote to remove" };
        }

        // Update comment vote counts based on the previous vote
        const updateData: Record<string, any> = {};
        if (existingVote.value === 1) {
          updateData.upvotes = { decrement: 1 };
        } else if (existingVote.value === -1) {
          updateData.downvotes = { decrement: 1 };
        }

        // Delete the vote and update the comment
        await tx.commentVote.delete({
          where: {
            userId_commentId: {
              userId: session.user.id,
              commentId,
            },
          },
        });

        await tx.comment.update({
          where: { id: commentId },
          data: updateData,
        });

        return { success: true, value: 0, message: "Vote removed" };
      }
      
      // If creating a new vote
      if (!existingVote) {
        // Create new vote and update comment vote counts
        await tx.commentVote.create({
          data: {
            userId: session.user.id,
            commentId,
            value,
          },
        });

        await tx.comment.update({
          where: { id: commentId },
          data: value === 1 
            ? { upvotes: { increment: 1 } }
            : { downvotes: { increment: 1 } },
        });

        return { 
          success: true, 
          value, 
          message: value === 1 ? "Comment upvoted" : "Comment downvoted" 
        };
      }
      
      // If changing an existing vote
      if (existingVote.value !== value) {
        // Update the vote and adjust comment vote counts accordingly
        await tx.commentVote.update({
          where: {
            userId_commentId: {
              userId: session.user.id,
              commentId,
            },
          },
          data: { value },
        });

        // Handle the different vote change scenarios
        if (existingVote.value === 1 && value === -1) {
          // Changed from upvote to downvote
          await tx.comment.update({
            where: { id: commentId },
            data: {
              upvotes: { decrement: 1 },
              downvotes: { increment: 1 },
            },
          });
        } else if (existingVote.value === -1 && value === 1) {
          // Changed from downvote to upvote
          await tx.comment.update({
            where: { id: commentId },
            data: {
              downvotes: { decrement: 1 },
              upvotes: { increment: 1 },
            },
          });
        }

        return { 
          success: true, 
          value, 
          message: value === 1 ? "Changed to upvote" : "Changed to downvote" 
        };
      }

      // Vote value is the same, no change needed
      return { 
        success: true, 
        value: existingVote.value, 
        message: "Vote already exists" 
      };
    });

    // Get updated comment vote counts
    const updatedComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        upvotes: true,
        downvotes: true,
      },
    });

    return NextResponse.json({
      ...result,
      upvotes: updatedComment?.upvotes || 0,
      downvotes: updatedComment?.downvotes || 0,
    });
  } catch (error) {
    console.error("Error processing comment vote:", error);
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 }
    );
  }
}
