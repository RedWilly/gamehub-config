import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * GET handler for retrieving a specific comment by ID
 * 
 * @param request - The incoming request object
 * @param params - Route parameters including the comment id
 * @returns NextResponse with comment data or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Get the vote status if user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    let userVote = null;

    if (session?.user) {
      const vote = await prisma.commentVote.findUnique({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId,
          },
        },
        select: {
          value: true,
        },
      });

      userVote = vote?.value || null;
    }

    return NextResponse.json({
      ...comment,
      userVote,
    });
  } catch (error) {
    console.error("Error fetching comment:", error);
    return NextResponse.json(
      { error: "Failed to fetch comment" },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler for updating a comment
 * Only allows the comment author to update their own comment
 * 
 * @param request - The incoming request object with updated content
 * @param params - Route parameters including the comment id
 * @returns NextResponse with the updated comment or error
 */
export async function PATCH(
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
    const { content } = await request.json();

    // Validate input
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: "Comment cannot exceed 1000 characters" },
        { status: 400 }
      );
    }

    // Check if comment exists and belongs to the user
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Only allow the comment author or admins/moderators to update the comment
    if (
      existingComment.userId !== session.user.id && 
      session.user.role !== "ADMIN" && 
      session.user.role !== "MODERATOR"
    ) {
      return NextResponse.json(
        { error: "You are not authorized to update this comment" },
        { status: 403 }
      );
    }

    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for removing a comment
 * Only allows the comment author or admins/moderators to delete a comment
 * 
 * @param request - The incoming request object
 * @param params - Route parameters including the comment id
 * @returns NextResponse with success message or error
 */
export async function DELETE(
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

    const commentId = params.id;

    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Only allow the comment author or admins/moderators to delete the comment
    if (
      existingComment.userId !== session.user.id && 
      session.user.role !== "ADMIN" && 
      session.user.role !== "MODERATOR"
    ) {
      return NextResponse.json(
        { error: "You are not authorized to delete this comment" },
        { status: 403 }
      );
    }

    // Delete the comment (will cascade delete associated votes due to Prisma schema)
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json(
      { message: "Comment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
