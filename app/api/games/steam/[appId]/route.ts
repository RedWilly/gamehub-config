/**
 * API route for fetching game data from Steam
 * Gets game information by Steam App ID and optionally caches it
 */

import { NextRequest, NextResponse } from "next/server";
import { getGameInfo } from "@/lib/steam";
import { getOrCreateGame } from "@/lib/services/game-service";
import { auth } from "@/lib/auth";

interface RouteParams {
  params: {
    appId: string;
  };
}

/**
 * GET /api/games/steam/[appId]
 * Fetch game data from Steam by App ID
 * If cache=true, also saves to database
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { appId } = params;
    const { searchParams } = new URL(request.url);
    const cache = searchParams.get("cache") === "true";
    
    // If caching is requested, verify authentication
    if (cache) {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      if (!session) {
        return NextResponse.json(
          { error: "Authentication required to cache game data" },
          { status: 401 }
        );
      }
    }
    
    // If caching, use getOrCreateGame which handles database operations
    if (cache) {
      const game = await getOrCreateGame(appId);
      
      if (!game) {
        return NextResponse.json(
          { error: "Game not found on Steam" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(game);
    }
    
    // Otherwise just fetch from Steam without caching
    const gameInfo = await getGameInfo(appId);
    
    if (!gameInfo) {
      return NextResponse.json(
        { error: "Game not found on Steam" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(gameInfo);
  } catch (error) {
    console.error("Error fetching Steam game data:", error);
    return NextResponse.json(
      { error: "Failed to fetch game data from Steam" },
      { status: 500 }
    );
  }
}
