/**
 * API Route for fetching a user's vote on a specific configuration
 * GET /api/configs/[id]/vote/user
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET handler to fetch the current user's vote on a configuration
 * 
 * @param request - The incoming request
 * @param params - Route parameters containing config ID
 * @returns API response with the user's vote data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required to fetch vote" },
        { status: 401 }
      );
    }

    const { id: configId } = params;
    const userId = session.user.id;

    // Check if the config exists
    const config = await prisma.config.findUnique({
      where: { id: configId },
      select: { id: true },
    });

    if (!config) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    // Fetch the user's vote on this config
    const vote = await prisma.vote.findUnique({
      where: {
        userId_configId: {
          userId,
          configId,
        },
      },
      select: {
        id: true,
        value: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      vote: vote || null,
    });
  } catch (error) {
    console.error("Error fetching user vote:", error);
    return NextResponse.json(
      { error: "Failed to fetch vote data" },
      { status: 500 }
    );
  }
}
