import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * GET handler for retrieving comments for a specific config
 * Returns all comments for the config with pagination support
 * 
 * @param request - The incoming request object
 * @param params - Route parameters including the config id
 * @returns NextResponse with comments data or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const configId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Validate that the config exists
    const config = await prisma.config.findUnique({
      where: { id: configId },
    });

    if (!config) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    // Get comments with pagination
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { configId },
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
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.comment.count({
        where: { configId },
      }),
    ]);

    // Get the vote status for each comment if user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    let commentVotes: Record<string, number> = {};

    if (session?.user) {
      const votes = await prisma.commentVote.findMany({
        where: {
          userId: session.user.id,
          commentId: {
            in: comments.map((comment) => comment.id),
          },
        },
        select: {
          commentId: true,
          value: true,
        },
      });

      commentVotes = votes.reduce(
        (acc, vote) => ({
          ...acc,
          [vote.commentId]: vote.value,
        }),
        {}
      );
    }

    return NextResponse.json({
      comments,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
      userVotes: commentVotes,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new comment on a config
 * Requires authentication and validates input
 * 
 * @param request - The incoming request object with comment content
 * @param params - Route parameters including the config id
 * @returns NextResponse with the created comment or error
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

    const configId = params.id;
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

    // Validate that the config exists
    const config = await prisma.config.findUnique({
      where: { id: configId },
    });

    if (!config) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        configId,
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

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
