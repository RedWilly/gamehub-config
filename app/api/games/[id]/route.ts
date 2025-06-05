/**
 * API route for specific game operations
 * Handles GET, PATCH, and DELETE requests for a specific game
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/games/[id]
 * Get a specific game by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    
    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            configs: true
          }
        }
      }
    });
    
    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      ...game,
      configCount: game._count.configs
    });
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json(
      { error: "Failed to fetch game" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/games/[id]
 * Update a specific game
 * Requires admin or moderator permissions
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verify authentication and permissions
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Only admins and moderators can update games
    if (session.user.role !== Role.ADMIN && session.user.role !== Role.MODERATOR) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      );
    }
    
    const { id } = params;
    const { name, imageUrl } = await request.json();
    
    // Validate input
    if (!name && !imageUrl) {
      return NextResponse.json(
        { error: "At least one field to update is required" },
        { status: 400 }
      );
    }
    
    // Check if game exists
    const existingGame = await prisma.game.findUnique({
      where: { id }
    });
    
    if (!existingGame) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }
    
    // Update game
    const updatedGame = await prisma.game.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(imageUrl && { imageUrl })
      }
    });
    
    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error("Error updating game:", error);
    return NextResponse.json(
      { error: "Failed to update game" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/games/[id]
 * Delete a specific game
 * Requires admin permissions
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verify authentication and permissions
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Only admins can delete games
    if (session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Admin permissions required" },
        { status: 403 }
      );
    }
    
    const { id } = params;
    
    // Check if game exists
    const existingGame = await prisma.game.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            configs: true
          }
        }
      }
    });
    
    if (!existingGame) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }
    
    // Prevent deletion if game has configs
    if (existingGame._count.configs > 0) {
      return NextResponse.json(
        { error: "Cannot delete game with existing configs" },
        { status: 409 }
      );
    }
    
    // Delete game
    await prisma.game.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: "Game deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting game:", error);
    return NextResponse.json(
      { error: "Failed to delete game" },
      { status: 500 }
    );
  }
}
