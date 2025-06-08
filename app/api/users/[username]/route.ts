/**
 * API endpoint for user profile data
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * GET handler for fetching user profile data
 * 
 * @param req - The incoming request object
 * @param params - Route parameters including username
 * @returns NextResponse with the user profile data
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
): Promise<NextResponse> {
  try {
    const { username } = params;
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    // Fetch the user data
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayUsername: true,
        image: true,
        createdAt: true,
        role: true,
        // Don't include sensitive information
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Parse query parameters for pagination
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    // Fetch user's configs with pagination
    const configs = await prisma.config.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        upvotes: true,
        downvotes: true,
        game: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          }
        },
        details: {
          select: {
            gameResolution: true,
            compatLayer: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });
    
    // Get total configs count for pagination
    const totalConfigs = await prisma.config.count({
      where: { userId: user.id }
    });
    
    // Fetch user's recent comments
    const comments = await prisma.comment.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        content: true,
        createdAt: true,
        upvotes: true,
        downvotes: true,
        config: {
          select: {
            id: true,
            slug: true,
            game: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 5, // Just get the 5 most recent comments
    });
    
    // Prepare pagination data
    const pagination = {
      total: totalConfigs,
      pages: Math.ceil(totalConfigs / limit),
      page,
      limit,
    };
    
    // Check if the requesting user is the profile owner
    const isOwnProfile = session?.user?.id === user.id;
    
    return NextResponse.json({
      user,
      configs,
      comments,
      pagination,
      isOwnProfile,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
