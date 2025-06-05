/**
 * API route for game management
 * Handles GET and POST requests for games
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrCreateGame, getAllGames, searchGames } from "@/lib/services/game-service";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

/**
 * GET /api/games
 * Get all games or search games by name
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const query = searchParams.get("query");
    
    // If query is provided, search games by name
    if (query) {
      const result = await searchGames(query, page, limit);
      return NextResponse.json(result);
    }
    
    // Otherwise, get all games
    const result = await getAllGames(page, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/games
 * Create a new game by Steam App ID
 * Requires authentication and appropriate permissions
 */
export async function POST(request: NextRequest) {
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
    
    // Check if user has permission to create games
    // Only admins and moderators can create games directly
    if (session.user.role !== Role.ADMIN && session.user.role !== Role.MODERATOR) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      );
    }
    
    // Parse request body
    const { steamId } = await request.json();
    
    if (!steamId) {
      return NextResponse.json(
        { error: "Steam App ID is required" },
        { status: 400 }
      );
    }
    
    // Get or create game
    const game = await getOrCreateGame(steamId);
    
    if (!game) {
      return NextResponse.json(
        { error: "Failed to fetch or create game" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(game);
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}
